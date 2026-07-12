// Canvas 2D renderer for the simulator. Draws walls, buildings + labels,
// interaction lines, people (colored by tribe), and a day/night overlay.

import { TRIBE_COLORS } from './tribes'
import type { Building, Person, World } from './types'
import { isNight } from './simulation'

export interface Camera {
  // Offset in world (pixel) coords translating into the visible canvas.
  x: number
  y: number
  // World-pixels per screen pixel; <1 zooms in.
  scale: number
}

export interface RenderContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr: number
}

const BUILDING_FILL: Record<Building['type'], string> = {
  home: '#3f2b1e',
  temple: '#7a4a1f',
  market: '#5b3a11',
  school: '#31437a',
  farm: '#2f5a2e',
  workshop: '#4a3d2a',
  clinic: '#3a5a5c',
  ashram: '#5c4a1f',
  panchayat: '#4a3a5c',
  court: '#3b2a5c',
  jail: '#2a2a2a',
  gallows: '#1a0808',
  well: '#243a48',
  chai_stall: '#6b4a2a',
}

const BUILDING_LABEL_COLOR: Record<Building['type'], string> = {
  home: '#c9b39a',
  temple: '#f2c78b',
  market: '#f6c88a',
  school: '#9fb7ff',
  farm: '#a5d69c',
  workshop: '#d8bd8f',
  clinic: '#8fd9dd',
  ashram: '#f5d281',
  panchayat: '#bcb0ff',
  court: '#c1b4ff',
  jail: '#c7c7c7',
  gallows: '#ff8a8a',
  well: '#95c4de',
  chai_stall: '#f4c07a',
}

export function setupCanvas(canvas: HTMLCanvasElement): RenderContext {
  const ctx = canvas.getContext('2d')!
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  return { canvas, ctx, dpr }
}

export function resizeCanvas(rc: RenderContext, cssW: number, cssH: number): void {
  const { canvas, dpr } = rc
  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
}

export function worldToScreen(cam: Camera, wx: number, wy: number): [number, number] {
  return [(wx - cam.x) / cam.scale, (wy - cam.y) / cam.scale]
}

export function screenToWorld(cam: Camera, sx: number, sy: number): [number, number] {
  return [sx * cam.scale + cam.x, sy * cam.scale + cam.y]
}

export function fitCamera(cam: Camera, world: World, cssW: number, cssH: number): void {
  const worldW = world.cols * world.cellSize
  const worldH = world.rows * world.cellSize
  const scale = Math.max(worldW / cssW, worldH / cssH)
  cam.scale = scale
  cam.x = -(cssW * scale - worldW) / 2
  cam.y = -(cssH * scale - worldH) / 2
}

// Draw one frame of the world.
export function drawWorld(
  rc: RenderContext,
  cam: Camera,
  world: World,
  cssW: number,
  cssH: number,
  selectedId: number | undefined,
): void {
  const { ctx, dpr } = rc
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Background — a warm dirt tone for daytime that dusks to indigo at night.
  const dayness = smoothDay(world.yearOfDay)
  const bg = mixColor('#e2c9a0', '#0b1e33', 1 - dayness)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, cssW, cssH)

  // World transform: screen = (world - cam) / scale.
  ctx.translate(-cam.x / cam.scale, -cam.y / cam.scale)
  ctx.scale(1 / cam.scale, 1 / cam.scale)

  drawWalls(ctx, world, dayness)
  drawBuildings(ctx, world, cam, dayness)
  drawInteractionLines(ctx, world, cam)
  drawPeople(ctx, world, cam, selectedId)

  ctx.restore()

  // Night overlay — extra tint on top for depth.
  if (dayness < 0.9) {
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = `rgba(3, 10, 24, ${(1 - dayness) * 0.35})`
    ctx.fillRect(0, 0, cssW, cssH)
    ctx.restore()
  }
}

function smoothDay(yearOfDay: number): number {
  // 0..0.2 dawn, 0.2..0.75 day, 0.75..1 dusk/night. Map to 0..1 dayness.
  if (yearOfDay < 0.2) return 0.15 + (yearOfDay / 0.2) * 0.85
  if (yearOfDay < 0.75) return 1.0
  return 1.0 - ((yearOfDay - 0.75) / 0.25) * 0.85
}

function mixColor(a: string, b: string, t: number): string {
  const pa = hexToRgb(a)
  const pb = hexToRgb(b)
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t)
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t)
  return `rgb(${r},${g},${bl})`
}

function hexToRgb(h: string): [number, number, number] {
  const s = h.startsWith('#') ? h.slice(1) : h
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function drawWalls(ctx: CanvasRenderingContext2D, world: World, dayness: number): void {
  const cs = world.cellSize
  ctx.fillStyle = mixColor('#5a3a1e', '#1b1108', 1 - dayness)
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      if (world.walls[y * world.cols + x] === 1) {
        ctx.fillRect(x * cs, y * cs, cs, cs)
      }
    }
  }
}

function drawBuildings(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  dayness: number,
): void {
  const cs = world.cellSize
  for (const b of world.buildings) {
    const fill = mixColor(BUILDING_FILL[b.type], '#0b0f16', 1 - dayness)
    ctx.fillStyle = fill
    ctx.fillRect(b.x * cs, b.y * cs, b.w * cs, b.h * cs)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = Math.max(1, cs * 0.08)
    ctx.strokeRect(b.x * cs, b.y * cs, b.w * cs, b.h * cs)

    // Labels — scale with zoom so they're legible on mobile.
    const worldFont = Math.max(cs * 0.9, cam.scale * 11)
    ctx.font = `${worldFont}px system-ui, sans-serif`
    ctx.fillStyle = BUILDING_LABEL_COLOR[b.type]
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(b.name, (b.x + b.w / 2) * cs, (b.y + b.h / 2) * cs)
  }
}

function drawInteractionLines(ctx: CanvasRenderingContext2D, world: World, cam: Camera): void {
  ctx.lineWidth = Math.max(1, cam.scale * 1.2)
  for (const it of world.interactions) {
    const a = world.people.find((p) => p.id === it.a)
    const b = world.people.find((p) => p.id === it.b)
    if (!a || !b) continue
    ctx.strokeStyle = interactionColor(it.kind)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
}

function interactionColor(kind: string): string {
  switch (kind) {
    case 'arrest':
      return 'rgba(255,80,80,0.8)'
    case 'quarrel':
      return 'rgba(255,120,60,0.7)'
    case 'flirt':
      return 'rgba(255,140,200,0.7)'
    case 'trade':
      return 'rgba(240,210,120,0.6)'
    case 'preach':
      return 'rgba(220,200,255,0.6)'
    case 'teach':
      return 'rgba(150,200,255,0.6)'
    case 'heal':
      return 'rgba(150,230,220,0.6)'
    default:
      return 'rgba(255,255,255,0.35)'
  }
}

function drawPeople(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  selectedId: number | undefined,
): void {
  const baseR = Math.max(2, world.cellSize * 0.35)
  for (const p of world.people) {
    if (!p.alive) continue
    const r = baseR * (p.age < 6 ? 0.6 : p.age > 65 ? 0.9 : 1)
    // Outline for role hints.
    let outline: string | null = null
    if (p.isSaint) outline = '#fff2c2'
    else if (p.role === 'constable') outline = '#7dd3fc'
    else if (p.role === 'judge') outline = '#c4b5fd'
    else if (p.wanted) outline = '#ff4444'

    // Fill by tribe.
    ctx.fillStyle = TRIBE_COLORS[p.tribe]
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()
    if (outline) {
      ctx.strokeStyle = outline
      ctx.lineWidth = Math.max(1, cam.scale * 1.6)
      ctx.stroke()
    }
    if (selectedId === p.id) {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = Math.max(1.5, cam.scale * 2)
      ctx.beginPath()
      ctx.arc(p.x, p.y, r * 2, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

// Pick the person under a given screen coordinate, if any.
export function personAtScreen(
  world: World,
  cam: Camera,
  sx: number,
  sy: number,
): Person | undefined {
  const [wx, wy] = screenToWorld(cam, sx, sy)
  const r = world.cellSize * 0.9
  let best: Person | undefined
  let bestD = r * r
  for (const p of world.people) {
    if (!p.alive) continue
    const dx = p.x - wx
    const dy = p.y - wy
    const d = dx * dx + dy * dy
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  return best
}

// Pick a building under a given screen coordinate, if any.
export function buildingAtScreen(
  world: World,
  cam: Camera,
  sx: number,
  sy: number,
): Building | undefined {
  const [wx, wy] = screenToWorld(cam, sx, sy)
  for (const b of world.buildings) {
    const bx = b.x * world.cellSize
    const by = b.y * world.cellSize
    if (
      wx >= bx &&
      wx <= bx + b.w * world.cellSize &&
      wy >= by &&
      wy <= by + b.h * world.cellSize
    ) {
      return b
    }
  }
  return undefined
}

export { isNight }
