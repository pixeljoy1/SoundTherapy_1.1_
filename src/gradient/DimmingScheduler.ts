/**
 * DimmingScheduler — Drift spec §5.3 sleep dimming curve.
 * Maps elapsed session seconds → { driftScale, brightness }.
 * Not user-configurable, by design (§5.3). The system handles it.
 *
 *   0–5 min:   full brightness,        drift 100%
 *   5–15 min:  brightness -10%,        drift  40%
 *   15–25 min: brightness -30%,        drift  15%
 *   25+ min:   brightness -60%,        drift   1%
 *
 * We interpolate between stages instead of hard-stepping, so the night fades
 * smoothly rather than visibly snapping at each boundary.
 */

export interface DimState {
  /** Multiplier applied to driftSpeed (0..1). */
  driftScale: number
  /** Screen/gradient brightness multiplier (0..1). */
  brightness: number
}

interface Stage {
  atMin: number
  driftScale: number
  brightness: number
}

const STAGES: Stage[] = [
  { atMin: 0, driftScale: 1.0, brightness: 1.0 },
  { atMin: 5, driftScale: 1.0, brightness: 1.0 },
  { atMin: 15, driftScale: 0.4, brightness: 0.9 },
  { atMin: 25, driftScale: 0.15, brightness: 0.7 },
  { atMin: 40, driftScale: 0.01, brightness: 0.4 },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function dimStateAt(elapsedSec: number): DimState {
  const min = elapsedSec / 60
  for (let i = 0; i < STAGES.length - 1; i++) {
    const lo = STAGES[i]
    const hi = STAGES[i + 1]
    if (min >= lo.atMin && min <= hi.atMin) {
      const t = (min - lo.atMin) / (hi.atMin - lo.atMin)
      return {
        driftScale: lerp(lo.driftScale, hi.driftScale, t),
        brightness: lerp(lo.brightness, hi.brightness, t),
      }
    }
  }
  const last = STAGES[STAGES.length - 1]
  return { driftScale: last.driftScale, brightness: last.brightness }
}

/**
 * Timer text opacity over the session (§8.3):
 * fades to ghost at 10 min, to invisible at 25 min.
 */
export function timerOpacityAt(elapsedSec: number): number {
  const min = elapsedSec / 60
  if (min < 10) return 1
  if (min >= 25) return 0
  return lerp(1, 0, (min - 10) / (25 - 10))
}
