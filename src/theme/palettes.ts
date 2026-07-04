/**
 * Gradient palettes — Drift spec §4.2 (the "mood engine").
 * Three base palettes mapping to session types. Each is a set of color stops the
 * shader places as drifting color sources.
 */

export type PaletteId =
  | 'dusk'
  | 'deepWater'
  | 'ember'
  | 'forest'
  | 'coastal'
  | 'rainfall'
  | 'aurora'
  | 'tide'
  | 'starfield'
  | 'mountain'
  | 'saffron'
  | 'temple'

export interface Palette {
  id: PaletteId
  name: string
  /** Hex stops, dark → light. Fed to the shader as color sources. */
  stops: [string, string, string]
  /** Short descriptor surfaced in the UI ("Indigo · Slow drift"). */
  descriptor: string
}

export const PALETTES: Record<PaletteId, Palette> = {
  // — spec §4.2 canonical three —
  dusk: {
    id: 'dusk',
    name: 'Dusk',
    stops: ['#1A0B3B', '#3D1A6E', '#7A2E5B'], // Indigo → Violet → Rose
    descriptor: 'Indigo · Slow drift',
  },
  deepWater: {
    id: 'deepWater',
    name: 'Deep Water',
    stops: ['#060D2B', '#0D3B5E', '#1B4A6B'], // Navy → Teal → Slate
    descriptor: 'Navy · Tidal',
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    stops: ['#1A0A05', '#5C2B0A', '#8B3A1A'], // Charcoal → Amber → Burnt Sienna
    descriptor: 'Amber · Warm',
  },
  // — mood-matched palettes (one per sleep theme) —
  forest: {
    id: 'forest',
    name: 'Forest',
    stops: ['#04140C', '#0C3B24', '#1E5E3A'], // pine → moss → fern
    descriptor: 'Green · Woodland',
  },
  coastal: {
    id: 'coastal',
    name: 'Coastal',
    stops: ['#03101F', '#0A2E4D', '#10657E'], // deep ocean → teal surf
    descriptor: 'Ocean · Night surf',
  },
  rainfall: {
    id: 'rainfall',
    name: 'Rainfall',
    stops: ['#0A0F18', '#1C2A3A', '#3A4E62'], // charcoal-blue → slate → steel
    descriptor: 'Slate · Rain',
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    stops: ['#031018', '#0B6E58', '#3A2E7E'], // dark → teal-green → violet
    descriptor: 'Aurora · Pulsing',
  },
  tide: {
    id: 'tide',
    name: 'Deep Tide',
    stops: ['#020812', '#06243F', '#0E3A52'], // abyss navy → deep blue
    descriptor: 'Sub-bass · Deep',
  },
  starfield: {
    id: 'starfield',
    name: 'Starfield',
    stops: ['#03030A', '#10103A', '#2A2A5E'], // near-black → indigo
    descriptor: 'Indigo · Still',
  },
  mountain: {
    id: 'mountain',
    name: 'Mountain Pass',
    stops: ['#0A0D14', '#243042', '#4A5A70'], // slate → cool grey-blue
    descriptor: 'Slate · Wind',
  },
  saffron: {
    id: 'saffron',
    name: 'Saffron',
    stops: ['#1A0E03', '#5C3A0A', '#C2741A'], // deep amber → saffron gold
    descriptor: 'Saffron · Chant',
  },
  temple: {
    id: 'temple',
    name: 'Temple',
    stops: ['#160608', '#48121A', '#8A3A24'], // maroon → terracotta
    descriptor: 'Maroon · Chant',
  },
}

/** Convert "#RRGGBB" to normalized [r,g,b] in 0..1 for the shader. */
export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return [r, g, b]
}

export const PALETTE_ORDER: PaletteId[] = ['dusk', 'deepWater', 'ember']
