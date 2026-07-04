/**
 * Settings — simplified. Just the essentials: who you are, the look, how long,
 * and the prototype premium unlock. Swipe the sheet down to dismiss.
 */

import { Sheet } from '../components/Sheet'
import { useStore } from '../state/store'
import { PALETTE_ORDER, PALETTES } from '../theme/palettes'
import { AGE_LABEL, GOAL_LABEL, TIMER_OPTIONS } from '../state/types'
import { timerLabel } from '../state/util'

export function Settings() {
  const { settingsOpen, openSettings, openPayment, persisted, patchSettings, setPremium } = useStore()
  const s = persisted.settings

  return (
    <Sheet open={settingsOpen} onClose={() => openSettings(false)} title="Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Row label="Your name">
          <input
            value={s.name}
            onChange={(e) => patchSettings({ name: e.target.value })}
            placeholder="—"
            style={textInput}
          />
        </Row>

        <Row label="Age group">
          <select
            value={s.ageGroup}
            onChange={(e) => patchSettings({ ageGroup: e.target.value as any })}
            style={select}
          >
            {(Object.keys(AGE_LABEL) as (keyof typeof AGE_LABEL)[]).map((a) => (
              <option key={a} value={a}>
                {AGE_LABEL[a]}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Goal">
          <select
            value={s.goal}
            onChange={(e) => patchSettings({ goal: e.target.value as any })}
            style={select}
          >
            {(Object.keys(GOAL_LABEL) as (keyof typeof GOAL_LABEL)[]).map((g) => (
              <option key={g} value={g}>
                {GOAL_LABEL[g]}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Theme">
          <select
            value={s.theme}
            onChange={(e) => patchSettings({ theme: e.target.value as any })}
            style={select}
          >
            <option value="dark">Dark</option>
            <option value="pastel">Pastel</option>
          </select>
        </Row>

        <Row label="Palette">
          <select
            value={s.preferredPalette}
            onChange={(e) => patchSettings({ preferredPalette: e.target.value as any })}
            style={select}
          >
            <option value="auto">Auto</option>
            {PALETTE_ORDER.map((p) => (
              <option key={p} value={p}>
                {PALETTES[p].name}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Default session timer">
          <select
            value={String(s.defaultSleepTimer)}
            onChange={(e) =>
              patchSettings({
                defaultSleepTimer: e.target.value === 'infinite' ? 'infinite' : Number(e.target.value),
              })
            }
            style={select}
          >
            {TIMER_OPTIONS.map((t) => (
              <option key={String(t)} value={String(t)}>
                {timerLabel(t)}
              </option>
            ))}
          </select>
        </Row>

        {persisted.premium ? (
          <Row label="Attune Premium">
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--accent)' }}>✓ Active</span>
              <button onClick={() => setPremium(false)} style={{ fontSize: 11, color: 'var(--text-ghost)' }}>
                reset
              </button>
            </span>
          </Row>
        ) : (
          <button
            onClick={() => {
              openSettings(false)
              openPayment(true)
            }}
            style={goPremium}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>Go Premium</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Full sessions & all themes</span>
            </span>
            <span className="serif" style={{ fontSize: 22 }}>₹99</span>
          </button>
        )}
      </div>

      <a
        href="https://github.com/pixeljoy1/SoundTherapy_1.1_/releases/download/android/attune.apk"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 20,
          minHeight: 46,
          borderRadius: 100,
          background: 'var(--chip)',
          border: '1px solid var(--hairline)',
          color: 'var(--text-primary)',
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        ⤓ Download Android app (.apk)
      </a>

      <p style={{ fontSize: 11, color: 'var(--text-ghost)', margin: '14px 0 0', textAlign: 'center' }}>
        No ads. Ever. Your calm is sacred.
      </p>
    </Sheet>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontSize: 16, color: 'var(--text-primary)' }}>{label}</span>
      {children}
    </div>
  )
}

const goPremium: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '14px 16px',
  borderRadius: 16,
  background: 'rgba(167,139,250,0.14)',
  border: '1px solid rgba(167,139,250,0.4)',
  color: 'var(--text-primary)',
}

const select: React.CSSProperties = {
  background: 'var(--chip)',
  border: '1px solid var(--hairline)',
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
}
const textInput: React.CSSProperties = {
  background: 'var(--chip)',
  border: '1px solid var(--hairline)',
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 14,
  textAlign: 'right',
  width: 160,
  outline: 'none',
}
