/**
 * SessionIntro — a brief, calming "easing in" overlay shown as a session starts.
 * It visualises the 3s audio fade-in: a speaker whose waves grow and a slim bar
 * that fills as the volume rises, then the whole thing drifts away buttery-smooth.
 */

import { useEffect, useRef, useState } from 'react'

export function SessionIntro({ onDone }: { onDone: () => void }) {
  const [gone, setGone] = useState(false)
  // Keep onDone in a ref so the timers run exactly once and are never reset by the
  // parent re-rendering (which happens every second / every frame).
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), 2200) // once the sound is in
    const d = window.setTimeout(() => onDoneRef.current(), 2800) // hand the slot to the equalizer
    return () => {
      clearTimeout(t)
      clearTimeout(d)
    }
  }, [])

  return (
    <div
      style={{
        minHeight: 72,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        opacity: gone ? 0 : 1,
        transform: gone ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
          <SpeakerRising />
        </div>
        <div style={{ width: 168, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: 'var(--accent)', width: 0, animation: 'vol-fill 2200ms cubic-bezier(0.4,0,0.2,1) forwards' }} />
        </div>
        <span className="label" style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
          Easing the sound in
        </span>
      </div>
      <style>{`
        @keyframes vol-fill { from { width: 0%; } to { width: 100%; } }
        @keyframes wave1 { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes wave2 { 0%,100% { opacity: 0.15; } 60% { opacity: 0.9; } }
        @media (prefers-reduced-motion: reduce) {
          [style*="vol-fill"] { animation-duration: 1ms !important; }
        }
      `}</style>
    </div>
  )
}

function SpeakerRising() {
  const s = { stroke: 'currentColor', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width="40" height="40" viewBox="0 0 24 24">
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 010 7" {...s} style={{ animation: 'wave1 1.6s ease-in-out infinite' }} />
      <path d="M19 6a9 9 0 010 12" {...s} style={{ animation: 'wave2 1.6s ease-in-out infinite' }} />
    </svg>
  )
}
