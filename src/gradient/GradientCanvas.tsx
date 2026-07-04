/**
 * GradientCanvas — Drift spec §5.
 * Renders the live shader gradient to a full-bleed WebGL2 canvas.
 * Compose/Android twin: a Box with RenderEffect.createRuntimeShaderEffect.
 *
 * Per-frame inputs are pulled through callbacks so the component never re-renders
 * for animation — it owns its own rAF loop (§13: 60fps floor).
 */

import { useEffect, useRef } from 'react'
import { FRAG_SRC, VERT_SRC } from './shader'
import { GradientController } from './GradientController'

export interface GradientCanvasProps {
  controller: GradientController
  /** Elapsed seconds for the dimming curve consumer (provided by parent). */
  dim?: number // brightness multiplier 0..1 (default 1)
  driftScale?: number // multiplies driftSpeed for dimming (default 1)
  /** Breath envelope 0..1 (luminosity sync). */
  breath?: number
  /** System reduced-motion. §12.3: gradient becomes slowly shifting static field. */
  reduceMotion?: boolean
  /**
   * Base psychedelic intensity 0..1 — bright hue-shifting color field. High on
   * the "awake" screens (Onboarding, Pre-Play), 0 during the calm sleep session.
   * The canvas lerps toward this so changes are smooth, never a hard step.
   */
  psychedelic?: number
  /** Pastel (light) theme — softens + lifts the gradient. */
  pastel?: boolean
  /** When true, freezes time advance (e.g. app backgrounded §11). */
  paused?: boolean
  /**
   * Optional per-frame sampler. When present, overrides dim/driftScale/breath
   * every frame so the active-session dimming + breath sync stay smooth without
   * React re-renders. Returns fresh values each call.
   */
  sample?: () => { dim: number; driftScale: number; breath: number }
  style?: React.CSSProperties
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed')
  }
  return sh
}

export function GradientCanvas(props: GradientCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  // Keep latest props in a ref so the rAF loop reads fresh values without restarting.
  const live = useRef(props)
  live.current = props

  useEffect(() => {
    const canvas = ref.current!
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false })
    if (!gl) {
      // §18 Q3 graceful fallback: paint a static CSS gradient instead.
      canvas.style.background =
        'radial-gradient(120% 120% at 30% 30%, #3D1A6E 0%, #1A0B3B 55%, #080810 100%)'
      return
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT_SRC))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'program link failed')
    }
    gl.useProgram(prog)

    // Fullscreen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res: gl.getUniformLocation(prog, 'u_res'),
      time: gl.getUniformLocation(prog, 'u_time'),
      colors: gl.getUniformLocation(prog, 'u_colors'),
      drift: gl.getUniformLocation(prog, 'u_driftSpeed'),
      sat: gl.getUniformLocation(prog, 'u_saturation'),
      noise: gl.getUniformLocation(prog, 'u_noise'),
      breath: gl.getUniformLocation(prog, 'u_breath'),
      dim: gl.getUniformLocation(prog, 'u_dim'),
      motion: gl.getUniformLocation(prog, 'u_motion'),
      psych: gl.getUniformLocation(prog, 'u_psych'),
      pastel: gl.getUniformLocation(prog, 'u_pastel'),
    }

    let raf = 0
    let shaderTime = 0
    let psychCurrent = 0
    let last = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.floor(canvas.clientWidth * dpr)
      const h = Math.floor(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const frame = (now: number) => {
      const p = live.current
      const dt = (now - last) / 1000
      last = now
      resize()

      if (!p.paused) shaderTime += dt

      const ctrl = p.controller
      const reduce = !!p.reduceMotion
      const colors = ctrl.currentColors(now)
      const s = p.sample?.()
      const dim = s?.dim ?? p.dim ?? 1
      const driftScale = s?.driftScale ?? p.driftScale ?? 1
      const breath = s?.breath ?? p.breath ?? 0.5

      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.time, shaderTime)
      gl.uniform3fv(u.colors, colors)
      // §12.3 reduced motion: keep a very slow drift, not a hard stop.
      gl.uniform1f(u.drift, ctrl.params.driftSpeed * driftScale * (reduce ? 0.08 : 1))
      gl.uniform1f(u.sat, ctrl.params.colorSaturation)
      gl.uniform1f(u.noise, reduce ? 0 : ctrl.params.noiseIntensity)
      gl.uniform1f(u.breath, ctrl.params.breathSync ? breath : 0.5)
      gl.uniform1f(u.dim, dim)
      gl.uniform1f(u.motion, reduce ? 0.4 : 1)
      // psychedelic: lerp base toward target, then add the crossfade burst.
      // Reduced motion keeps it calm (no time-driven hue shifting).
      const psychTarget = reduce ? 0 : p.psychedelic ?? 0
      psychCurrent += (psychTarget - psychCurrent) * Math.min(1, dt * 1.2)
      gl.uniform1f(u.psych, reduce ? 0 : psychCurrent + ctrl.transitionEnergy(now))
      gl.uniform1f(u.pastel, p.pastel ? 1 : 0)

      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        ...props.style,
      }}
    />
  )
}
