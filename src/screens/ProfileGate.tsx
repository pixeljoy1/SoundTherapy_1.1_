/**
 * ProfileGate — the front door for families.
 * Opens whenever nobody is signed in: offers one-tap continue as the last
 * listener (autologin), switching to any other saved profile, or starting a
 * new listener through onboarding. Nothing is ever deleted by logging out.
 */

import { useMemo } from 'react'
import { GradientCanvas } from '../gradient/GradientCanvas'
import { GradientController } from '../gradient/GradientController'
import { useStore } from '../state/store'
import { AGE_LABEL, GOAL_LABEL, Persisted } from '../state/types'
import { AGE_ACCENT } from '../theme/profileTheme'

function label(p: Persisted) {
  return p.settings.name.trim() || `${AGE_LABEL[p.settings.ageGroup]} listener`
}

export function ProfileGate() {
  const { profiles, lastActiveId, selectProfile, newProfile, persisted } = useStore()
  const controller = useMemo(() => new GradientController('dusk'), [])

  // last listener first — that's the autologin card
  const ordered = useMemo(() => {
    const rest = profiles.filter((p) => p.id !== lastActiveId)
    const last = profiles.find((p) => p.id === lastActiveId)
    return last ? [last, ...rest] : rest
  }, [profiles, lastActiveId])

  return (
    <div className="screen">
      <GradientCanvas controller={controller} psychedelic={0.6} pastel={persisted.settings.theme === 'pastel'} />
      <div style={overlay}>
        <div style={panel}>
          <div className="label reveal d1">ATTUNE · SOUND THERAPY</div>
          <h1 className="serif ink reveal d2" style={{ fontSize: 'clamp(36px, 7vw, 56px)', margin: 0, lineHeight: 1.05 }}>
            Who's listening?
          </h1>
          <p className="reveal d3" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0, maxWidth: 420 }}>
            Attune remembers each listener in the family — their sound, their colors, their pace.
          </p>

          <div className="reveal d4" style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            {ordered.map((p) => {
              const isLast = p.id === lastActiveId
              const accent = AGE_ACCENT[p.persisted.settings.ageGroup].accent
              return (
                <button key={p.id} onClick={() => selectProfile(p.id)} style={card(isLast)}>
                  <span style={{ ...avatar, background: accent }}>
                    {label(p.persisted).charAt(0).toUpperCase()}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                    <span style={{ fontSize: 17 }}>
                      {isLast ? `Continue as ${label(p.persisted)}` : label(p.persisted)}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {AGE_LABEL[p.persisted.settings.ageGroup]} · {GOAL_LABEL[p.persisted.settings.goal]}
                      {isLast ? ' · last listening' : ''}
                    </span>
                  </span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 18 }}>→</span>
                </button>
              )
            })}

            <button onClick={newProfile} style={{ ...card(false), borderStyle: 'dashed' }}>
              <span style={{ ...avatar, background: 'var(--chip)', color: 'var(--text-primary)', border: '1px solid var(--hairline)' }}>+</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                <span style={{ fontSize: 17 }}>New listener</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  A minute of tuning — age, goal, look
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  padding: 24,
  overflowY: 'auto',
}
const panel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 22,
  alignItems: 'flex-start',
  maxWidth: 460,
  width: '100%',
}
const card = (highlight: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  width: '100%',
  padding: '14px 18px',
  borderRadius: 20,
  border: `1px solid ${highlight ? 'var(--accent-line)' : 'var(--hairline)'}`,
  background: highlight ? 'var(--accent-soft)' : 'var(--panel)',
  backdropFilter: 'blur(12px)',
  color: 'var(--text-primary)',
  boxShadow: highlight ? '0 10px 34px -14px var(--accent-glow)' : 'none',
})
const avatar: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontSize: 18,
  fontWeight: 500,
  color: '#0C1018',
  flex: '0 0 auto',
}
