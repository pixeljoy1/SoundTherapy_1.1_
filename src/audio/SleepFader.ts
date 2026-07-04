/**
 * SleepFader — Drift spec §6.2.
 * Exponential fade scheduler over the master gain. Human hearing is logarithmic,
 * so fades use exponential ramps, never linear (§6.2).
 *
 * Android twin: a Choreographer/ValueAnimator driving ExoPlayer.volume on an
 * exponential interpolator.
 */

export class SleepFader {
  constructor(
    private ctx: AudioContext,
    private gain: GainNode,
  ) {}

  /** Fade up to `target` over `seconds` (session start, §12.2 default 3s). */
  fadeIn(target: number, seconds: number) {
    const now = this.ctx.currentTime
    const g = this.gain.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(0.0001, now)
    // exponential ramp can't hit 0, so start just above
    g.exponentialRampToValueAtTime(Math.max(target, 0.0002), now + seconds)
  }

  /** Exponential fade to (near) silence over `seconds` (§6.2). */
  fadeToSilence(seconds: number) {
    const now = this.ctx.currentTime
    const g = this.gain.gain
    const start = Math.max(g.value, 0.0002)
    g.cancelScheduledValues(now)
    g.setValueAtTime(start, now)
    g.exponentialRampToValueAtTime(0.0001, now + seconds)
  }
}
