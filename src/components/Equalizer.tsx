/**
 * Equalizer — a 90s hi-fi graphic spectrum analyzer.
 * Classic segmented LED bars (green → amber → red, bottom to top) with
 * slow-falling peak-hold caps, driven by the AudioEngine's AnalyserNode.
 * Toggleable + battery-friendly (loop pauses when hidden).
 */

import { useEffect, useRef } from 'react'
import { audioEngine } from '../audio/AudioEngine'

interface Props {
  bars?: number
  segments?: number
  opacity?: number
  width?: number
  height?: number
  running?: boolean
}

// monotone white segments
function segColor(lit: boolean) {
  return lit ? 'rgba(248,247,252,1)' : 'rgba(240,238,248,0.24)'
}

export function Equalizer({ bars = 22, segments = 16, opacity = 1, width = 300, height = 64, running = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const opacityRef = useRef(opacity)
  opacityRef.current = opacity
  const runningRef = useRef(running)
  runningRef.current = running

  useEffect(() => {
    const canvas = ref.current!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    const g = canvas.getContext('2d')!
    g.scale(dpr, dpr)

    let raf = 0
    const level = new Array(bars).fill(0)
    const peak = new Array(bars).fill(0)
    let freq: Uint8Array | null = null

    // each channel rises within the bottom half — max bar height = height / 2
    const usableH = height / 2
    const segGap = 2
    const barGap = Math.max(3, width / bars / 2.4) // thinner bars
    const barW = (width - barGap * (bars - 1)) / bars
    const segH = (usableH - segGap * (segments - 1)) / segments // thin lines

    const draw = () => {
      if (!runningRef.current) {
        raf = requestAnimationFrame(draw)
        return
      }
      const analyser = audioEngine.analyser
      if (analyser) {
        if (!freq || freq.length !== analyser.frequencyBinCount) freq = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(freq as Uint8Array<ArrayBuffer>)
      }
      g.clearRect(0, 0, width, height)
      const op = opacityRef.current
      g.globalAlpha = op

      for (let b = 0; b < bars; b++) {
        // sample across the musical part of the spectrum (boosted sensitivity)
        const sample = freq ? freq[Math.floor((b / bars) * (freq.length * 0.7))] / 255 : 0
        const raw = Math.min(1, sample * 1.8)
        level[b] += (raw - level[b]) * 0.22
        // peak hold falls slowly
        if (level[b] > peak[b]) peak[b] = level[b]
        else peak[b] = Math.max(level[b], peak[b] - 0.012)

        const lit = Math.round(level[b] * segments)
        const peakSeg = Math.round(peak[b] * segments)
        const x = b * (barW + barGap)

        for (let s = 0; s < segments; s++) {
          const y = height - (s + 1) * segH - s * segGap
          const isLit = s < lit
          const isPeak = s === peakSeg - 1 && peakSeg > 0
          g.fillStyle = isPeak ? '#FFFFFF' : segColor(isLit)
          g.fillRect(x, y, barW, segH)
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [bars, segments, width, height])

  return <canvas ref={ref} style={{ width, height, display: 'block', margin: '0 auto' }} aria-hidden />
}
