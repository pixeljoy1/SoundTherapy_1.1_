/**
 * App — top-level shell & navigation (spec §7.3 flow).
 * Home → Pre-Play → Active Session → (fade) → Home.
 *
 * The full-screen GradientCanvas is mounted once for both Pre-Play and Session so
 * the gradient *continues* across the transition with no break (§8.2). The active
 * session's per-frame sampler is injected via a ref so the canvas never remounts.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GradientCanvas } from './gradient/GradientCanvas'
import { GradientController } from './gradient/GradientController'
import { Onboarding } from './screens/Onboarding'
import { ProfileGate } from './screens/ProfileGate'
import { Home } from './screens/Home'
import { PrePlay } from './screens/PrePlay'
import { ActiveSession } from './screens/ActiveSession'
import { Settings } from './screens/Settings'
import { Paywall } from './screens/Paywall'
import { PaymentSheet } from './components/PaymentSheet'
import { Banner } from './components/Banner'
import { useStore } from './state/store'
import { useSession, SessionRuntime } from './state/useSession'
import { Session } from './session/types'
import { byId, CATALOG } from './session/catalog'
import { audioEngine } from './audio/AudioEngine'
import { effectivePalette, isLocked, prefersReducedMotion } from './state/util'
import { SleepTimer, TherapyGoal } from './state/types'
import { applyProfileTheme } from './theme/profileTheme'

/** Onboarding goal → the session that best delivers it (all free tier). */
const GOAL_SESSION: Record<TherapyGoal, string> = {
  sleep: 'drift',
  focus: 'asmr-forest',
  stress: 'forest-breathe',
  mood: 'sacred-om',
}

type SampleFn = SessionRuntime['sample']

export default function App() {
  const store = useStore()
  const { screen, go, selectSession, selectedSessionId, persisted, selectedTimer, markPlayed } = store
  const controller = useMemo(() => new GradientController('dusk'), [])
  const reduce = useMemo(() => prefersReducedMotion(), [])
  const pastel = persisted.settings.theme === 'pastel'

  // apply the theme to the document so the CSS variables switch app-wide
  useEffect(() => {
    document.documentElement.dataset.theme = persisted.settings.theme
  }, [persisted.settings.theme])

  // profile-reactive art direction: age + goal re-tint the whole interface
  useEffect(() => {
    applyProfileTheme(persisted.settings.ageGroup, persisted.settings.goal)
  }, [persisted.settings.ageGroup, persisted.settings.goal])

  const [lockedSession, setLockedSession] = useState<Session | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const sampleRef = useRef<SampleFn | null>(null)
  const previewTimer = useRef<number | null>(null)

  const selected = selectedSessionId ? byId(selectedSessionId) : null

  const showBanner = useCallback((text: string) => {
    setBanner(text)
    window.setTimeout(() => setBanner((b) => (b === text ? null : b)), 4000)
  }, [])

  // ── navigation handlers ────────────────────────────────────
  const handleSelect = useCallback(
    (s: Session) => {
      selectSession(s.id)
      controller.setPalette(effectivePalette(s, persisted.settings))
      go('preplay')
    },
    [selectSession, controller, persisted.settings, go],
  )

  const handlePreview = useCallback(
    (s: Session) => {
      // §7.2 long-press → 10s audio preview. Gradient continuity stays on the
      // Pre-Play/Session canvases; here we surface the sound + a hint.
      audioEngine.play(s.track, s.sound.breathCycle)
      showBanner(`Previewing ${s.title}`)
      if (previewTimer.current) clearTimeout(previewTimer.current)
      previewTimer.current = window.setTimeout(() => audioEngine.fadeOut(1.5), 10_000)
    },
    [showBanner],
  )

  const handleLocked = useCallback((s: Session) => setLockedSession(s), [])

  // "Decide for me" — pick a calming sleep theme and drop straight into it.
  const handleAutoStart = useCallback(() => {
    const pool = CATALOG.filter((s) => s.group === 'sleep' && !isLocked(s))
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? byId('drift')!
    if (previewTimer.current) clearTimeout(previewTimer.current)
    audioEngine.stop()
    selectSession(pick.id)
    controller.setPalette(effectivePalette(pick, persisted.settings))
    markPlayed(pick.id)
    go('session')
  }, [persisted.premium, persisted.settings, selectSession, controller, markPlayed, go])

  const beginSession = useCallback(() => {
    if (!selected) return
    if (previewTimer.current) clearTimeout(previewTimer.current)
    audioEngine.stop()
    markPlayed(selected.id)
    go('session')
  }, [selected, markPlayed, go])

  const backHome = useCallback(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current)
    audioEngine.stop()
    go('home')
  }, [go])

  const onboardingDone = useCallback(
    (goal: TherapyGoal) => {
      const first = byId(GOAL_SESSION[goal]) ?? byId('drift')!
      handleSelect(first)
    },
    [handleSelect],
  )

  // §11 low-battery banner (best-effort; Battery API where available).
  useEffect(() => {
    let cancelled = false
    ;(navigator as any).getBattery?.().then((bat: any) => {
      const check = () => {
        if (!cancelled && bat.level < 0.15 && !bat.charging) {
          showBanner('Low battery. Plugging in helps.')
        }
      }
      check()
      bat.addEventListener('levelchange', check)
    })
    return () => {
      cancelled = true
    }
  }, [showBanner])

  const stableSample = useCallback(
    () => sampleRef.current?.() ?? { dim: 1, driftScale: 1, breath: 0.5 },
    [],
  )

  // Buttery page-to-page fade: the displayed screen lags the target while it
  // fades out, then swaps and fades the new one in. The gradient base layer
  // follows `display` so it stays continuous across Pre-Play ↔ Session.
  const { display, visible } = useScreenFade(screen)
  const showGradient = display === 'preplay' || display === 'session'

  return (
    <div className="app-frame">
      {showGradient && (
        <GradientCanvas
          controller={controller}
          reduceMotion={reduce}
          sample={display === 'session' ? stableSample : undefined}
          // bright psychedelic field while choosing (Pre-Play); calm in session
          psychedelic={display === 'preplay' ? 0.85 : 0}
          pastel={pastel}
        />
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: visible ? 1 : 0,
          transition: 'opacity 260ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {display === 'gate' && <ProfileGate />}

        {display === 'onboarding' && <Onboarding onDone={onboardingDone} />}

        {display === 'home' && (
          <Home
            onSelect={handleSelect}
            onPreview={handlePreview}
            onLocked={handleLocked}
            onAutoStart={handleAutoStart}
          />
        )}

        {display === 'preplay' && selected && (
          <PrePlay session={selected} onBegin={beginSession} onBack={backHome} />
        )}

        {display === 'session' && selected && (
          <SessionLayer session={selected} timer={selectedTimer} sampleRef={sampleRef} onExit={backHome} />
        )}
      </div>

      <Settings />
      <PaymentSheet />
      <Paywall
        session={lockedSession}
        onClose={() => setLockedSession(null)}
        onUnlock={() => {
          setLockedSession(null)
          store.openPayment(true)
        }}
      />
      {banner && <Banner text={banner} />}
    </div>
  )
}

/**
 * useScreenFade — cross-fade screens. Keeps the outgoing screen mounted while it
 * fades to 0, then swaps in the new screen and fades it back to 1.
 */
function useScreenFade(screen: string) {
  const [display, setDisplay] = useState(screen)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (screen === display) return
    setVisible(false)
    const t = window.setTimeout(() => {
      setDisplay(screen)
      setVisible(true)
    }, 240)
    return () => clearTimeout(t)
  }, [screen, display])
  return { display, visible }
}

/**
 * SessionLayer — mounted only during an active session so useSession's lifecycle
 * matches the session. Publishes its per-frame sampler to the shared canvas.
 */
function SessionLayer({
  session,
  timer,
  sampleRef,
  onExit,
}: {
  session: Session
  timer: SleepTimer
  sampleRef: React.MutableRefObject<SampleFn | null>
  onExit: () => void
}) {
  const runtime = useSession({ session, timer, onExit })
  useEffect(() => {
    sampleRef.current = runtime.sample
    return () => {
      sampleRef.current = null
    }
  }, [runtime.sample, sampleRef])
  return <ActiveSession session={session} runtime={runtime} />
}
