// Canvas 2D renderer for the simulator. Draws terrain, buildings + labels,
// planned construction sites, interaction lines, and people. Palette matches
// the Airbnb-uniform tokens defined in simulator.css so the map reads as
// part of the same design system, not a separate widget.

import { TRIBE_COLORS } from './tribes'
import type { Building, BuildingType, Person, PlannedBuilding, World } from './types'
import { isNight } from './simulation'

export interface Camera {
  x: number
  y: number
  scale: number
}

export interface RenderContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  dpr: number
}

// A single uniform tint per type keeps every rooftop feeling like it comes
// from one map, not a colouring-book. Values are subtle-warm swatches.
const BUILDING_FILL: Record<BuildingType, string> = {
  home: '#B5A182',
  temple: '#B6743A',
  market: '#A56E36',
  school: '#5A7CA8',
  farm: '#5A8564',
  workshop: '#8C6A44',
  clinic: '#4F87A0',
  ashram: '#B98A46',
  panchayat: '#8074A6',
  court: '#7566A4',
  jail: '#4A4A56',
  gallows: '#3C1F1F',
  well: '#4F7891',
  chai_stall: '#B48A54',
}

const BUILDING_INK: Record<BuildingType, string> = {
  home: '#3B2F1F',
  temple: '#341B08',
  market: '#3B1F0A',
  school: '#0F1E36',
  farm: '#132B1A',
  workshop: '#31210E',
  clinic: '#0D2735',
  ashram: '#33240A',
  panchayat: '#20143A',
  court: '#1A1236',
  jail: '#E3E3E3',
  gallows: '#F2C7C7',
  well: '#0F2632',
  chai_stall: '#331E08',
}

// Civic types get a label at rest. Homes stay quiet — surname is on tap.
const LABEL_TYPES: Set<BuildingType> = new Set([
  'temple',
  'market',
  'school',
  'farm',
  'workshop',
  'clinic',
  'ashram',
  'panchayat',
  'court',
  'jail',
  'gallows',
  'well',
  'chai_stall',
])

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

export function drawWorld(
  rc: RenderContext,
  cam: Camera,
  world: World,
  cssW: number,
  cssH: number,
  selectedId: number | undefined,
  theme: 'light' | 'dark',
): void {
  const { ctx, dpr } = rc
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const dayness = smoothDay(world.yearOfDay)
  // Daytime ground colour follows the theme's bone/midnight so the canvas
  // sits on the same swatch as the cards around it.
  const dayBg = theme === 'dark' ? '#12161D' : '#EDE6D5'
  const nightBg = theme === 'dark' ? '#080B12' : '#122032'
  const bg = mixColor(dayBg, nightBg, 1 - dayness)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, cssW, cssH)

  ctx.translate(-cam.x / cam.scale, -cam.y / cam.scale)
  ctx.scale(1 / cam.scale, 1 / cam.scale)

  drawWalls(ctx, world, dayness, theme)
  drawPlanned(ctx, world, cam)
  drawBuildings(ctx, world, cam, dayness, theme)
  drawInteractionLines(ctx, world, cam)
  drawPeople(ctx, world, cam, selectedId, theme)

  ctx.restore()

  if (dayness < 0.9) {
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const overlay = theme === 'dark' ? 3 : 8
    ctx.fillStyle = `rgba(2, 6, 16, ${(1 - dayness) * 0.32 * (overlay / 8)})`
    ctx.fillRect(0, 0, cssW, cssH)
    ctx.restore()
  }
}

function smoothDay(yearOfDay: number): number {
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

function drawWalls(ctx: CanvasRenderingContext2D, world: World, dayness: number, theme: 'light' | 'dark'): void {
  const cs = world.cellSize
  const wallDay = theme === 'dark' ? '#3A3427' : '#7A6C50'
  const wallNight = theme === 'dark' ? '#1A160F' : '#2C1E10'
  ctx.fillStyle = mixColor(wallDay, wallNight, 1 - dayness)
  for (let y = 0; y < world.rows; y++) {
    for (let x = 0; x < world.cols; x++) {
      if (world.walls[y * world.cols + x] === 1) {
        ctx.fillRect(x * cs, y * cs, cs, cs)
      }
    }
  }
}

function drawPlanned(ctx: CanvasRenderingContext2D, world: World, cam: Camera): void {
  const cs = world.cellSize
  for (const pl of world.planned) {
    const x = pl.x * cs
    const y = pl.y * cs
    const w = pl.w * cs
    const h = pl.h * cs
    // Sandy footprint.
    ctx.fillStyle = 'rgba(214, 189, 138, 0.28)'
    ctx.fillRect(x, y, w, h)
    // Dashed outline reads as "under construction".
    ctx.save()
    ctx.setLineDash([cs * 0.35, cs * 0.25])
    ctx.lineWidth = Math.max(1.4, cam.scale * 1.4)
    ctx.strokeStyle = 'rgba(214, 124, 60, 0.95)'
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2)
    ctx.restore()
    // Progress bar on the bottom edge.
    const barH = Math.max(3, cs * 0.18)
    ctx.fillStyle = 'rgba(214, 124, 60, 0.28)'
    ctx.fillRect(x, y + h - barH, w, barH)
    ctx.fillStyle = 'rgba(214, 124, 60, 1)'
    ctx.fillRect(x, y + h - barH, w * pl.progress, barH)
    // Label — small, kerned, aligned to the site.
    const fs = Math.max(cs * 0.55, cam.scale * 10)
    ctx.font = `600 ${fs}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const label = `Raising ${prettyType(pl.type)} · ${Math.round(pl.progress * 100)}%`
    ctx.fillText(label, x + w / 2, y + h / 2)
  }
}

function prettyType(t: BuildingType): string {
  return t.replace('_', ' ')
}

function drawBuildings(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  dayness: number,
  theme: 'light' | 'dark',
): void {
  const cs = world.cellSize
  const dimTo = theme === 'dark' ? '#04060B' : '#0B0F18'
  for (const b of world.buildings) {
    const fill = mixColor(BUILDING_FILL[b.type], dimTo, 1 - dayness)
    ctx.fillStyle = fill
    ctx.fillRect(b.x * cs, b.y * cs, b.w * cs, b.h * cs)
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)'
    ctx.lineWidth = Math.max(1, cs * 0.06)
    ctx.strokeRect(b.x * cs + 0.5, b.y * cs + 0.5, b.w * cs - 1, b.h * cs - 1)

    if (LABEL_TYPES.has(b.type)) {
      const fs = Math.max(cs * 0.6, cam.scale * 11)
      ctx.font = `500 ${fs}px "Inter", system-ui, sans-serif`
      ctx.fillStyle = BUILDING_INK[b.type]
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(b.name, (b.x + b.w / 2) * cs, (b.y + b.h / 2) * cs)
    }
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
      return 'rgba(178, 74, 46, 0.85)'
    case 'quarrel':
      return 'rgba(214, 124, 60, 0.8)'
    case 'flirt':
      return 'rgba(214, 158, 210, 0.85)'
    case 'trade':
      return 'rgba(214, 190, 122, 0.75)'
    case 'preach':
      return 'rgba(212, 194, 245, 0.75)'
    case 'teach':
      return 'rgba(160, 197, 246, 0.75)'
    case 'heal':
      return 'rgba(154, 218, 208, 0.75)'
    default:
      return 'rgba(255,255,255,0.32)'
  }
}

function drawPeople(
  ctx: CanvasRenderingContext2D,
  world: World,
  cam: Camera,
  selectedId: number | undefined,
  theme: 'light' | 'dark',
): void {
  const baseR = Math.max(2.4, world.cellSize * 0.32)
  for (const p of world.people) {
    if (!p.alive) continue
    const r = baseR * (p.age < 6 ? 0.65 : p.age > 65 ? 0.9 : 1)
    let outline: string | null = null
    if (p.isSaint) outline = '#F2C378'
    else if (p.role === 'constable') outline = '#7DB0E5'
    else if (p.role === 'judge') outline = '#B6A5EA'
    else if (p.wanted) outline = '#D26A3E'
    else if (p.activity === 'building') outline = '#F0AC65'

    ctx.fillStyle = TRIBE_COLORS[p.tribe]
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()

    if (outline) {
      ctx.strokeStyle = outline
      ctx.lineWidth = Math.max(1, cam.scale * 1.6)
      ctx.stroke()
    } else {
      ctx.strokeStyle = theme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.2)'
      ctx.lineWidth = Math.max(0.6, cam.scale * 0.6)
      ctx.stroke()
    }
    if (selectedId === p.id) {
      ctx.strokeStyle = theme === 'dark' ? '#F5EAD0' : '#16171B'
      ctx.lineWidth = Math.max(1.5, cam.scale * 2)
      ctx.beginPath()
      ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}

export function personAtScreen(
  world: World,
  cam: Camera,
  sx: number,
  sy: number,
): Person | undefined {
  const [wx, wy] = screenToWorld(cam, sx, sy)
  const r = world.cellSize * 1.0
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

export function plannedAtScreen(
  world: World,
  cam: Camera,
  sx: number,
  sy: number,
): PlannedBuilding | undefined {
  const [wx, wy] = screenToWorld(cam, sx, sy)
  for (const pl of world.planned) {
    const bx = pl.x * world.cellSize
    const by = pl.y * world.cellSize
    if (
      wx >= bx &&
      wx <= bx + pl.w * world.cellSize &&
      wy >= by &&
      wy <= by + pl.h * world.cellSize
    ) {
      return pl
    }
  }
  return undefined
}

export { isNight }
