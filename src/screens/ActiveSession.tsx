/**
 * Active Session — Drift spec §8.3 (immersive) + §8.5 (breathwork special case).
 * Default state: only the timer + sleep-timer label. Tap summons the control
 * overlay (auto-hides in 4s). Breathwork swaps the clock for a BreathRing.
 */

import { useEffect, useState } from 'react'
import { Session } from '../session/types'
import { SessionRuntime } from '../state/useSession'
import { ControlOverlay } from '../components/ControlOverlay'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { SessionIntro } from '../components/SessionIntro'
import { WindDown } from '../components/WindDown'
import { BreathRing } from '../components/BreathRing'
import { Equalizer } from '../components/Equalizer'
import { SoundToggle } from '../components/SoundToggle'
import { ThemeToggle } from '../components/ThemeToggle'
import { SmoothTime } from '../components/SmoothTime'
import { Stars } from '../components/Stars'
import { Subtitles } from '../components/Subtitles'
import { breathStateAt } from '../session/BreathController'
import { audioEngine } from '../audio/AudioEngine'
import { color } from '../theme/tokens'

export function ActiveSession({ session, runtime }: { session: Session; runtime: SessionRuntime }) {
  const [overlay, setOverlay] = useState(false)
  const [hint, setHint] = useState(true)
  const [soundOn, setSoundOn] = useState(true)
  const [intro, setIntro] = useState(true)
  const [endConfirm, setEndConfirm] = useState(false)
  const isBreath = !!session.breath

  // The control modal is also the pause state: opening it pauses the session
  // (audio + countdown); dismissing resumes. The in-modal button still toggles.
  const summon = () => {
    setOverlay(true)
    if (!runtime.paused) runtime.togglePause()
  }
  const dismiss = () => {
    setOverlay(false)
    if (runtime.paused) runtime.togglePause()
  }

  // Teach the interaction: show a brief hint at session start, then fade it.
  useEffect(() => {
    const t = window.setTimeout(() => setHint(false), 4500)
    return () => clearTimeout(t)
  }, [])

  // breathwork ring needs a smooth tick; cheap rAF only when breathing.
  const [, force] = useState(0)
  useEffect(() => {
    if (!isBreath) return
    let raf = 0
    const loop = () => {
      force((n) => n + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isBreath])

  // Big timer is a COUNTDOWN of the sleep timer; for "Until I stop it" it counts
  // up the elapsed time (there's no target to count toward).
  const countdown = runtime.sleepRemainingSec
  const bigSeconds = countdown == null ? runtime.elapsedSec : countdown
  const sleepLabel = countdown == null ? 'Until you stop it' : '◉ until gentle fade'
  const winding = runtime.windingDown
  const fadeControls: React.CSSProperties = {
    opacity: winding ? 0 : 1,
    pointerEvents: winding ? 'none' : 'auto',
    transition: 'opacity 1600ms ease',
  }

  return (
    <div className="screen" onClick={winding ? undefined : overlay ? dismiss : summon}>
      {/* Theme setter (dark / pastel) — left of End */}
      <div style={{ position: 'absolute', top: 14, right: 110, zIndex: 35, ...fadeControls }} onClick={(e) => e.stopPropagation()}>
        <ThemeToggle />
      </div>

      {/* Always-visible exit — labeled so it can't be missed. */}
      <button
        aria-label="End session"
        onClick={(e) => {
          e.stopPropagation()
          if (!runtime.paused) runtime.togglePause()
          setEndConfirm(true)
        }}
        style={{ ...endBtn, ...fadeControls }}
      >
        <span style={{ fontSize: 14 }}>✕</span>
        <span>End</span>
      </button>

      {session.stars && <Stars opacity={(winding ? 0 : 1) * (0.7 + 0.3 * runtime.timerOpacity)} />}

      <div style={{ ...center, opacity: winding ? 0 : 1, transition: 'opacity 2600ms ease' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          {session.subtitles && (
            <Subtitles lines={session.subtitles} opacity={0.7 + 0.3 * runtime.timerOpacity} />
          )}
          {isBreath ? (
            <BreathRing state={breathStateAt(session.breath!, runtime.elapsedSec)} accent={color.accent} />
          ) : (
            <SmoothTime seconds={bigSeconds} size={84} glow opacity={runtime.timerOpacity} />
          )}
          {/* During start-up the 'easing in' indicator occupies this slot; once it
              drifts away the equalizer fades in (nudged down slightly for breathing room). */}
          {intro ? (
            <SessionIntro onDone={() => setIntro(false)} />
          ) : (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                marginTop: 6,
                animation: 'eq-in 900ms cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              {/* retained speaker = sound on/off; the equalizer responds */}
              <SoundToggle
                on={soundOn}
                onToggle={() => {
                  const next = !soundOn
                  setSoundOn(next)
                  audioEngine.setMuted(!next)
                }}
              />
              <div style={{ opacity: 0.85 + 0.15 * runtime.timerOpacity, transition: 'opacity 360ms ease' }}>
                <Equalizer opacity={1} width={300} height={56} running={soundOn} />
              </div>
            </div>
          )}
        </div>
      </div>

      {!isBreath && !winding && (
        <div style={sleepRow}>
          <span className="label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {sleepLabel}
          </span>
        </div>
      )}

      {/* wind-down supporting messages (tuned to the session type) */}
      {winding && <WindDown group={session.group} durationMs={runtime.blackoutMs} />}

      {runtime.statusNote && (
        <div style={statusRow}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{runtime.statusNote}</span>
        </div>
      )}

      {/* fading first-run hint */}
      {hint && !overlay && !winding && (
        <div style={hintRow}>
          <span style={{ fontSize: 12, color: 'var(--text-ghost)', animation: 'hint-fade 4.5s ease forwards' }}>
            Tap anywhere for controls · “End” to stop
          </span>
        </div>
      )}

      <ControlOverlay
        open={overlay}
        paused={runtime.paused}
        volume={runtime.volume}
        onTogglePause={runtime.togglePause}
        onVolume={runtime.setVolume}
        onAddTime={runtime.addTen}
        onEnd={() => {
          setOverlay(false)
          setEndConfirm(true)
        }}
      />

      {/* End-session confirmation — same calm language as the pause modal */}
      <ConfirmDialog
        open={endConfirm}
        title="End session?"
        message="We'll gently fade the sound and the light, then take you home."
        confirmLabel="End"
        cancelLabel="Stay"
        onConfirm={() => {
          setEndConfirm(false)
          runtime.endSession()
        }}
        onCancel={() => {
          setEndConfirm(false)
          if (runtime.paused) runtime.togglePause()
        }}
      />

      {/* fade-to-black overlay (§5.3 / §8.3) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
          opacity: runtime.blackout,
          transition: `opacity ${runtime.blackout ? runtime.blackoutMs : 0}ms linear`,
          pointerEvents: runtime.blackout ? 'auto' : 'none',
          zIndex: 40,
        }}
      />
      <style>{`
        @keyframes hint-fade { 0%,70% { opacity: 1 } 100% { opacity: 0 } }
        @keyframes eq-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

const endBtn: React.CSSProperties = {
  position: 'absolute',
  top: 14,
  right: 16,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  height: 40,
  padding: '0 16px',
  borderRadius: 100,
  background: 'rgba(167,139,250,0.16)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(167,139,250,0.5)',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontWeight: 400,
  zIndex: 35,
}
const hintRow: React.CSSProperties = {
  position: 'absolute',
  bottom: 18,
  left: 0,
  right: 0,
  textAlign: 'center',
  pointerEvents: 'none',
}

const center: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
}
const sleepRow: React.CSSProperties = {
  position: 'absolute',
  bottom: 40,
  left: 0,
  right: 0,
  textAlign: 'center',
}
const statusRow: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  left: 0,
  right: 0,
  textAlign: 'center',
}
