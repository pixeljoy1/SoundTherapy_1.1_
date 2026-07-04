/**
 * BreathController — Drift spec §8.5.
 * Pattern engine for breathwork sessions. Given a BreathPattern, it reports the
 * current phase, its progress 0..1, and a ring scale (inhale expands, exhale
 * contracts) using spring-like easing.
 *
 * Pure/stateless-by-time: callers pass elapsed seconds; we compute the phase.
 * This makes it trivial to drive from a rAF loop and to unit-test.
 */

import { BreathPattern, BreathPhase } from './types'

export interface BreathState {
  phase: BreathPhase
  /** 0..1 progress within the current phase. */
  progress: number
  /** Ring scale 0.4..1.0 (contracted..expanded), eased. */
  ringScale: number
  /** Index of the phase in the pattern. */
  index: number
}

function cycleSeconds(p: BreathPattern): number {
  return p.phases.reduce((s, ph) => s + ph.seconds, 0)
}

// easeInOutCubic — stands in for spring easing on the ring (§8.5).
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function breathStateAt(pattern: BreathPattern, elapsedSec: number): BreathState {
  const total = cycleSeconds(pattern)
  const tInCycle = elapsedSec % total
  let acc = 0
  for (let i = 0; i < pattern.phases.length; i++) {
    const ph = pattern.phases[i]
    if (tInCycle < acc + ph.seconds) {
      const progress = (tInCycle - acc) / ph.seconds
      return { phase: ph, progress, index: i, ringScale: ringScaleFor(ph, progress) }
    }
    acc += ph.seconds
  }
  const last = pattern.phases[pattern.phases.length - 1]
  return { phase: last, progress: 1, index: pattern.phases.length - 1, ringScale: ringScaleFor(last, 1) }
}

const MIN_SCALE = 0.42
const MAX_SCALE = 1.0

function ringScaleFor(phase: BreathPhase, progress: number): number {
  const e = easeInOut(progress)
  switch (phase.label) {
    case 'Inhale':
      return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * e
    case 'Exhale':
      return MAX_SCALE - (MAX_SCALE - MIN_SCALE) * e
    case 'Hold':
      return MAX_SCALE // hold expanded
    case 'Rest':
    default:
      return MIN_SCALE // rest contracted
  }
}
