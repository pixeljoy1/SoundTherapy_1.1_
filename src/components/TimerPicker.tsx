/**
 * TimerPicker — Drift spec §8.2 / §6.2, with the freemium gate.
 * The 30-second trial is free for everyone; 5 min and up is Pro. For non-premium
 * users, Pro options show a badge and tapping them opens the payment gateway.
 */

import { TIMER_OPTIONS, SleepTimer } from '../state/types'
import { timerLabel, haptic, isProTimer } from '../state/util'
import { radius } from '../theme/tokens'

interface Props {
  value: SleepTimer
  onChange: (t: SleepTimer) => void
  premium: boolean
  onProSelect: () => void
}

export function TimerPicker({ value, onChange, premium, onProSelect }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup" aria-label="Sleep timer">
      {TIMER_OPTIONS.map((t) => {
        const pro = !premium && isProTimer(t)
        const selected = value === t
        return (
          <button
            key={String(t)}
            role="radio"
            aria-checked={selected}
            onClick={() => {
              haptic.light()
              if (pro) onProSelect()
              else onChange(t)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 44,
              padding: '0 18px',
              borderRadius: radius.pill,
              background: selected ? 'rgba(167,139,250,0.16)' : 'rgba(127,127,150,0.06)',
              border: `1px solid ${selected ? 'var(--accent)' : 'var(--hairline)'}`,
              color: 'var(--text-primary)',
              transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--text-ghost)'}`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
            </span>
            <span style={{ fontSize: 16 }}>{timerLabel(t)}</span>
            {pro && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  color: 'var(--accent)',
                  background: 'rgba(167,139,250,0.14)',
                  border: '1px solid rgba(167,139,250,0.4)',
                  borderRadius: 100,
                  padding: '2px 8px',
                }}
              >
                PRO
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
