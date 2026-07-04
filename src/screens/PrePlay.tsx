/**
 * Pre-Play — Drift spec §8.2.
 * Gradient already runs live (shared controller from App — continues into session,
 * no break). Title + duration + descriptor, timer radio pills, single Begin action.
 * Back arrow / swipe-left dismisses.
 */

import { useEffect } from 'react'
import { Session } from '../session/types'
import { TimerPicker } from '../components/TimerPicker'
import { Pill } from '../components/Pill'
import { useStore } from '../state/store'
import { PALETTES } from '../theme/palettes'
import { effectivePalette, isProTimer } from '../state/util'

export function PrePlay({
  session,
  onBegin,
  onBack,
}: {
  session: Session
  onBegin: () => void
  onBack: () => void
}) {
  const { persisted, selectedTimer, setTimer, openPayment } = useStore()
  const palette = PALETTES[effectivePalette(session, persisted.settings)]

  // non-premium users default to the free 30-second trial
  useEffect(() => {
    if (!persisted.premium && isProTimer(selectedTimer)) setTimer(0.5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persisted.premium])

  const begin = () => {
    if (!persisted.premium && isProTimer(selectedTimer)) openPayment(true)
    else onBegin()
  }

  return (
    <div className="screen">
      {/* gradient is rendered by App at the base layer */}
      <button onClick={onBack} aria-label="Back to home" style={backBtn}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
        <span>Home</span>
      </button>

      <div style={scroll}>
        <div style={card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 className="serif" style={{ fontSize: 40, margin: 0, lineHeight: 1.05 }}>
              {session.title}
            </h1>
            <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>{session.durationMin} min</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{palette.descriptor}</div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 12 }}>
              Session Timer
            </div>
            <TimerPicker
            value={selectedTimer}
            onChange={setTimer}
            premium={persisted.premium}
            onProSelect={() => openPayment(true)}
          />
          </div>

          <Pill onClick={begin} full>
            {!persisted.premium && isProTimer(selectedTimer) ? 'Unlock with Premium' : 'Begin Session'}
          </Pill>
        </div>
      </div>
    </div>
  )
}

const backBtn: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 20,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 40,
  padding: '0 16px',
  borderRadius: 100,
  background: 'var(--panel)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--hairline)',
  fontSize: 15,
  color: 'var(--text-primary)',
  zIndex: 10,
}
const scroll: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  overflowY: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '72px 24px 28px',
}
// Frosted card keeps content legible over the live gradient; centered, capped width,
// stacks naturally on any screen.
const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 440,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: 24,
  borderRadius: 24,
  background: 'var(--panel)',
  backdropFilter: 'blur(16px)',
  border: '1px solid var(--hairline)',
}
