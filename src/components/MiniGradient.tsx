/**
 * MiniGradient — lightweight CSS-gradient preview for cards (§8.1).
 * Mirrors the shader: in pastel mode each palette becomes a soft light tint.
 */

import { PALETTES, PaletteId, hexToRgb01 } from '../theme/palettes'

/** Soft pastel tint of a hex color (lift, then tint toward white). */
function pastelize(hex: string): string {
  const [r, g, b] = hexToRgb01(hex)
  const ch = (x: number) => {
    const lifted = Math.min(1, x * 1.8)
    return Math.round((lifted + (1 - lifted) * 0.5) * 255)
  }
  return `rgb(${ch(r)}, ${ch(g)}, ${ch(b)})`
}

export function MiniGradient({ palette, pastel, style }: { palette: PaletteId; pastel?: boolean; style?: React.CSSProperties }) {
  const stops = PALETTES[palette].stops
  const [a, b, c] = pastel ? (stops.map(pastelize) as [string, string, string]) : stops
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(120% 110% at 25% 20%, ${c} 0%, ${b} 45%, ${a} 100%)`,
        ...style,
      }}
    />
  )
}
