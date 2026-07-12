// World generation — carves a small commune of named buildings inside a
// walled compound, then seeds it with an initial population that already has
// families and homes.

import { BUILDING_NAME_POOLS, pickName, pickSurname } from './names'
import { chance, gauss, makeRng, pick, randInt, type Rng } from './rng'
import { TRIBES } from './tribes'
import type {
  Building,
  BuildingType,
  Family,
  Gender,
  Person,
  Role,
  SimConfig,
  Tribe,
  World,
} from './types'

const WALL = 1
const OPEN = 0

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  pad = 1,
): boolean {
  return !(
    a.x + a.w + pad <= b.x ||
    b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y ||
    b.y + b.h + pad <= a.y
  )
}

function placeBuilding(
  rng: Rng,
  cols: number,
  rows: number,
  w: number,
  h: number,
  existing: Building[],
  region?: { x: number; y: number; w: number; h: number },
): { x: number; y: number } | null {
  const r = region ?? { x: 2, y: 2, w: cols - 4, h: rows - 4 }
  for (let attempt = 0; attempt < 60; attempt++) {
    const x = randInt(rng, r.x, r.x + r.w - w)
    const y = randInt(rng, r.y, r.y + r.h - h)
    const rect = { x, y, w, h }
    let ok = true
    for (const b of existing) {
      if (rectsOverlap(b, rect, 1)) {
        ok = false
        break
      }
    }
    if (ok) return { x, y }
  }
  return null
}

function makeBuilding(
  id: number,
  type: BuildingType,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Building {
  return {
    id,
    name,
    type,
    x,
    y,
    w,
    h,
    cx: x + w / 2,
    cy: y + h / 2,
    occupants: new Set(),
  }
}

function paintWalls(walls: Uint8Array, cols: number, rows: number): void {
  // Outer compound wall around the whole map (leaving a 1-cell margin).
  for (let x = 0; x < cols; x++) {
    walls[x] = WALL
    walls[(rows - 1) * cols + x] = WALL
  }
  for (let y = 0; y < rows; y++) {
    walls[y * cols] = WALL
    walls[y * cols + (cols - 1)] = WALL
  }
  // Carve a few gates so the boundary looks like a compound with entries.
  const gates = [
    [Math.floor(cols / 2), 0],
    [Math.floor(cols / 2), rows - 1],
    [0, Math.floor(rows / 2)],
    [cols - 1, Math.floor(rows / 2)],
  ]
  for (const [gx, gy] of gates) walls[gy! * cols + gx!] = OPEN
}

function paintHedges(walls: Uint8Array, cols: number, rows: number, rng: Rng): void {
  // A handful of short hedge walls to give the commune a maze feel without
  // making straight-line motion impossible.
  const hedgeCount = 8
  for (let i = 0; i < hedgeCount; i++) {
    const horizontal = chance(rng, 0.5)
    const len = randInt(rng, 4, 8)
    if (horizontal) {
      const y = randInt(rng, 4, rows - 5)
      const x = randInt(rng, 3, cols - len - 3)
      for (let k = 0; k < len; k++) walls[y * cols + x + k] = WALL
    } else {
      const x = randInt(rng, 4, cols - 5)
      const y = randInt(rng, 3, rows - len - 3)
      for (let k = 0; k < len; k++) walls[(y + k) * cols + x] = WALL
    }
  }
}

// Clear the interior of a building so pathing doesn't hit an accidental wall.
function clearRect(
  walls: Uint8Array,
  cols: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) walls[yy * cols + xx] = OPEN
}

function pickHomeName(rng: Rng, family: Family, used: Set<string>): string {
  // "The Patels of Adarsh Niwas"-ish flavour.
  const base = pick(rng, BUILDING_NAME_POOLS.home)
  for (let i = 0; i < 6; i++) {
    const candidate = `${base} · ${family.surname}`
    if (!used.has(candidate)) {
      used.add(candidate)
      return candidate
    }
  }
  const unique = `${family.surname} House ${used.size}`
  used.add(unique)
  return unique
}

function pickUnique(rng: Rng, pool: readonly string[], used: Set<string>): string {
  for (let i = 0; i < 10; i++) {
    const s = pick(rng, pool)
    if (!used.has(s)) {
      used.add(s)
      return s
    }
  }
  const s = `${pool[0]} #${used.size + 1}`
  used.add(s)
  return s
}

function assignRole(rng: Rng, age: number, gender: Gender): Role {
  if (age < 6) return 'child'
  if (age < 16) return 'student'
  if (age >= 65) return 'elder'
  // Weighted adult roles.
  const table: Array<[Role, number]> = [
    ['farmer', 12],
    ['merchant', 8],
    ['weaver', 6],
    ['potter', 5],
    ['blacksmith', 4],
    ['teacher', 5],
    ['doctor', 3],
    ['priest', 3],
    ['musician', 3],
    ['housewife', gender === 'f' ? 10 : 0],
    ['constable', 3],
    ['judge', 1],
    ['saint', 1],
    ['beggar', 2],
  ]
  const total = table.reduce((s, [, w]) => s + w, 0)
  let r = rng() * total
  for (const [role, w] of table) {
    r -= w
    if (r <= 0) return role
  }
  return 'farmer'
}

function makePerson(
  rng: Rng,
  id: number,
  familyId: number,
  homeId: number,
  tribe: Tribe,
  age: number,
  gender: Gender,
  role: Role,
  home: Building,
): Person {
  const name = pickName(rng, tribe, gender)
  const jitter = () => (rng() - 0.5) * Math.min(home.w, home.h) * 0.5
  const x = home.cx + jitter()
  const y = home.cy + jitter()
  return {
    id,
    name,
    gender,
    tribe,
    role,
    age,
    lifespan: Math.max(40, gauss(rng, 74, 9)),
    hunger: rng() * 0.3,
    fatigue: rng() * 0.3,
    faith: rng() * 0.5 + (role === 'priest' || role === 'saint' ? 0.5 : 0),
    morality: role === 'saint' ? 0.9 : Math.min(0.95, Math.max(0.05, gauss(rng, 0.7, 0.15))),
    aggression: Math.min(0.95, Math.max(0.02, gauss(rng, 0.25, 0.15))),
    wealth: Math.max(0, gauss(rng, 500, 250)),
    familyId,
    homeId,
    parentIds: [],
    childrenIds: [],
    x,
    y,
    vx: 0,
    vy: 0,
    targetX: x,
    targetY: y,
    activity: 'idle',
    emotion: 'calm',
    interactionTimer: 0,
    alive: true,
    isCriminal: false,
    isSaint: role === 'saint',
    crimesCommitted: 0,
    wanted: false,
    sentencedToDeath: false,
    reproCooldown: 0,
  }
}

export function generateWorld(cfg: SimConfig): World {
  const rng = makeRng(cfg.seed)
  const { cols, rows } = cfg
  const walls = new Uint8Array(cols * rows)
  paintWalls(walls, cols, rows)
  paintHedges(walls, cols, rows, rng)

  const buildings: Building[] = []
  const usedNames = new Set<string>()
  let bid = 1

  // Anchor civic buildings first, roughly in central & corner regions.
  const civic: Array<{ type: BuildingType; w: number; h: number; pool: readonly string[]; region?: { x: number; y: number; w: number; h: number } }> = [
    { type: 'temple', w: 6, h: 5, pool: BUILDING_NAME_POOLS.temple, region: { x: Math.floor(cols / 2) - 6, y: Math.floor(rows / 2) - 4, w: 12, h: 8 } },
    { type: 'panchayat', w: 5, h: 4, pool: BUILDING_NAME_POOLS.panchayat },
    { type: 'market', w: 6, h: 4, pool: BUILDING_NAME_POOLS.market },
    { type: 'school', w: 5, h: 4, pool: BUILDING_NAME_POOLS.school },
    { type: 'ashram', w: 4, h: 4, pool: BUILDING_NAME_POOLS.ashram },
    { type: 'clinic', w: 4, h: 3, pool: BUILDING_NAME_POOLS.clinic },
    { type: 'court', w: 5, h: 4, pool: BUILDING_NAME_POOLS.court, region: { x: 3, y: 3, w: 14, h: 12 } },
    { type: 'jail', w: 5, h: 4, pool: BUILDING_NAME_POOLS.jail, region: { x: 3, y: 3, w: 14, h: 12 } },
    { type: 'gallows', w: 3, h: 3, pool: BUILDING_NAME_POOLS.gallows, region: { x: 3, y: 3, w: 14, h: 12 } },
    { type: 'well', w: 2, h: 2, pool: BUILDING_NAME_POOLS.well },
    { type: 'chai_stall', w: 2, h: 2, pool: BUILDING_NAME_POOLS.chai_stall },
    { type: 'farm', w: 6, h: 5, pool: BUILDING_NAME_POOLS.farm, region: { x: cols - 20, y: rows - 15, w: 15, h: 10 } },
    { type: 'farm', w: 6, h: 5, pool: BUILDING_NAME_POOLS.farm, region: { x: 4, y: rows - 15, w: 15, h: 10 } },
    { type: 'workshop', w: 4, h: 3, pool: BUILDING_NAME_POOLS.workshop },
    { type: 'workshop', w: 4, h: 3, pool: BUILDING_NAME_POOLS.workshop },
  ]

  for (const spec of civic) {
    const pos = placeBuilding(rng, cols, rows, spec.w, spec.h, buildings, spec.region)
    if (!pos) continue
    const name = pickUnique(rng, spec.pool, usedNames)
    const b = makeBuilding(bid++, spec.type, name, pos.x, pos.y, spec.w, spec.h)
    buildings.push(b)
    clearRect(walls, cols, pos.x, pos.y, spec.w, spec.h)
  }

  // Families & homes. Aim for enough homes to comfortably hold the
  // initial population (~3 people per home).
  const families: Family[] = []
  const people: Person[] = []
  let personId = 1

  const homesTarget = Math.max(12, Math.ceil(cfg.initialPopulation / 3))
  for (let f = 0; f < homesTarget; f++) {
    const tribe = pick(rng, TRIBES)
    const surname = pickSurname(rng, tribe)
    const pos = placeBuilding(rng, cols, rows, 3, 3, buildings)
    if (!pos) continue
    const family: Family = { id: families.length + 1, surname, tribe, homeId: bid, members: new Set() }
    const home = makeBuilding(bid++, 'home', '', pos.x, pos.y, 3, 3)
    home.name = pickHomeName(rng, family, usedNames)
    home.familyId = family.id
    families.push(family)
    buildings.push(home)
    clearRect(walls, cols, pos.x, pos.y, 3, 3)
  }

  // Distribute the initial population across families.
  for (let i = 0; i < cfg.initialPopulation && families.length > 0; i++) {
    const family = families[i % families.length]!
    const home = buildings.find((b) => b.id === family.homeId)!
    const age = Math.max(1, gauss(rng, 32, 18))
    const gender: Gender = chance(rng, 0.5) ? 'm' : 'f'
    const role = assignRole(rng, age, gender)
    const p = makePerson(rng, personId++, family.id, home.id, family.tribe, age, gender, role, home)
    // Pixel positioning uses cellSize so simulation math is in world units.
    p.x *= cfg.cellSize
    p.y *= cfg.cellSize
    p.targetX = p.x
    p.targetY = p.y
    family.members.add(p.id)
    people.push(p)
  }

  const world: World = {
    simYear: 0,
    yearOfDay: 0.35,
    simDays: 0,
    realSecondsElapsed: 0,
    yearsPerSecond: cfg.yearsPerSecond,
    cellSize: cfg.cellSize,
    cols,
    rows,
    walls,
    buildings,
    people,
    families,
    interactions: [],
    events: [
      {
        year: 0,
        clock: '00:00:00',
        text: `A new commune awakens with ${people.length} souls across ${families.length} households.`,
        kind: 'note',
      },
    ],
    nextPersonId: personId,
    nextFamilyId: families.length + 1,
    stats: {
      population: people.length,
      births: 0,
      deaths: 0,
      marriages: 0,
      crimes: 0,
      arrests: 0,
      executions: 0,
      saints: people.filter((p) => p.isSaint).length,
    },
  }
  return world
}

// Helper — is the given world cell passable?
export function isPassable(world: World, cx: number, cy: number): boolean {
  if (cx < 0 || cy < 0 || cx >= world.cols || cy >= world.rows) return false
  return world.walls[cy * world.cols + cx] === OPEN
}
