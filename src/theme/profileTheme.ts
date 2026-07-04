/**
 * Profile-reactive art direction — the heart of Attune's visual identity.
 * The age group sets the accent character; the goal sets the companion hue.
 * Together they re-tint the entire interface (chips, pills, glows, the
 * resonance field on Home) so a child's Attune feels warm and playful while a
 * teenager's feels electric — without touching layout or components.
 */

import { AgeGroup, TherapyGoal } from '../state/types'
import { PaletteId } from './palettes'

/** Accent per age — mid-tone hues that read on both the night and pastel themes. */
export const AGE_ACCENT: Record<AgeGroup, { accent: string; dim: string }> = {
  child: { accent: '#F4A83C', dim: '#B87718' }, // warm honey — playful, safe
  teen: { accent: '#6C9EF8', dim: '#3D6BD8' }, // electric periwinkle — alive
  youngAdult: { accent: '#2FC6B2', dim: '#178F80' }, // mint teal — clear, fresh
  adult: { accent: '#A78BFA', dim: '#6D4FC7' }, // soft violet — composed
}

/** Companion hue per goal — the second voice in gradients and the hero field. */
export const GOAL_HUE: Record<TherapyGoal, string> = {
  sleep: '#7C6FF2', // indigo dusk
  focus: '#4FD1E8', // cool cyan
  stress: '#55D68F', // forest green
  mood: '#F2856D', // warm coral
}

/** Gradient palette the living background shifts to while choosing (onboarding). */
export const AGE_PALETTE: Record<AgeGroup, PaletteId> = {
  child: 'aurora',
  teen: 'coastal',
  youngAdult: 'deepWater',
  adult: 'dusk',
}

export const GOAL_PALETTE: Record<TherapyGoal, PaletteId> = {
  sleep: 'dusk',
  focus: 'deepWater',
  stress: 'forest',
  mood: 'saffron',
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

const rgba = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

/** Push the profile's colors into CSS custom properties, app-wide. */
export function applyProfileTheme(age: AgeGroup, goal: TherapyGoal) {
  const { accent, dim } = AGE_ACCENT[age]
  const hue = GOAL_HUE[goal]
  const s = document.documentElement.style
  s.setProperty('--accent', accent)
  s.setProperty('--accent-dim', dim)
  s.setProperty('--accent-2', hue)
  s.setProperty('--accent-soft', rgba(accent, 0.16))
  s.setProperty('--accent-line', rgba(accent, 0.42))
  s.setProperty('--accent-glow', rgba(accent, 0.3))
  s.setProperty('--accent2-soft', rgba(hue, 0.15))
  s.setProperty('--on-accent', '#0C1018')
}

/** Raw pair for canvas drawing (the resonance field reads these directly). */
export function profileHues(age: AgeGroup, goal: TherapyGoal): [string, string] {
  return [AGE_ACCENT[age].accent, GOAL_HUE[goal]]
}
