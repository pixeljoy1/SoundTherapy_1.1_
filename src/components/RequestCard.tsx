/** A logged theme request shown on the homepage (pending review). Long-press to remove. */

import { useRef } from 'react'
import { ThemeRequest } from '../state/types'
import { radius } from '../theme/tokens'
import { haptic } from '../state/util'

export function RequestCard({ req, onLongPress }: { req: ThemeRequest; onLongPress: (r: ThemeRequest) => void }) {
  const timer = useRef<number | null>(null)
  const start = () => {
    timer.current = window.setTimeout(() => {
      haptic.medium()
      onLongPress(req)
    }, 500)
  }
  const end = () => {
    if (timer.current) clearTimeout(timer.current)
  }
  return (
    <div
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      style={{
        position: 'relative',
        width: '100%',
        height: 116,
        borderRadius: radius.card,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(167,139,250,0.10), rgba(15,15,30,0.5))',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <span
        className="label"
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          color: 'var(--accent)',
          fontSize: 11,
        }}
      >
        ◷ Requested
      </span>
      <span className="serif" style={{ fontSize: 20, lineHeight: 1.05 }}>
        {req.name}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
        {req.mood ? req.mood : 'Pending review'}
      </span>
      <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'var(--text-ghost)' }}>
        hold to remove
      </span>
    </div>
  )
}
