/**
 * Stars — a field of tiny, spaced-out twinkling stars.
 * Drawn on a full-bleed canvas above the gradient (Starfield session). Each star
 * has a random position, size, and slow twinkle phase so they shimmer gently.
 */

import { useEffect, useRef } from 'react'

export function Stars({ count = 70, opacity = 1 }: { count?: number; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const opacityRef = useRef(opacity)
  opacityRef.current = opacity

  useEffect(() => {
    const canvas = ref.current!
    const g = canvas.getContext('2d')!
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let stars: { x: number; y: number; r: number; phase: number; speed: number; base: number }[] = []

    const seed = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (0.6 + Math.random() * 1.1) * dpr,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1, // slow twinkle
        base: 0.25 + Math.random() * 0.5,
      }))
    }
    seed()
    window.addEventListener('resize', seed)

    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      const t = (now - start) / 1000
      g.clearRect(0, 0, canvas.width, canvas.height)
      const op = opacityRef.current
      for (const s of stars) {
        const tw = s.base + (1 - s.base) * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        g.globalAlpha = tw * op
        g.fillStyle = '#F4F3FA'
        g.beginPath()
        g.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        g.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', seed)
    }
  }, [count])

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
