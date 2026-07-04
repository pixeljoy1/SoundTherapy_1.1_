/**
 * App store — Drift spec §9.
 * React context holding persisted prefs (localStorage = Android DataStore) plus
 * ephemeral navigation state. Single source of truth for the whole app.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_PERSISTED, Persisted, Screen, Settings, SleepTimer, ThemeRequest } from './types'

const KEY = 'attune.persisted.v1'

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_PERSISTED
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_PERSISTED,
      ...parsed,
      settings: { ...DEFAULT_PERSISTED.settings, ...(parsed.settings ?? {}) },
    }
  } catch {
    return DEFAULT_PERSISTED
  }
}

interface StoreShape {
  persisted: Persisted
  // navigation
  screen: Screen
  selectedSessionId: string | null
  selectedTimer: SleepTimer
  settingsOpen: boolean
  // actions
  go: (screen: Screen) => void
  selectSession: (id: string) => void
  setTimer: (t: SleepTimer) => void
  openSettings: (open: boolean) => void
  openPayment: (open: boolean) => void
  paymentOpen: boolean
  patchSettings: (p: Partial<Settings>) => void
  setOnboardingComplete: (v: boolean) => void
  setPremium: (v: boolean) => void
  markPlayed: (id: string) => void
  addRequest: (req: ThemeRequest) => void
  removeRequest: (id: string) => void
}

const Ctx = createContext<StoreShape | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [persisted, setPersisted] = useState<Persisted>(load)
  const [screen, setScreen] = useState<Screen>(() =>
    load().onboardingComplete ? 'home' : 'onboarding',
  )
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [selectedTimer, setSelectedTimer] = useState<SleepTimer>(persisted.settings.defaultSleepTimer)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  // Persist on change (debounced via microtask coalescing).
  const persistRef = useRef(persisted)
  persistRef.current = persisted
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(persisted))
  }, [persisted])

  const patchSettings = useCallback((p: Partial<Settings>) => {
    setPersisted((s) => ({ ...s, settings: { ...s.settings, ...p } }))
  }, [])

  const value = useMemo<StoreShape>(
    () => ({
      persisted,
      screen,
      selectedSessionId,
      selectedTimer,
      settingsOpen,
      go: setScreen,
      selectSession: (id) => {
        setSelectedSessionId(id)
        setSelectedTimer(persistRef.current.settings.defaultSleepTimer)
      },
      setTimer: setSelectedTimer,
      openSettings: setSettingsOpen,
      openPayment: setPaymentOpen,
      paymentOpen,
      patchSettings,
      setOnboardingComplete: (v) =>
        setPersisted((s) => ({ ...s, onboardingComplete: v })),
      setPremium: (v) => setPersisted((s) => ({ ...s, premium: v })),
      markPlayed: (id) => setPersisted((s) => ({ ...s, lastPlayedId: id })),
      addRequest: (req) => setPersisted((s) => ({ ...s, requests: [req, ...s.requests] })),
      removeRequest: (id) => setPersisted((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) })),
    }),
    [persisted, screen, selectedSessionId, selectedTimer, settingsOpen, paymentOpen, patchSettings],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used within StoreProvider')
  return v
}
