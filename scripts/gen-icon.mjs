/**
 * Generates the Attune app icon + splash assets (for @capacitor/assets) from SVG,
 * in the app's own language: a deep teal night gradient with a glowing resonance
 * ripple — concentric sound waves radiating from a bright core.
 * Output → ./assets (consumed by `npx @capacitor/assets generate`)
 *        + ./public/favicon.png for the web build.
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('assets', { recursive: true })
mkdirSync('public', { recursive: true })

const bg = (s) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="bg" cx="42%" cy="34%" r="90%">
      <stop offset="0%" stop-color="#0E4D5C"/>
      <stop offset="45%" stop-color="#0A2C42"/>
      <stop offset="100%" stop-color="#050B14"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#bg)"/>
</svg>`

// resonance ripple — glowing core + expanding rings fading outward,
// sized to `d` (outer diameter) on an s×s canvas
const ripple = (s, d) => {
  const c = s / 2
  const R = d / 2
  const rings = [
    { r: R * 0.34, w: R * 0.055, o: 0.95 },
    { r: R * 0.58, w: R * 0.045, o: 0.6 },
    { r: R * 0.8, w: R * 0.035, o: 0.34 },
    { r: R, w: R * 0.028, o: 0.16 },
  ]
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9FF2E8" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#9FF2E8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="core" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F2FFFC"/>
      <stop offset="100%" stop-color="#8EE8DA"/>
    </linearGradient>
  </defs>
  <circle cx="${c}" cy="${c}" r="${R * 0.62}" fill="url(#glow)"/>
  ${rings
    .map(
      (g) =>
        `<circle cx="${c}" cy="${c}" r="${g.r}" fill="none" stroke="#A9F0E4" stroke-width="${g.w}" stroke-opacity="${g.o}"/>`,
    )
    .join('\n  ')}
  <circle cx="${c}" cy="${c}" r="${R * 0.16}" fill="url(#core)"/>
</svg>`
}

const png = (svg) => sharp(Buffer.from(svg)).png()

// icons (1024)
await png(bg(1024)).toFile('assets/icon-background.png')
await png(ripple(1024, 470)).toFile('assets/icon-foreground.png')
await sharp(Buffer.from(bg(1024)))
  .composite([{ input: await png(ripple(1024, 560)).toBuffer() }])
  .png()
  .toFile('assets/icon-only.png')

// web favicon (256)
await sharp(Buffer.from(bg(256)))
  .composite([{ input: await png(ripple(256, 168)).toBuffer() }])
  .png()
  .toFile('public/favicon.png')

// splashes (2732) — gradient + centered ripple
const splash = await sharp(Buffer.from(bg(2732)))
  .composite([{ input: await png(ripple(2732, 900)).toBuffer() }])
  .png()
  .toBuffer()
await sharp(splash).toFile('assets/splash.png')
await sharp(splash).toFile('assets/splash-dark.png')

console.log('[icon] generated Attune resonance icon + splash into ./assets + public/favicon.png')
