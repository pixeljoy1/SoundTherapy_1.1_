/**
 * SoundToggle — the speaker icon from the intro, retained as a sound on/off
 * button. When off it shows a muted speaker; the equalizer freezes accordingly.
 */

import { haptic } from '../state/util'

export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const c = { stroke: on ? 'var(--accent)' : 'var(--text-secondary)', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <button
      aria-label={on ? 'Sound on' : 'Sound off'}
      onClick={(e) => {
        e.stopPropagation()
        haptic.light()
        onToggle()
      }}
      style={{ display: 'grid', placeItems: 'center', width: 44, height: 44 }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24">
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill={on ? 'var(--accent)' : 'var(--text-secondary)'} stroke="none" />
        {on ? (
          <>
            <path d="M16.5 8.5a5 5 0 010 7" {...c} />
            <path d="M19 6a9 9 0 010 12" {...c} />
          </>
        ) : (
          <line x1="16" y1="9" x2="21" y2="15" {...c} />
        )}
        {!on && <line x1="21" y1="9" x2="16" y2="15" {...c} />}
      </svg>
    </button>
  )
}
