/** Empty "+" card that opens the new-theme request form. */

import { radius } from '../theme/tokens'
import { haptic } from '../state/util'

export function AddThemeCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={() => {
        haptic.light()
        onClick()
      }}
      style={{
        width: '100%',
        height: 116,
        borderRadius: radius.card,
        background: 'rgba(255,255,255,0.02)',
        border: '1.5px dashed rgba(167,139,250,0.4)',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
      onPointerDown={(e) => (e.currentTarget.style.background = 'rgba(167,139,250,0.08)')}
      onPointerUp={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onPointerLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
    >
      <span style={{ fontSize: 26, color: 'var(--accent)', lineHeight: 1 }}>＋</span>
      <span className="label">Request a theme</span>
    </button>
  )
}
