/**
 * WindDown — supporting messages shown as a session gently ends.
 * The closing line suits the session type (sleep vs. breath vs. chant vs. body
 * scan), so we never tell a mindfulness user to "sleep well".
 */

import { useEffect, useState } from 'react'
import { SessionGroup } from '../session/types'

const LINES: Record<SessionGroup, string[]> = {
  sleep: ['Winding down…', 'Let everything soften', 'Sleep well'],
  breathwork: ['Winding down…', 'Carry the calm with you', 'Well done'],
  chanting: ['Winding down…', 'Rest in the silence', 'Be at peace'],
  bodyScan: ['Winding down…', 'Let the body rest', 'Be well'],
}

export function WindDown({ group, durationMs }: { group: SessionGroup; durationMs: number }) {
  const lines = LINES[group] ?? LINES.sleep
  const [i, setI] = useState(0)
  useEffect(() => {
    const step = Math.max(900, durationMs / lines.length)
    const id = window.setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), step)
    return () => clearInterval(id)
  }, [durationMs, lines.length])

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 25, pointerEvents: 'none' }}>
      <div key={i} className="serif" style={{ fontSize: 30, color: 'var(--text-primary)', animation: 'wd-fade 1600ms ease' }}>
        {lines[i]}
      </div>
      <style>{`@keyframes wd-fade { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
