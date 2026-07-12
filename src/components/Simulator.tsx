// Simulator shell: canvas + controls + info panel + event log.
// Mobile-first; a single-column layout with the map on top and the panels
// docked below on narrow screens.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildingAtScreen,
  drawWorld,
  fitCamera,
  personAtScreen,
  resizeCanvas,
  setupCanvas,
  type Camera,
} from '../sim/renderer'
import { createSimClock, formatClock, tickWorld, isNight } from '../sim/simulation'
import type { Building, Person, SimConfig, World } from '../sim/types'
import { generateWorld } from '../sim/world'
import { TRIBE_COLORS } from '../sim/tribes'
import { PersonPanel } from './PersonPanel'
import { EventLog } from './EventLog'
import { Controls } from './Controls'

type Selection =
  | { kind: 'person'; id: number }
  | { kind: 'building'; id: number }
  | { kind: 'none' }

const DEFAULT_CONFIG: SimConfig = {
  seed: 20260712,
  cols: 68,
  rows: 44,
  cellSize: 22,
  initialPopulation: 60,
  yearsPerSecond: 0.6,
}

export default function Simulator(): JSX.Element {
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG)
  const [world, setWorld] = useState<World>(() => generateWorld(DEFAULT_CONFIG))
  const clockRef = useRef(createSimClock(config.seed))
  const [running, setRunning] = useState(true)
  const [selection, setSelection] = useState<Selection>({ kind: 'none' })
  const [tick, setTick] = useState(0) // forces UI re-render each frame

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const rcRef = useRef<ReturnType<typeof setupCanvas> | null>(null)
  const camRef = useRef<Camera>({ x: 0, y: 0, scale: 1 })
  const lastFrame = useRef<number>(performance.now())
  const lastUiTick = useRef<number>(performance.now())
  const runningRef = useRef(running)
  runningRef.current = running

  // Reset -------------------------------------------------------------------
  const restart = useCallback(
    (nextConfig?: Partial<SimConfig>) => {
      const merged = { ...config, ...(nextConfig ?? {}) }
      setConfig(merged)
      const w = generateWorld(merged)
      clockRef.current = createSimClock(merged.seed)
      setWorld(w)
      setSelection({ kind: 'none' })
      // Recenter camera after new dimensions.
      const canvas = canvasRef.current
      if (canvas && rcRef.current) {
        const cssW = canvas.clientWidth || wrapRef.current?.clientWidth || 800
        const cssH = canvas.clientHeight || wrapRef.current?.clientHeight || 500
        fitCamera(camRef.current, w, cssW, cssH)
      }
    },
    [config],
  )

  // Canvas resize -----------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    rcRef.current = setupCanvas(canvas)
    const doResize = () => {
      const parent = wrapRef.current
      if (!parent || !rcRef.current) return
      const rect = parent.getBoundingClientRect()
      resizeCanvas(rcRef.current, rect.width, rect.height)
      fitCamera(camRef.current, world, rect.width, rect.height)
    }
    doResize()
    const ro = new ResizeObserver(doResize)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
    // world reference intentionally fresh so refit works on regen
  }, [world])

  // Sim + render loop -------------------------------------------------------
  useEffect(() => {
    let raf = 0
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - lastFrame.current) / 1000)
      lastFrame.current = t
      if (runningRef.current) tickWorld(world, clockRef.current, dt)
      const canvas = canvasRef.current
      if (canvas && rcRef.current) {
        drawWorld(
          rcRef.current,
          camRef.current,
          world,
          canvas.clientWidth,
          canvas.clientHeight,
          selection.kind === 'person' ? selection.id : undefined,
        )
      }
      // Force a light UI redraw ~6x per second so the panel numbers refresh
      // without pinning React on every animation frame.
      if (t - lastUiTick.current > 160) {
        lastUiTick.current = t
        setTick((n) => n + 1)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // We deliberately depend on world so a regeneration resets the loop.
  }, [world, selection])

  // Pointer input -----------------------------------------------------------
  const dragRef = useRef<{ px: number; py: number; camX: number; camY: number; moved: boolean } | null>(null)

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    dragRef.current = {
      px: e.clientX,
      py: e.clientY,
      camX: camRef.current.x,
      camY: camRef.current.y,
      moved: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.px
    const dy = e.clientY - d.py
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    camRef.current.x = d.camX - dx * camRef.current.scale
    camRef.current.y = d.camY - dy * camRef.current.scale
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.releasePointerCapture(e.pointerId)
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    if (d.moved) return
    // Tap: select whatever's under the pointer.
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const person = personAtScreen(world, camRef.current, sx, sy)
    if (person) {
      setSelection({ kind: 'person', id: person.id })
      return
    }
    const building = buildingAtScreen(world, camRef.current, sx, sy)
    if (building) {
      setSelection({ kind: 'building', id: building.id })
      return
    }
    setSelection({ kind: 'none' })
  }

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const cam = camRef.current
    const wxBefore = sx * cam.scale + cam.x
    const wyBefore = sy * cam.scale + cam.y
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15
    cam.scale = Math.max(0.5, Math.min(4, cam.scale * factor))
    cam.x = wxBefore - sx * cam.scale
    cam.y = wyBefore - sy * cam.scale
  }

  // Camera controls ---------------------------------------------------------
  const zoom = (factor: number) => {
    const cam = camRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const cx = canvas.clientWidth / 2
    const cy = canvas.clientHeight / 2
    const wxBefore = cx * cam.scale + cam.x
    const wyBefore = cy * cam.scale + cam.y
    cam.scale = Math.max(0.5, Math.min(4, cam.scale * factor))
    cam.x = wxBefore - cx * cam.scale
    cam.y = wyBefore - cy * cam.scale
  }

  const recenter = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    fitCamera(camRef.current, world, canvas.clientWidth, canvas.clientHeight)
  }

  const selectedPerson: Person | undefined = useMemo(() => {
    if (selection.kind !== 'person') return undefined
    return world.people.find((p) => p.id === selection.id)
  }, [selection, world, tick])
  const selectedBuilding: Building | undefined = useMemo(() => {
    if (selection.kind !== 'building') return undefined
    return world.buildings.find((b) => b.id === selection.id)
  }, [selection, world])

  const night = isNight(world)

  return (
    <div className="sim-root">
      <header className="sim-header">
        <div className="sim-title">
          <span className="sim-dot" style={{ background: TRIBE_COLORS.Tamil }} />
          <span>Samaaj — A Diaspora Simulator</span>
        </div>
        <div className="sim-clock">
          <span className={`sim-daynight ${night ? 'is-night' : 'is-day'}`}>
            {night ? 'Night' : 'Day'}
          </span>
          <span className="sim-time">{formatClock(world.simYear)}</span>
        </div>
      </header>

      <div className="sim-stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="sim-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        />
        <div className="sim-zoombar">
          <button onClick={() => zoom(1 / 1.2)} aria-label="Zoom in">+</button>
          <button onClick={() => zoom(1.2)} aria-label="Zoom out">−</button>
          <button onClick={recenter} aria-label="Recenter">◎</button>
        </div>
      </div>

      <Controls
        running={running}
        onToggle={() => setRunning((v) => !v)}
        onStep={() => tickWorld(world, clockRef.current, 0.1)}
        onReset={() => restart({ seed: Date.now() >>> 0 })}
        yearsPerSecond={world.yearsPerSecond}
        onSpeed={(v) => {
          world.yearsPerSecond = v
          setTick((n) => n + 1)
        }}
        population={world.stats.population}
        stats={world.stats}
      />

      <div className="sim-panels">
        <PersonPanel person={selectedPerson} building={selectedBuilding} world={world} />
        <EventLog world={world} />
      </div>
    </div>
  )
}
