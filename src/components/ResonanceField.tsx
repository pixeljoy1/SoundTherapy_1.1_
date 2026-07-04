/**
 * ResonanceField — the living hero of the Home screen.
 * A 2D-canvas sound field painted in the active profile's two hues:
 *   · expanding rings born on a slow breath cycle (sound made visible)
 *   · an undulating waveform whose amplitude breathes with the same cycle
 *   · harmonic dust — slow particles drifting up like resonance in the air
 * Pure canvas, DPR-aware, ~zero GC pressure. Honors prefers-reduced-motion by
 * painting a single still frame.
 */

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../state/util'

interface Props {
  /** Profile hues: [age accent, goal hue]. */
  hues: [string, string]
  height: number
  /** 0..1 — overall strength (kept subtle behind type). */
  intensity?: number
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

const BREATH_MS = 7000
const RING_EVERY_MS = 3500
const DUST = 34

export function ResonanceField({ hues, height, intensity = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const huesRef = useRef(hues)
  huesRef.current = hues

  useEffect(() => {
    const canvas = ref.current!
    const g = canvas.getContext('2d')!
    const reduce = prefersReducedMotion()
    let raf = 0
    let w = 0
    let h = height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const fit = () => {
      w = canvas.clientWidth
      canvas.width = w * dpr
      canvas.height = h * dpr
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)

    // ring pool: birth timestamps
    const rings: number[] = []
    let lastRing = -RING_EVERY_MS
    // dust particles: x(0..1), y(0..1), speed, phase, size
    const dust = Array.from({ length: DUST }, () => ({
      x: Math.random(),
      y: Math.random(),
      v: 0.006 + Math.random() * 0.012,
      p: Math.random() * Math.PI * 2,
      s: 0.6 + Math.random() * 1.3,
    }))

    const start = performance.now()

    const paint = (now: number) => {
      const t = now - start
      const breath = (Math.sin((t / BREATH_MS) * Math.PI * 2 - Math.PI / 2) + 1) / 2 // 0..1
      const [A, B] = [rgb(huesRef.current[0]), rgb(huesRef.current[1])]
      const cx = w * 0.72
      const cy = h * 0.42
      const maxR = Math.max(w * 0.34, 220)

      g.clearRect(0, 0, w, h)

      // ── expanding rings ──
      if (!reduce && t - lastRing > RING_EVERY_MS) {
        rings.push(t)
        lastRing = t
        if (rings.length > 5) rings.shift()
      }
      const drawRing = (p: number, col: [number, number, number], lw: number) => {
        if (p <= 0 || p >= 1) return
        g.beginPath()
        g.arc(cx, cy, 18 + p * maxR, 0, Math.PI * 2)
        g.strokeStyle = rgba(col, (1 - p) * 0.34 * intensity)
        g.lineWidth = lw
        g.stroke()
      }
      if (reduce) {
        drawRing(0.25, A, 1.4)
        drawRing(0.55, B, 1.1)
        drawRing(0.85, A, 0.8)
      } else {
        rings.forEach((born, i) => drawRing((t - born) / 9000, i % 2 ? B : A, 1.4 - (i % 2) * 0.3))
      }

      // glowing core, breathing
      const coreR = 5 + breath * 3.5
      const glow = g.createRadialGradient(cx, cy, 0, cx, cy, coreR * 7)
      glow.addColorStop(0, rgba(A, 0.5 * intensity))
      glow.addColorStop(1, rgba(A, 0))
      g.fillStyle = glow
      g.fillRect(cx - coreR * 7, cy - coreR * 7, coreR * 14, coreR * 14)
      g.beginPath()
      g.arc(cx, cy, coreR, 0, Math.PI * 2)
      g.fillStyle = rgba(A, 0.85 * intensity)
      g.fill()

      // ── waveform — two voices, breathing amplitude ──
      const drawWave = (col: [number, number, number], amp: number, f1: number, f2: number, yBase: number, alpha: number, speed: number) => {
        g.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const u = x / w
          const env = Math.sin(u * Math.PI) // fade at both edges
          const y =
            yBase +
            env *
              amp *
              (Math.sin(u * f1 * Math.PI * 2 + t * speed) * 0.65 +
                Math.sin(u * f2 * Math.PI * 2 - t * speed * 0.7) * 0.35)
          x === 0 ? g.moveTo(x, y) : g.lineTo(x, y)
        }
        g.strokeStyle = rgba(col, alpha * intensity)
        g.lineWidth = 1.2
        g.stroke()
      }
      const amp = (reduce ? 8 : 7 + breath * 9)
      const tt = reduce ? 0 : 1
      drawWave(A, amp, 2.2, 5.1, h * 0.7, 0.5, 0.00042 * tt)
      drawWave(B, amp * 0.7, 3.1, 7.3, h * 0.72, 0.34, 0.00058 * tt)

      // ── harmonic dust ──
      dust.forEach((d) => {
        if (!reduce) {
          d.y -= d.v / 100
          if (d.y < -0.05) {
            d.y = 1.05
            d.x = Math.random()
          }
        }
        const tw = (Math.sin(t / 900 + d.p) + 1) / 2
        g.beginPath()
        g.arc(d.x * w, d.y * h, d.s, 0, Math.PI * 2)
        g.fillStyle = rgba(tw > 0.5 ? A : B, (0.08 + tw * 0.2) * intensity)
        g.fill()
      })

      if (!reduce) raf = requestAnimationFrame(paint)
    }
    raf = requestAnimationFrame(paint)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [height, intensity])

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height,
        display: 'block',
        pointerEvents: 'none',
        // dissolve into the page at the bottom so it never fights the content
        WebkitMaskImage: 'linear-gradient(180deg, black 55%, transparent 100%)',
        maskImage: 'linear-gradient(180deg, black 55%, transparent 100%)',
      }}
    />
  )
}
