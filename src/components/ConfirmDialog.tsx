/**
 * ConfirmDialog — same calm language as the pause modal (frosted floating card in
 * the center of the bottom half, spring entrance + gentle bob) but for a yes/no
 * choice. Used to confirm ending a session before everything fades out.
 */

import { Pill } from './Pill'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: Props) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        background: open ? 'rgba(8,8,16,0.42)' : 'rgba(8,8,16,0)',
        backdropFilter: open ? 'blur(3px)' : 'blur(0px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'background 360ms ease, backdrop-filter 360ms ease, opacity 300ms ease',
      }}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', bottom: 0, display: 'grid', placeItems: 'center', padding: 16 }}>
        <div
          style={{
            transform: open ? 'translateY(0) scale(1)' : 'translateY(26px) scale(0.9)',
            opacity: open ? 1 : 0,
            transition: 'transform 480ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(440px, 88vw)',
              background: 'var(--panel)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--hairline)',
              borderRadius: 28,
              padding: '28px 26px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 10,
              animation: open ? 'cd-bob 5s ease-in-out infinite' : 'none',
            }}
          >
            <h2 className="serif" style={{ fontSize: 26, margin: 0 }}>
              {title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: '0 0 14px', lineHeight: 1.5 }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <Pill variant="ghost" full onClick={onCancel}>
                {cancelLabel}
              </Pill>
              <Pill full onClick={onConfirm}>
                {confirmLabel}
              </Pill>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes cd-bob { 0%,100% { transform: translateY(-5px); } 50% { transform: translateY(5px); } }
        @media (prefers-reduced-motion: reduce) { [style*="cd-bob"] { animation: none !important; } }
      `}</style>
    </div>
  )
}
