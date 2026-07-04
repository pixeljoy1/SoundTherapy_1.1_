/**
 * ThemeToggle — switch between the dark theme and the pastel (light) theme.
 * A small frosted pill with a sun/moon glyph. Reads/writes settings.theme.
 */

import { useStore } from '../state/store'
import { haptic } from '../state/util'

export function ThemeToggle() {
  const { persisted, patchSettings } = useStore()
  const pastel = persisted.settings.theme === 'pastel'
  return (
    <button
      aria-label={pastel ? 'Switch to dark theme' : 'Switch to pastel theme'}
      onClick={() => {
        haptic.light()
        patchSettings({ theme: pastel ? 'dark' : 'pastel' })
      }}
      style={{
        width: 40,
        height: 40,
        borderRadius: 100,
        background: 'rgba(127,92,230,0.16)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(167,139,250,0.45)',
        color: 'var(--accent)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 16,
      }}
    >
      {pastel ? '☾' : '☀'}
    </button>
  )
}
