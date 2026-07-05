/**
 * App store — Attune.
 * React context holding persisted prefs (localStorage = Android DataStore) plus
 * ephemeral navigation state. Single source of truth for the whole app.
 *
 * Family profiles: preferences live per-listener in one profiles file. The app
 * opens on a profile gate ("Who's listening?") offering one-tap continue as the
 * last listener, switching to another saved profile, or onboarding a new one.
 * Logging out never deletes anything — it just returns to the gate.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_PERSISTED, Persisted, Screen, Settings, SleepTimer, ThemeRequest } from './types'

const FILE_KEY = 'attune.profiles.v1'
const LEGACY_KEY = 'attune.persisted.v1'

interface ProfilesFile {
  profiles: Record<string, Persisted>
  lastActiveId: string | null
}

const newId = () => `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`

function loadFile(): ProfilesFile {
  try {
    const raw = localStorage.getItem(FILE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ProfilesFile
      const profiles: Record<string, Persisted> = {}
      for (const [id, p] of Object.entries(parsed.profiles ?? {})) {
        profiles[id] = {
          ...DEFAULT_PERSISTED,
          ...p,
          settings: { ...DEFAULT_PERSISTED.settings, ...(p as Persisted).settings },
        }
      }
      return { profiles, lastActiveId: parsed.lastActiveId ?? null }
    }
    // migrate the single-profile era, if someone already onboarded there
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const p = JSON.parse(legacy) as Persisted
      if (p.onboardingComplete) {
        const id = newId()
        return {
          profiles: {
            [id]: { ...DEFAULT_PERSISTED, ...p, settings: { ...DEFAULT_PERSISTED.settings, ...p.settings } },
          },
          lastActiveId: id,
        }
      }
    }
  } catch {
    /* fall through to empty */
  }
  return { profiles: {}, lastActiveId: null }
}

interface StoreShape {
  persisted: Persisted
  // profiles
  profiles: Array<{ id: string; persisted: Persisted }>
  activeId: string | null
  lastActiveId: string | null
  selectProfile: (id: string) => void
  newProfile: () => void
  logout: () => void
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
  // one-time init: existing listeners land on the gate; a brand-new device
  // goes straight into onboarding with a freshly created profile
  const [init] = useState(() => {
    const file = loadFile()
    // only completed profiles count — an abandoned onboarding shouldn't gate anyone
    if (Object.values(file.profiles).some((p) => p.onboardingComplete)) {
      return { file, activeId: null as string | null, screen: 'gate' as Screen }
    }
    const id = newId()
    return {
      file: { profiles: { [id]: DEFAULT_PERSISTED }, lastActiveId: id },
      activeId: id as string | null,
      screen: 'onboarding' as Screen,
    }
  })

  const [file, setFile] = useState<ProfilesFile>(init.file)
  const [activeId, setActiveId] = useState<string | null>(init.activeId)
  const [screen, setScreen] = useState<Screen>(init.screen)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [selectedTimer, setSelectedTimer] = useState<SleepTimer>(
    (activeId ? init.file.profiles[activeId] : DEFAULT_PERSISTED)?.settings.defaultSleepTimer ?? 45,
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const persisted = (activeId && file.profiles[activeId]) || DEFAULT_PERSISTED

  useEffect(() => {
    localStorage.setItem(FILE_KEY, JSON.stringify(file))
  }, [file])

  const fileRef = useRef(file)
  fileRef.current = file
  const activeRef = useRef(activeId)
  activeRef.current = activeId

  /** Update the active profile's persisted blob. */
  const setPersisted = useCallback((fn: (p: Persisted) => Persisted) => {
    const id = activeRef.current
    if (!id) return
    setFile((f) => ({ ...f, profiles: { ...f.profiles, [id]: fn(f.profiles[id] ?? DEFAULT_PERSISTED) } }))
  }, [])

  const patchSettings = useCallback(
    (p: Partial<Settings>) => setPersisted((s) => ({ ...s, settings: { ...s.settings, ...p } })),
    [setPersisted],
  )

  const selectProfile = useCallback((id: string) => {
    const prof = fileRef.current.profiles[id]
    if (!prof) return
    setActiveId(id)
    setFile((f) => ({ ...f, lastActiveId: id }))
    setSelectedTimer(prof.settings.defaultSleepTimer)
    setScreen(prof.onboardingComplete ? 'home' : 'onboarding')
  }, [])

  const newProfile = useCallback(() => {
    const id = newId()
    setFile((f) => ({ ...f, profiles: { ...f.profiles, [id]: DEFAULT_PERSISTED }, lastActiveId: id }))
    setActiveId(id)
    setSelectedTimer(DEFAULT_PERSISTED.settings.defaultSleepTimer)
    setScreen('onboarding')
  }, [])

  const logout = useCallback(() => {
    // drop unfinished onboarding profiles so the gate never lists ghosts
    const id = activeRef.current
    if (id && !fileRef.current.profiles[id]?.onboardingComplete) {
      setFile((f) => {
        const profiles = { ...f.profiles }
        delete profiles[id]
        return { profiles, lastActiveId: f.lastActiveId === id ? null : f.lastActiveId }
      })
    }
    setActiveId(null)
    setSettingsOpen(false)
    setScreen('gate')
  }, [])

  const value = useMemo<StoreShape>(
    () => ({
      persisted,
      profiles: Object.entries(file.profiles)
        .map(([id, p]) => ({ id, persisted: p }))
        .filter((e) => e.persisted.onboardingComplete),
      activeId,
      lastActiveId: file.lastActiveId,
      selectProfile,
      newProfile,
      logout,
      screen,
      selectedSessionId,
      selectedTimer,
      settingsOpen,
      go: setScreen,
      selectSession: (id) => {
        setSelectedSessionId(id)
        const active = activeRef.current ? fileRef.current.profiles[activeRef.current] : null
        setSelectedTimer(active?.settings.defaultSleepTimer ?? 45)
      },
      setTimer: setSelectedTimer,
      openSettings: setSettingsOpen,
      openPayment: setPaymentOpen,
      paymentOpen,
      patchSettings,
      setOnboardingComplete: (v) => setPersisted((s) => ({ ...s, onboardingComplete: v })),
      setPremium: (v) => setPersisted((s) => ({ ...s, premium: v })),
      markPlayed: (id) => setPersisted((s) => ({ ...s, lastPlayedId: id })),
      addRequest: (req) => setPersisted((s) => ({ ...s, requests: [req, ...s.requests] })),
      removeRequest: (id) => setPersisted((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) })),
    }),
    [
      persisted,
      file,
      activeId,
      selectProfile,
      newProfile,
      logout,
      screen,
      selectedSessionId,
      selectedTimer,
      settingsOpen,
      paymentOpen,
      patchSettings,
      setPersisted,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used within StoreProvider')
  return v
}
