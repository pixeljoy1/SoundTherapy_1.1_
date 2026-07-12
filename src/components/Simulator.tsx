// Simulator shell: header, meter, canvas, controls, panels.
// Uniform design system — one type scale, one accent, matching cards.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildingAtScreen,
  drawWorld,
  fitCamera,
  personAtScreen,
  plannedAtScreen,
  resizeCanvas,
  setupCanvas,
  type Camera,
} from '../sim/renderer'
import { createSimClock, formatClock, tickWorld, isNight } from '../sim/simulation'
import type { Building, Person, PlannedBuilding, SimConfig, World } from '../sim/types'
import { generateWorld } from '../sim/world'
import { PersonPanel } from './PersonPanel'
import { EventLog } from './EventLog'
import { Controls } from './Controls'
import { ThrivingMeter } from './ThrivingMeter'
import { PlansCard } from './PlansCard'

type Selection =
  | { kind: 'person'; id: number }
  | { kind: 'building'; id: number }
  | { kind: 'planned'; id: number }
  | { kind: 'none' }

type ThemeMode = 'light' | 'dark'

const DEFAULT_CONFIG: SimConfig = {
  seed: 20260712,
  cols: 68,
  rows: 44,
  cellSize: 22,
  initialPopulation: 60,
  yearsPerSecond: 0.6,
}

function detectInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Simulator(): JSX.Element {
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG)
  const [world, setWorld] = useState<World>(() => generateWorld(DEFAULT_CONFIG))
  const clockRef = useRef(createSimClock(config.seed))
  const [running, setRunning] = useState(true)
  const [selection, setSelection] = useState<Selection>({ kind: 'none' })
  const [tick, setTick] = useState(0)
  const [theme, setTheme] = useState<ThemeMode>(detectInitialTheme)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const rcRef = useRef<ReturnType<typeof setupCanvas> | null>(null)
  const camRef = useRef<Camera>({ x: 0, y: 0, scale: 1 })
  const lastFrame = useRef<number>(performance.now())
  const lastUiTick = useRef<number>(performance.now())
  const runningRef = useRef(running)
  const themeRef = useRef(theme)
  runningRef.current = running
  themeRef.current = theme

  // Apply theme at the document level so tokens flip everywhere.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
  }, [theme])

  const restart = useCallback(
    (nextConfig?: Partial<SimConfig>) => {
      const merged = { ...config, ...(nextConfig ?? {}) }
      setConfig(merged)
      const w = generateWorld(merged)
      clockRef.current = createSimClock(merged.seed)
      setWorld(w)
      setSelection({ kind: 'none' })
      const canvas = canvasRef.current
      if (canvas && rcRef.current) {
        const cssW = canvas.clientWidth || stageRef.current?.clientWidth || 800
        const cssH = canvas.clientHeight || stageRef.current?.clientHeight || 500
        fitCamera(camRef.current, w, cssW, cssH)
      }
    },
    [config],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    rcRef.current = setupCanvas(canvas)
    const doResize = () => {
      const parent = stageRef.current
      if (!parent || !rcRef.current) return
      const rect = parent.getBoundingClientRect()
      resizeCanvas(rcRef.current, rect.width, rect.height)
      fitCamera(camRef.current, world, rect.width, rect.height)
    }
    doResize()
    const ro = new ResizeObserver(doResize)
    if (stageRef.current) ro.observe(stageRef.current)
    return () => ro.disconnect()
  }, [world])

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
          themeRef.current,
        )
      }
      if (t - lastUiTick.current > 160) {
        lastUiTick.current = t
        setTick((n) => n + 1)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [world, selection])

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
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const person = personAtScreen(world, camRef.current, sx, sy)
    if (person) {
      setSelection({ kind: 'person', id: person.id })
      return
    }
    const pl = plannedAtScreen(world, camRef.current, sx, sy)
    if (pl) {
      setSelection({ kind: 'planned', id: pl.id })
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
  const selectedPlanned: PlannedBuilding | undefined = useMemo(() => {
    if (selection.kind !== 'planned') return undefined
    return world.planned.find((p) => p.id === selection.id)
  }, [selection, world, tick])

  const night = isNight(world)

  return (
    <div className="sim-root">
      <header className="sim-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1 className="brand-title">Samaaj</h1>
            <span className="brand-sub">a diaspora simulator</span>
          </div>
        </div>
        <div className="header-right">
          <div className={`daynight ${night ? 'is-night' : 'is-day'}`}>
            <span className="daynight-dot" />
            {night ? 'Night' : 'Day'}
          </div>
          <div className="clock" aria-label="Elapsed simulated time">
            {formatClock(world.simYear)}
          </div>
          <button
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <ThrivingMeter world={world} />

      <div className="sim-stage" ref={stageRef}>
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
          <button onClick={() => zoom(1 / 1.2)} aria-label="Zoom in">
            +
          </button>
          <button onClick={() => zoom(1.2)} aria-label="Zoom out">
            −
          </button>
          <button onClick={recenter} aria-label="Recenter">
            ⊙
          </button>
        </div>
      </div>

      <Controls
        running={running}
        onToggle={() => setRunning((v) => !v)}
        onStep={() => tickWorld(world, clockRef.current, 0.1)}
        onReset={() => restart({ seed: (Date.now() >>> 0) ^ Math.floor(Math.random() * 1e9) })}
        yearsPerSecond={world.yearsPerSecond}
        onSpeed={(v) => {
          world.yearsPerSecond = v
          setTick((n) => n + 1)
        }}
        population={world.stats.population}
        stats={world.stats}
      />

      <div className="stack">
        <PersonPanel
          person={selectedPerson}
          building={selectedBuilding}
          planned={selectedPlanned}
          world={world}
        />
        <PlansCard planned={world.planned} />
        <EventLog world={world} />
      </div>
    </div>
  )
}
