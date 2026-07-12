// The simulation engine. Runs entirely on plain arrays for speed; React only
// re-reads via a `revision` counter so we don't recreate objects each frame.

import { pickName } from './names'
import { chance, makeRng, pick, type Rng } from './rng'
import type {
  Activity,
  Building,
  BuildingType,
  Emotion,
  Interaction,
  Person,
  Role,
  World,
  WorldEvent,
} from './types'
import { isPassable } from './world'

// --- Time helpers ---------------------------------------------------------

// Format simulated years as DD:HH:MM using an in-simulation calendar where
// 1 year = 365 days = 8760 hours. We treat simYear as a real number of years
// elapsed since the sim started at year 0.
export function formatClock(simYear: number): string {
  const totalHours = simYear * 8760
  const days = Math.floor(totalHours / 24)
  const hours = Math.floor(totalHours - days * 24)
  const minutes = Math.floor((totalHours - days * 24 - hours) * 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m`
}

export function isNight(world: World): boolean {
  // Night: yearOfDay in [0.75, 1) ∪ [0, 0.2).
  return world.yearOfDay >= 0.75 || world.yearOfDay < 0.2
}

// --- Utility --------------------------------------------------------------

function log(world: World, kind: WorldEvent['kind'], text: string): void {
  world.events.push({ year: world.simYear, clock: formatClock(world.simYear), text, kind })
  if (world.events.length > 200) world.events.splice(0, world.events.length - 200)
}

function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

function firstBuildingOfType(world: World, type: BuildingType): Building | undefined {
  return world.buildings.find((b) => b.type === type)
}

function nearestBuildingOfType(world: World, type: BuildingType, x: number, y: number): Building | undefined {
  let best: Building | undefined
  let bestD = Infinity
  for (const b of world.buildings) {
    if (b.type !== type) continue
    const d = dist2(x, y, b.cx * world.cellSize, b.cy * world.cellSize)
    if (d < bestD) {
      bestD = d
      best = b
    }
  }
  return best
}

function personById(world: World, id: number): Person | undefined {
  return world.people.find((p) => p.id === id)
}

function setTargetBuilding(world: World, p: Person, b: Building, jitterCells = 1): void {
  const jx = (Math.random() - 0.5) * jitterCells * world.cellSize
  const jy = (Math.random() - 0.5) * jitterCells * world.cellSize
  p.targetX = b.cx * world.cellSize + jx
  p.targetY = b.cy * world.cellSize + jy
  p.targetBuildingId = b.id
}

// Try to move toward target; simple wall-avoidance by lateral deflection.
function stepMotion(world: World, p: Person, dt: number, speed: number): void {
  const dx = p.targetX - p.x
  const dy = p.targetY - p.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 2) {
    p.vx = 0
    p.vy = 0
    return
  }
  const stepLen = speed * dt
  const nx = dx / len
  const ny = dy / len

  const tryStep = (sx: number, sy: number): boolean => {
    const cx = Math.floor(sx / world.cellSize)
    const cy = Math.floor(sy / world.cellSize)
    return isPassable(world, cx, cy)
  }

  let sx = p.x + nx * stepLen
  let sy = p.y + ny * stepLen
  if (tryStep(sx, sy)) {
    p.x = sx
    p.y = sy
    p.vx = nx
    p.vy = ny
    return
  }
  // Try only-x, only-y, then a sideways deflection.
  sx = p.x + nx * stepLen
  if (tryStep(sx, p.y)) {
    p.x = sx
    return
  }
  sy = p.y + ny * stepLen
  if (tryStep(p.x, sy)) {
    p.y = sy
    return
  }
  // Nudge sideways to escape a dead-end.
  const perpX = -ny
  const perpY = nx
  const nudge = stepLen * (Math.random() < 0.5 ? 1 : -1)
  if (tryStep(p.x + perpX * nudge, p.y + perpY * nudge)) {
    p.x += perpX * nudge
    p.y += perpY * nudge
  }
}

// --- Behaviour ------------------------------------------------------------

function pickDailyTarget(world: World, p: Person, rng: Rng): Building | undefined {
  // Life stages override role choice.
  if (!p.alive) return undefined
  if (p.activity === 'jailed') return firstBuildingOfType(world, 'jail')
  if (p.sentencedToDeath) return firstBuildingOfType(world, 'gallows')

  // At night, go home unless a night-role.
  if (isNight(world)) {
    if (p.role === 'constable' && chance(rng, 0.6)) return firstBuildingOfType(world, 'panchayat')
    if (p.role === 'thief' || p.role === 'dacoit') return firstBuildingOfType(world, 'market')
    if (p.role === 'saint') return firstBuildingOfType(world, 'ashram')
    return world.buildings.find((b) => b.id === p.homeId)
  }

  if (p.hunger > 0.4) return world.buildings.find((b) => b.id === p.homeId)

  switch (p.role) {
    case 'child':
      return chance(rng, 0.5)
        ? world.buildings.find((b) => b.id === p.homeId)
        : firstBuildingOfType(world, 'well')
    case 'student':
      return firstBuildingOfType(world, 'school')
    case 'teacher':
      return firstBuildingOfType(world, 'school')
    case 'farmer':
      return nearestBuildingOfType(world, 'farm', p.x, p.y) ?? firstBuildingOfType(world, 'farm')
    case 'merchant':
      return firstBuildingOfType(world, 'market')
    case 'weaver':
    case 'potter':
    case 'blacksmith':
      return nearestBuildingOfType(world, 'workshop', p.x, p.y) ?? firstBuildingOfType(world, 'workshop')
    case 'priest':
      return firstBuildingOfType(world, 'temple')
    case 'doctor':
      return firstBuildingOfType(world, 'clinic')
    case 'saint':
      return chance(rng, 0.6)
        ? firstBuildingOfType(world, 'ashram')
        : firstBuildingOfType(world, 'temple')
    case 'housewife':
      return chance(rng, 0.5)
        ? firstBuildingOfType(world, 'well')
        : firstBuildingOfType(world, 'market')
    case 'constable':
      return chance(rng, 0.5) ? firstBuildingOfType(world, 'jail') : firstBuildingOfType(world, 'market')
    case 'judge':
      return firstBuildingOfType(world, 'court')
    case 'thief':
    case 'dacoit':
      return firstBuildingOfType(world, 'market')
    case 'beggar':
      return chance(rng, 0.4) ? firstBuildingOfType(world, 'temple') : firstBuildingOfType(world, 'market')
    case 'musician':
      return firstBuildingOfType(world, 'chai_stall') ?? firstBuildingOfType(world, 'market')
    case 'elder':
      return chance(rng, 0.5)
        ? firstBuildingOfType(world, 'temple')
        : firstBuildingOfType(world, 'chai_stall')
  }
}

function assignActivity(world: World, p: Person, b: Building | undefined): Activity {
  if (!p.alive) return 'executed'
  if (p.activity === 'jailed') return 'jailed'
  if (isNight(world) && b && b.id === p.homeId) return 'sleeping'
  if (!b) return 'walking'
  const insideTarget =
    Math.abs(p.x / world.cellSize - b.cx) < 1.2 && Math.abs(p.y / world.cellSize - b.cy) < 1.2
  if (!insideTarget) return 'walking'
  switch (b.type) {
    case 'temple':
    case 'ashram':
      return p.role === 'saint' ? 'meditating' : 'praying'
    case 'school':
      return p.role === 'teacher' ? 'teaching' : 'studying'
    case 'clinic':
      return p.role === 'doctor' ? 'healing' : 'nursing'
    case 'farm':
    case 'workshop':
    case 'market':
      return 'working'
    case 'panchayat':
    case 'court':
      return 'chatting'
    case 'home':
      return p.hunger > 0.3 ? 'eating' : isNight(world) ? 'sleeping' : 'chatting'
    case 'jail':
      return 'chatting'
    case 'gallows':
      return 'executed'
    case 'well':
    case 'chai_stall':
      return 'chatting'
  }
  return 'idle'
}

function updateEmotion(p: Person, activity: Activity): Emotion {
  if (!p.alive) return p.emotion
  if (p.sentencedToDeath) return 'fear'
  if (p.activity === 'jailed') return 'shame'
  if (p.wanted) return 'fear'
  switch (activity) {
    case 'praying':
    case 'meditating':
      return 'devotion'
    case 'eating':
    case 'sleeping':
      return 'contentment'
    case 'working':
      return p.wealth > 800 ? 'contentment' : 'calm'
    case 'chatting':
      return Math.random() < 0.7 ? 'joy' : 'calm'
    case 'studying':
    case 'teaching':
      return 'calm'
    case 'mourning':
      return 'grief'
    case 'plotting':
      return 'greed'
    default:
      return p.emotion
  }
}

// --- Life events ---------------------------------------------------------

function tryMarriage(world: World, a: Person, b: Person, rng: Rng): boolean {
  if (!a.alive || !b.alive) return false
  if (a.spouseId || b.spouseId) return false
  if (a.age < 18 || b.age < 18 || a.age > 55 || b.age > 55) return false
  if (a.gender === b.gender) return false
  if (Math.abs(a.age - b.age) > 20) return false
  // Chance modulated by tribe familiarity (same tribe more likely).
  const p = a.tribe === b.tribe ? 0.5 : 0.15
  if (!chance(rng, p)) return false
  a.spouseId = b.id
  b.spouseId = a.id
  a.activity = 'marrying'
  b.activity = 'marrying'
  world.stats.marriages++
  log(world, 'marriage', `${a.name} and ${b.name} were wed at ${firstBuildingOfType(world, 'temple')?.name ?? 'the temple'}.`)
  // Move the wife into the husband's home if separate — simple choice; no
  // patriarchy statement intended, just a convention for household bookkeeping.
  const homeOf = (x: Person) => world.buildings.find((h) => h.id === x.homeId)
  const hHome = homeOf(a.gender === 'm' ? a : b)
  if (hHome) {
    ;(a.gender === 'm' ? b : a).homeId = hHome.id
    ;(a.gender === 'm' ? b : a).familyId = a.gender === 'm' ? a.familyId : b.familyId
  }
  return true
}

function tryProcreate(world: World, a: Person, b: Person, rng: Rng): void {
  if (!a.spouseId || a.spouseId !== b.id) return
  if (a.reproCooldown > 0 || b.reproCooldown > 0) return
  const mother = a.gender === 'f' ? a : b
  if (mother.age < 18 || mother.age > 42) return
  if (!chance(rng, 0.22)) return
  const father = a.gender === 'm' ? a : b
  const home = world.buildings.find((h) => h.id === mother.homeId)
  if (!home) return
  const gender = chance(rng, 0.5) ? 'm' : 'f'
  const tribe = mother.tribe
  const baby: Person = {
    id: world.nextPersonId++,
    name: pickName(rng, tribe, gender),
    gender,
    tribe,
    role: 'child',
    age: 0,
    lifespan: Math.max(50, 70 + (rng() - 0.5) * 20),
    hunger: 0.1,
    fatigue: 0.1,
    faith: 0.1,
    morality: 0.7,
    aggression: 0.1,
    wealth: 0,
    familyId: mother.familyId,
    homeId: home.id,
    parentIds: [mother.id, father.id],
    childrenIds: [],
    x: home.cx * world.cellSize,
    y: home.cy * world.cellSize,
    vx: 0,
    vy: 0,
    targetX: home.cx * world.cellSize,
    targetY: home.cy * world.cellSize,
    activity: 'nursing',
    emotion: 'contentment',
    interactionTimer: 0,
    alive: true,
    isCriminal: false,
    isSaint: false,
    crimesCommitted: 0,
    wanted: false,
    sentencedToDeath: false,
    reproCooldown: 0,
  }
  mother.childrenIds.push(baby.id)
  father.childrenIds.push(baby.id)
  mother.reproCooldown = 2
  father.reproCooldown = 1
  world.people.push(baby)
  world.stats.births++
  world.stats.population++
  const family = world.families.find((f) => f.id === mother.familyId)
  family?.members.add(baby.id)
  log(world, 'birth', `${mother.name} bore ${baby.name} of the ${tribe} community.`)
}

function killPerson(world: World, p: Person, cause: string): void {
  if (!p.alive) return
  p.alive = false
  p.activity = 'executed'
  p.causeOfDeath = cause
  p.emotion = 'calm'
  world.stats.deaths++
  world.stats.population = Math.max(0, world.stats.population - 1)
  const spouse = p.spouseId ? personById(world, p.spouseId) : undefined
  if (spouse) {
    spouse.spouseId = undefined
    spouse.emotion = 'grief'
  }
  log(world, 'death', `${p.name} (${Math.floor(p.age)}y) passed — ${cause}.`)
}

function ageAndNeeds(world: World, p: Person, dtYears: number, dt: number, rng: Rng): void {
  if (!p.alive) return
  p.age += dtYears
  if (p.reproCooldown > 0) p.reproCooldown = Math.max(0, p.reproCooldown - dtYears)
  // Needs drift, scaled per real-time second so aging speed doesn't starve
  // everyone. Working climbs a bit faster than resting.
  const workLoad = p.activity === 'working' || p.activity === 'walking' ? 0.018 : 0.008
  p.hunger = Math.min(1.5, p.hunger + workLoad * dt)
  p.fatigue = Math.min(1.5, p.fatigue + 0.012 * dt)
  if (p.activity === 'eating') p.hunger = Math.max(0, p.hunger - 0.6 * dt)
  if (p.activity === 'sleeping') p.fatigue = Math.max(0, p.fatigue - 0.5 * dt)
  if (p.activity === 'praying' || p.activity === 'meditating')
    p.faith = Math.min(1, p.faith + 0.1 * dt)

  // Life stage transitions.
  if (p.role === 'child' && p.age >= 6) p.role = 'student'
  if (p.role === 'student' && p.age >= 16) {
    // Pick an adult role, biased by parents' roles.
    const parentRoles = p.parentIds
      .map((id) => personById(world, id)?.role)
      .filter((r): r is Role => Boolean(r) && r !== 'child' && r !== 'student' && r !== 'elder')
    p.role = parentRoles.length && chance(rng, 0.5) ? pick(rng, parentRoles) : pick(rng, [
      'farmer',
      'merchant',
      'weaver',
      'potter',
      'blacksmith',
      'teacher',
      'doctor',
      'priest',
      'musician',
      'constable',
      p.gender === 'f' ? 'housewife' : 'farmer',
    ])
  }
  if (p.age >= 65 && p.role !== 'saint' && p.role !== 'judge') p.role = 'elder'

  // Chance of turning saintly with high faith + age.
  if (!p.isSaint && p.role !== 'child' && p.role !== 'student' && p.faith > 0.85 && chance(rng, 0.0005 * dt)) {
    p.isSaint = true
    p.role = 'saint'
    world.stats.saints++
    log(world, 'saint', `${p.name} renounced the world and joined the ashram.`)
  }

  // Natural death.
  if (p.age > p.lifespan) {
    killPerson(world, p, 'old age')
    return
  }
  if (p.hunger >= 1.5) {
    killPerson(world, p, 'starvation')
    return
  }
  // Rare disease death, gated to real time so it stays subtle.
  if (chance(rng, 0.0003 * dt * (p.age > 55 ? 3 : 1))) {
    killPerson(world, p, 'illness')
    return
  }
}

// --- Justice --------------------------------------------------------------

function nearestCriminal(world: World, cop: Person): Person | undefined {
  let best: Person | undefined
  let bestD = Infinity
  for (const p of world.people) {
    if (!p.alive || !p.wanted) continue
    const d = dist2(cop.x, cop.y, p.x, p.y)
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  return best
}

function tryCrime(world: World, p: Person, rng: Rng): void {
  if (!p.alive || p.role === 'saint' || p.role === 'child' || p.role === 'student') return
  if (p.morality > 0.5) return
  if (p.activity === 'jailed' || p.sentencedToDeath) return
  if (chance(rng, 0.0025)) {
    // Find a victim nearby — a merchant, elder, or beggar.
    const victim = world.people.find(
      (v) =>
        v.alive &&
        v.id !== p.id &&
        v.role !== 'constable' &&
        v.role !== 'judge' &&
        v.wealth > 30 &&
        dist2(v.x, v.y, p.x, p.y) < (world.cellSize * 6) ** 2,
    )
    if (!victim) return
    const stolen = Math.min(victim.wealth, 50 + rng() * 200)
    victim.wealth -= stolen
    p.wealth += stolen
    p.crimesCommitted++
    p.isCriminal = true
    p.wanted = true
    p.activity = 'stealing'
    p.emotion = 'greed'
    victim.emotion = 'anger'
    world.stats.crimes++
    log(world, 'crime', `${p.name} robbed ${victim.name} of ₹${Math.round(stolen)}.`)
  }
}

function processArrestOrTrial(world: World, cop: Person, crook: Person, rng: Rng): void {
  if (!cop.alive || !crook.alive) return
  if (!crook.wanted) return
  if (dist2(cop.x, cop.y, crook.x, crook.y) > (world.cellSize * 1.2) ** 2) return
  // Arrest.
  crook.wanted = false
  crook.activity = 'jailed'
  crook.emotion = 'shame'
  const jail = firstBuildingOfType(world, 'jail')
  if (jail) {
    crook.x = jail.cx * world.cellSize
    crook.y = jail.cy * world.cellSize
    crook.targetX = crook.x
    crook.targetY = crook.y
  }
  const severe = crook.crimesCommitted >= 3 || chance(rng, 0.1)
  crook.jailUntilYear = world.simYear + (severe ? 8 : 3)
  world.stats.arrests++
  log(world, 'arrest', `Constable ${cop.name} arrested ${crook.name}. Term: ${severe ? '8 years' : '3 years'}.`)
  // Very rare: capital sentence.
  if (crook.crimesCommitted >= 5 && chance(rng, 0.35)) {
    crook.sentencedToDeath = true
    log(world, 'trial', `${crook.name} is sentenced to death by the panchayat court.`)
  }
}

function processJailRelease(world: World, p: Person): void {
  if (p.activity !== 'jailed') return
  if (p.jailUntilYear !== undefined && world.simYear >= p.jailUntilYear) {
    p.activity = 'idle'
    p.jailUntilYear = undefined
    p.emotion = 'calm'
    log(world, 'note', `${p.name} was released from the kaidkhana.`)
  }
}

function processExecution(world: World, p: Person): void {
  if (!p.sentencedToDeath) return
  const gallows = firstBuildingOfType(world, 'gallows')
  if (!gallows) return
  const near =
    Math.abs(p.x / world.cellSize - gallows.cx) < 1.5 &&
    Math.abs(p.y / world.cellSize - gallows.cy) < 1.5
  if (!near) {
    // March there.
    p.targetX = gallows.cx * world.cellSize
    p.targetY = gallows.cy * world.cellSize
    p.targetBuildingId = gallows.id
    return
  }
  world.stats.executions++
  killPerson(world, p, 'executed at the gallows')
}

// --- Interactions ---------------------------------------------------------

function detectInteractions(world: World): void {
  // O(N²) but capped by population.
  world.interactions.length = 0
  const R = world.cellSize * 1.2
  const R2 = R * R
  const alive = world.people.filter((p) => p.alive)
  for (let i = 0; i < alive.length; i++) {
    const a = alive[i]!
    if (a.activity === 'jailed' || a.activity === 'executed') continue
    let closest: Person | undefined
    let bestD = R2
    for (let j = i + 1; j < alive.length; j++) {
      const b = alive[j]!
      if (b.activity === 'jailed' || b.activity === 'executed') continue
      const d = dist2(a.x, a.y, b.x, b.y)
      if (d < bestD) {
        bestD = d
        closest = b
      }
    }
    if (closest) {
      a.interactingWith = closest.id
      closest.interactingWith = a.id
      const kind = decideInteractionKind(a, closest)
      world.interactions.push({ a: a.id, b: closest.id, kind, since: world.simYear })
    } else {
      a.interactingWith = undefined
    }
  }
}

function decideInteractionKind(a: Person, b: Person): Interaction['kind'] {
  if (a.role === 'constable' && b.wanted) return 'arrest'
  if (b.role === 'constable' && a.wanted) return 'arrest'
  if ((a.role === 'thief' || a.role === 'dacoit') && (b.role === 'merchant' || b.role === 'elder')) return 'trade'
  if (a.role === 'teacher' && b.role === 'student') return 'teach'
  if (a.role === 'doctor') return 'heal'
  if (a.role === 'saint' || a.role === 'priest') return 'preach'
  if (a.role === 'merchant' || b.role === 'merchant') return 'trade'
  if (a.aggression > 0.7 && b.aggression > 0.7) return 'quarrel'
  if (!a.spouseId && !b.spouseId && a.age > 17 && b.age > 17 && a.gender !== b.gender) return 'flirt'
  return 'chat'
}

// --- Main tick -----------------------------------------------------------

export interface SimClock {
  rng: Rng
  since: number
}

export function createSimClock(seed: number): SimClock {
  return { rng: makeRng(seed ^ 0x9e3779b9), since: 0 }
}

// Advance the world by `realDt` real seconds. Multiple sub-steps for large
// dt so behaviour remains stable when browser tabs regain focus.
export function tickWorld(world: World, clock: SimClock, realDt: number): void {
  const maxStep = 0.1
  let remaining = Math.max(0, Math.min(2, realDt))
  while (remaining > 0) {
    const dt = Math.min(maxStep, remaining)
    remaining -= dt
    stepOnce(world, clock, dt)
  }
}

function stepOnce(world: World, clock: SimClock, dt: number): void {
  world.realSecondsElapsed += dt
  const dtYears = dt * world.yearsPerSecond
  world.simYear += dtYears
  // Day cycle: independent from aging, one full cycle every 24 real seconds
  // when speed is 1x — scales with yearsPerSecond so day/night keeps pace with
  // life at any playback speed.
  const cycleSpeed = Math.max(0.1, world.yearsPerSecond) / 0.5
  world.yearOfDay = (world.yearOfDay + dt * (1 / 24) * cycleSpeed) % 1
  world.simDays = Math.floor(world.simYear * 365)

  const rng = clock.rng

  // Per-person updates.
  for (const p of world.people) {
    ageAndNeeds(world, p, dtYears, dt, rng)
    if (!p.alive) continue
    processJailRelease(world, p)

    // Re-pick target periodically or if we reached the current one.
    const reached =
      Math.abs(p.targetX - p.x) < world.cellSize * 0.8 && Math.abs(p.targetY - p.y) < world.cellSize * 0.8
    if (reached || chance(rng, 0.01 * (60 * dt))) {
      const target = pickDailyTarget(world, p, rng)
      if (target) setTargetBuilding(world, p, target, 2)
    }

    // Motion — modulated by age and activity.
    const speedFactor =
      p.activity === 'jailed'
        ? 0
        : p.age < 6
          ? 22
          : p.age > 65
            ? 20
            : 34
    stepMotion(world, p, dt, speedFactor)

    // Assign activity for display.
    const b = world.buildings.find((bb) => bb.id === p.targetBuildingId)
    p.activity = assignActivity(world, p, b)
    p.emotion = updateEmotion(p, p.activity)

    // Justice: process gallows arrivals.
    processExecution(world, p)
    // Chance of crime.
    tryCrime(world, p, rng)
  }

  // Interaction & event pass.
  detectInteractions(world)
  for (const inter of world.interactions) {
    const a = personById(world, inter.a)
    const b = personById(world, inter.b)
    if (!a || !b) continue
    switch (inter.kind) {
      case 'arrest': {
        const cop = a.role === 'constable' ? a : b
        const crook = a === cop ? b : a
        processArrestOrTrial(world, cop, crook, rng)
        break
      }
      case 'trade': {
        // Merchant earns coppers each interaction.
        const merchant = a.role === 'merchant' ? a : b
        const other = merchant === a ? b : a
        if (other.wealth > 5) {
          other.wealth -= 5
          merchant.wealth += 5
        }
        break
      }
      case 'preach':
        a.faith = Math.min(1, a.faith + 0.02 * dt)
        b.faith = Math.min(1, b.faith + 0.02 * dt)
        break
      case 'teach':
        // Nothing to record; the mood boost is implicit.
        break
      case 'heal':
        a.fatigue = Math.max(0, a.fatigue - 0.1 * dt)
        b.fatigue = Math.max(0, b.fatigue - 0.1 * dt)
        break
      case 'quarrel':
        a.emotion = 'anger'
        b.emotion = 'anger'
        if (chance(rng, 0.001)) {
          const attacker = a.aggression > b.aggression ? a : b
          const victim = attacker === a ? b : a
          attacker.morality = Math.max(0, attacker.morality - 0.1)
          attacker.wanted = true
          world.stats.crimes++
          log(world, 'crime', `${attacker.name} assaulted ${victim.name} in the street.`)
        }
        break
      case 'flirt':
        tryMarriage(world, a, b, rng)
        break
      case 'chat':
        // Boost happiness slightly.
        a.emotion = 'joy'
        b.emotion = 'joy'
        break
    }
  }

  // Procreation pass: married couples in the same building.
  for (const f of world.families) {
    // Iterate members quickly.
    const married: Person[] = []
    for (const id of f.members) {
      const p = personById(world, id)
      if (p?.alive && p.spouseId) married.push(p)
    }
    for (const p of married) {
      const s = personById(world, p.spouseId!)
      if (!s || !s.alive) continue
      if (dist2(p.x, p.y, s.x, s.y) < (world.cellSize * 1.5) ** 2) tryProcreate(world, p, s, rng)
    }
  }

  // Constable AI: chase wanted criminals.
  for (const cop of world.people) {
    if (!cop.alive || cop.role !== 'constable') continue
    const target = nearestCriminal(world, cop)
    if (target) {
      cop.targetX = target.x
      cop.targetY = target.y
      cop.activity = 'walking'
    }
  }
}
