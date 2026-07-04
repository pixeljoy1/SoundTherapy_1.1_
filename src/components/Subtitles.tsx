/**
 * Subtitles — recycling mindful sayings for chant sessions.
 * Cycles through the lines every ~8s with a slow, buttery fade (in, hold, out).
 * Multi-line strings (saying + attribution) are supported via "\n".
 */

import { useEffect, useState } from 'react'

export function Subtitles({ lines, opacity = 1 }: { lines: string[]; opacity?: number }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (lines.length <= 1) return
    const id = window.setInterval(() => setI((n) => (n + 1) % lines.length), 8000)
    return () => clearInterval(id)
  }, [lines])

  const parts = lines[i].split('\n')

  return (
    <div
      style={{
        minHeight: 96,
        maxWidth: 560,
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        opacity,
      }}
    >
      {/* key on i remounts → the fade cycle replays per saying */}
      <div key={i} style={{ animation: 'sub-cycle 8s ease-in-out both' }}>
        {parts.map((p, idx) => (
          <div
            key={idx}
            className={idx === 0 ? 'serif' : undefined}
            style={
              idx === 0
                ? { fontSize: 26, lineHeight: 1.25, color: 'var(--text-primary)' }
                : { fontSize: 13, marginTop: 8, color: 'var(--text-secondary)', letterSpacing: 0.3 }
            }
          >
            {p}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes sub-cycle {
          0%   { opacity: 0; transform: translateY(6px); }
          18%  { opacity: 1; transform: translateY(0); }
          82%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="sub-cycle"] { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  )
}
