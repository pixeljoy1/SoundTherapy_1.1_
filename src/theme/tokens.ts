/**
 * Design tokens — Drift spec §4.
 * Web mirror of what would be `Theme.kt` / `Color.kt` / `Type.kt` in Compose.
 * Keep this file the single source of truth; styles/global.css re-exports these as CSS vars.
 */

// §4.2 Fixed UI tokens
export const color = {
  surface: '#080810', // base, near-black with blue undertone
  surfaceRaised: '#0F0F1E', // cards, sheets
  textPrimary: '#F0EEF8', // 90% white, never pure white
  textSecondary: '#8E8BAA', // muted, labels
  textGhost: '#3D3B52', // disabled, placeholder
  accent: '#A78BFA', // soft violet — single accent color
  accentDim: '#6D4FC7', // pressed states, backgrounds
  danger: '#F87171', // errors only — rarely seen
} as const

// §4.4 Spacing scale (dp → px 1:1 for prototype)
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const

// §4.4 Corner radius
export const radius = {
  card: 20,
  pill: 100,
  sheet: 28, // top corners only
  button: 16,
} as const

// §4.3 Type scale. font: DM Serif Display (display) / Inter (interface).
export const type = {
  displayXL: { family: 'DM Serif Display', size: 48, weight: 400, tracking: -0.5 },
  display: { family: 'DM Serif Display', size: 32, weight: 400, tracking: -0.3 },
  title: { family: 'Inter', size: 20, weight: 500, tracking: 0.0 },
  body: { family: 'Inter', size: 16, weight: 300, tracking: 0.2 },
  label: { family: 'Inter', size: 13, weight: 400, tracking: 0.5, uppercase: true },
  caption: { family: 'Inter', size: 11, weight: 300, tracking: 0.3 },
} as const

// §12.1 Easing tokens. Web springs approximate Compose spring(stiffness, damping).
// We express them as CSS cubic-beziers tuned to feel like the named springs.
export const ease = {
  spring: 'cubic-bezier(0.22, 1, 0.36, 1)', // stiff, snappy — default UI
  gentle: 'cubic-bezier(0.34, 1.2, 0.4, 1)', // cards, sheets (slight overshoot)
  float: 'cubic-bezier(0.4, 0, 0.1, 1)', // gradient elements, overlays
  fade: 'cubic-bezier(0.4, 0, 0.2, 1)', // opacity only
} as const

// §12.2 Duration guidelines (ms)
export const duration = {
  press: 80,
  cardExpand: 280,
  sheet: 340,
  screen: 440,
  paletteCrossfade: 4000,
  audioFadeIn: 3000,
  sleepFadeToBlack: 90_000,
} as const

export type TypeRole = keyof typeof type

/** Build a CSS font shorthand-ish style object for a given type role. */
export function typeStyle(role: TypeRole): React.CSSProperties {
  const t = type[role]
  return {
    fontFamily: t.family === 'DM Serif Display' ? "'DM Serif Display', serif" : "'Inter', sans-serif",
    fontSize: t.size,
    fontWeight: t.weight,
    letterSpacing: t.tracking,
    ...('uppercase' in t && t.uppercase ? { textTransform: 'uppercase' as const } : {}),
  }
}
