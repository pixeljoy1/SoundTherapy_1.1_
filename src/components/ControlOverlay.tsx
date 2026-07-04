/**
 * ControlOverlay — Drift spec §8.3, restyled to the app's calm language.
 * A frosted card that springs in and out (never a hard cut). Controls:
 * a circular play/pause, a clean volume slider, and ghost pills (+10 / End).
 *
 * Rendered persistently and driven by `open` so the exit animates too; when
 * closed it is fully transparent and non-interactive (taps pass through to the
 * session surface).
 */

import { haptic } from '../state/util'
import { radius } from '../theme/tokens'

interface Props {
  open: boolean
  paused: boolean
  volume: number
  onTogglePause: () => void
  onVolume: (v: number) => void
  onAddTime: () => void
  onEnd: () => void
}

export function ControlOverlay({ open, paused, volume, onTogglePause, onVolume, onAddTime, onEnd }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: open ? 'rgba(8,8,16,0.42)' : 'rgba(8,8,16,0)',
        backdropFilter: open ? 'blur(3px)' : 'blur(0px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'background 360ms ease, backdrop-filter 360ms ease, opacity 300ms ease',
      }}
    >
      {/* card sits in the center of the bottom half of the screen */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', bottom: 0, display: 'grid', placeItems: 'center', padding: 16 }}>
        {/* entrance (overshoot spring) */}
        <div
          style={{
            transform: open ? 'translateY(0) scale(1)' : 'translateY(26px) scale(0.9)',
            opacity: open ? 1 : 0,
            transition: 'transform 480ms cubic-bezier(0.34,1.56,0.64,1), opacity 300ms ease',
          }}
        >
          {/* gentle floating bob while open */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(460px, 88vw)',
              background: 'var(--panel)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--hairline)',
              borderRadius: 28,
              padding: '28px 26px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 22,
              animation: open ? 'co-bob 5s ease-in-out infinite' : 'none',
            }}
          >
        {/* primary play / pause */}
        <div style={child(open, 0)}>
          <button
            aria-label={paused ? 'Resume' : 'Pause'}
            onClick={() => {
              haptic.light()
              onTogglePause()
            }}
            style={primary}
            onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
            onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>

        {/* volume */}
        <div style={{ ...child(open, 1), display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
          <SpeakerIcon />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolume(parseFloat(e.target.value))}
            style={slider}
            aria-label="Volume"
          />
        </div>

        {/* secondary actions */}
        <div style={{ ...child(open, 2), display: 'flex', gap: 12, width: '100%' }}>
          <button
            onClick={() => {
              haptic.doublePulse()
              onAddTime()
            }}
            style={ghostPill}
          >
            + 10 min
          </button>
          <button
            onClick={() => {
              haptic.medium()
              onEnd()
            }}
            style={{ ...ghostPill, color: 'var(--text-secondary)' }}
          >
            End Session
          </button>
        </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes co-bob { 0%,100% { transform: translateY(-5px); } 50% { transform: translateY(5px); } }
        @media (prefers-reduced-motion: reduce) { [style*="co-bob"] { animation: none !important; } }
      `}</style>
    </div>
  )
}

// staggered child reveal — expressive, settles top-to-bottom
function child(open: boolean, i: number): React.CSSProperties {
  return {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(10px)',
    transition: `opacity 320ms ease ${open ? 80 + i * 70 : 0}ms, transform 420ms cubic-bezier(0.34,1.4,0.64,1) ${open ? 80 + i * 70 : 0}ms`,
  }
}

// — thin line icons (1.5dp stroke, per §4.5) —
const stroke = { stroke: '#120A26', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M8 5l11 7-11 7V5z" fill="#120A26" />
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <line x1="9" y1="5" x2="9" y2="19" {...stroke} />
      <line x1="15" y1="5" x2="15" y2="19" {...stroke} />
    </svg>
  )
}
function SpeakerIcon() {
  const s = { stroke: 'var(--text-secondary)', strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ flex: '0 0 auto' }}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" {...s} />
      <path d="M16.5 8.5a5 5 0 010 7" {...s} />
    </svg>
  )
}

const primary: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: radius.pill,
  background: 'var(--accent)',
  color: '#120A26',
  display: 'grid',
  placeItems: 'center',
  transition: 'transform 120ms cubic-bezier(0.22,1,0.36,1), filter 200ms ease',
  boxShadow: '0 0 0 6px var(--accent-soft)',
}
const slider: React.CSSProperties = {
  flex: 1,
  accentColor: 'var(--accent)',
  height: 3,
}
const ghostPill: React.CSSProperties = {
  flex: 1,
  minHeight: 46,
  borderRadius: radius.pill,
  background: 'var(--chip)',
  border: '1px solid var(--hairline)',
  color: 'var(--text-primary)',
  fontSize: 15,
  fontWeight: 300,
}
