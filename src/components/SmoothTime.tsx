/**
 * SmoothTime — a soft, non-digital clock.
 * Each character cross-dissolves when it changes: the outgoing glyph fades and
 * drifts down while the incoming one fades and drifts in from above. Both
 * directions animate (a true dissolve, not a snap), giving seconds a calm melt.
 * Used for the large session countdown (§8.3).
 */

import { useEffect, useState } from 'react'
import { clock } from '../state/util'

function Cell({ ch, width, dur }: { ch: string; width: string; dur: number }) {
  const [s, setS] = useState({ cur: ch, prev: null as string | null, n: 0 })
  useEffect(() => {
    setS((p) => (p.cur === ch ? p : { cur: ch, prev: p.cur, n: p.n + 1 }))
  }, [ch])

  return (
    <span style={{ position: 'relative', display: 'inline-block', width, height: '1em', textAlign: 'center' }}>
      {s.prev !== null && (
        <span
          key={`p${s.n}`}
          style={{ position: 'absolute', left: 0, right: 0, animation: `tk-out ${dur}ms cubic-bezier(0.4,0,0.2,1) forwards` }}
        >
          {s.prev}
        </span>
      )}
      <span
        key={`c${s.n}`}
        style={{ position: 'absolute', left: 0, right: 0, animation: s.n > 0 ? `tk-in ${dur}ms cubic-bezier(0.4,0,0.2,1) forwards` : undefined }}
      >
        {s.cur}
      </span>
    </span>
  )
}

export function SmoothTime({
  seconds,
  size = 48,
  opacity = 1,
  glow = false,
  dur = 700,
}: {
  seconds: number
  size?: number
  opacity?: number
  glow?: boolean
  dur?: number
}) {
  const text = clock(seconds)
  return (
    <span
      className="serif"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontSize: size,
        lineHeight: 1,
        opacity,
        transition: 'opacity 1s linear',
        // a very slight calming glow
        textShadow: glow
          ? '0 0 28px rgba(167,139,250,0.38), 0 0 10px rgba(240,238,248,0.18)'
          : undefined,
      }}
      aria-label={`${text}`}
    >
      {text.split('').map((ch, i) => (
        <Cell key={i} ch={ch} width={ch === ':' ? '0.34em' : '0.62em'} dur={dur} />
      ))}
      <style>{`
        @keyframes tk-in  { from { opacity: 0; transform: translateY(-0.22em); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tk-out { from { opacity: 1; transform: translateY(0);       } to { opacity: 0; transform: translateY(0.22em); } }
        @media (prefers-reduced-motion: reduce) {
          [style*="tk-in"], [style*="tk-out"] { animation-duration: 1ms !important; }
        }
      `}</style>
    </span>
  )
}
