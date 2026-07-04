/**
 * GradientController — Drift spec §5.2 / §5.4.
 * Holds the live shader parameters and performs palette crossfades.
 * The React canvas reads `current()` every frame; nothing else mutates params.
 */

import { PALETTES, PaletteId, hexToRgb01, Palette } from '../theme/palettes'
import { duration } from '../theme/tokens'

export interface GradientParams {
  driftSpeed: number // §5.2 0.1..3.0, default 0.6
  colorSaturation: number // 0.3..1.0, default 0.7
  noiseIntensity: number // 0.0..0.4, default 0.15
  breathSync: boolean
}

export const DEFAULT_PARAMS: GradientParams = {
  driftSpeed: 0.66, // +10% overall movement
  colorSaturation: 0.7,
  noiseIntensity: 0.15,
  breathSync: true,
}

/** Expand a 3-stop palette into 6 shader color sources (rgb 0..1), cycling stops. */
function paletteToSources(p: Palette): number[] {
  const rgb = p.stops.map(hexToRgb01)
  const out: number[] = []
  for (let i = 0; i < 6; i++) {
    const c = rgb[i % 3]
    out.push(c[0], c[1], c[2])
  }
  return out
}

export class GradientController {
  params: GradientParams = { ...DEFAULT_PARAMS }

  private fromColors: number[]
  private toColors: number[]
  private crossfadeStart = 0
  private crossfading = false
  paletteId: PaletteId

  constructor(initial: PaletteId = 'dusk') {
    this.paletteId = initial
    this.fromColors = paletteToSources(PALETTES[initial])
    this.toColors = this.fromColors.slice()
  }

  /** §5.4 — crossfade palettes over 4s via per-source lerp. No hard cuts, ever. */
  setPalette(id: PaletteId, now = performance.now()) {
    if (id === this.paletteId && !this.crossfading) return
    this.fromColors = this.currentColors(now)
    this.toColors = paletteToSources(PALETTES[id])
    this.paletteId = id
    this.crossfadeStart = now
    this.crossfading = true
  }

  /**
   * Psychedelic burst envelope (0..1) over a palette crossfade — a bell curve
   * peaking mid-transition. Added on top of any base psychedelic intensity so
   * switching palettes flares bright before settling. §5.4 enhancement.
   */
  transitionEnergy(now = performance.now()): number {
    if (!this.crossfading) return 0
    const t = (now - this.crossfadeStart) / duration.paletteCrossfade
    if (t <= 0 || t >= 1) return 0
    return Math.sin(Math.PI * t) // 0 → 1 → 0
  }

  /** Interpolated 18-float color-source array for the shader. */
  currentColors(now = performance.now()): number[] {
    if (!this.crossfading) return this.toColors
    const t = (now - this.crossfadeStart) / duration.paletteCrossfade
    if (t >= 1) {
      this.crossfading = false
      return this.toColors
    }
    const e = t * t * (3 - 2 * t) // smoothstep
    return this.fromColors.map((c, i) => c + (this.toColors[i] - c) * e)
  }
}
