/**
 * BreathRing — Drift spec §8.5.
 * Luminous glowing ring (not a hard circle) that expands on inhale / contracts on
 * exhale. Phase prompt in DM Serif, 32sp, fades between states. No numeric
 * countdown inside the ring in MVP.
 */

import { BreathState } from '../session/BreathController'

export function BreathRing({ state, accent }: { state: BreathState; accent: string }) {
  const size = 220
  const scale = state.ringScale
  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 28 }}>
      <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
        {/* glow */}
        <div
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            transform: `scale(${scale})`,
            background: `radial-gradient(circle, ${accent}55 0%, ${accent}18 45%, transparent 70%)`,
            transition: 'transform 120ms linear',
            filter: 'blur(2px)',
          }}
        />
        {/* ring stroke */}
        <div
          style={{
            position: 'absolute',
            width: size * 0.74,
            height: size * 0.74,
            borderRadius: '50%',
            transform: `scale(${scale})`,
            border: `1.5px solid ${accent}cc`,
            boxShadow: `0 0 24px ${accent}66, inset 0 0 24px ${accent}33`,
            transition: 'transform 120ms linear',
          }}
        />
      </div>
      <div
        key={state.phase.label}
        className="serif"
        style={{ fontSize: 32, color: 'var(--text-primary)', animation: 'phase-fade 600ms ease' }}
      >
        {state.phase.label}
      </div>
      <style>{`
        @keyframes phase-fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}
