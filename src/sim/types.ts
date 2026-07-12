// Core data model for the societal simulator.
//
// The world is a grid of walls and buildings inhabited by people (dots).
// Everything mutable lives on the World object so the simulation loop can
// mutate in place without churning React state each tick.

export type Gender = 'm' | 'f'

export type Tribe =
  | 'Punjabi'
  | 'Gujarati'
  | 'Tamil'
  | 'Bengali'
  | 'Marathi'
  | 'Malayali'
  | 'Kashmiri'
  | 'Sindhi'

export type Role =
  | 'child'
  | 'student'
  | 'farmer'
  | 'merchant'
  | 'weaver'
  | 'potter'
  | 'blacksmith'
  | 'teacher'
  | 'doctor'
  | 'priest'
  | 'musician'
  | 'housewife'
  | 'constable'
  | 'judge'
  | 'saint'
  | 'thief'
  | 'dacoit'
  | 'beggar'
  | 'elder'

export type Emotion =
  | 'calm'
  | 'joy'
  | 'love'
  | 'devotion'
  | 'contentment'
  | 'sadness'
  | 'grief'
  | 'anger'
  | 'fear'
  | 'greed'
  | 'envy'
  | 'shame'

export type Activity =
  | 'idle'
  | 'walking'
  | 'working'
  | 'eating'
  | 'sleeping'
  | 'praying'
  | 'studying'
  | 'teaching'
  | 'chatting'
  | 'courting'
  | 'marrying'
  | 'nursing'
  | 'mourning'
  | 'meditating'
  | 'plotting'
  | 'stealing'
  | 'arresting'
  | 'jailed'
  | 'on_trial'
  | 'executed'
  | 'healing'
  | 'begging'
  | 'playing'

export type BuildingType =
  | 'home'
  | 'temple'
  | 'market'
  | 'school'
  | 'farm'
  | 'workshop'
  | 'clinic'
  | 'ashram'
  | 'panchayat'
  | 'court'
  | 'jail'
  | 'gallows'
  | 'well'
  | 'chai_stall'

export interface Building {
  id: number
  name: string
  type: BuildingType
  // Rectangle in world coordinates (grid cells).
  x: number
  y: number
  w: number
  h: number
  // Cached center for pathing.
  cx: number
  cy: number
  // Occupancy roster (person ids currently physically inside).
  occupants: Set<number>
  // Optional "home" ties for residences.
  familyId?: number
}

export interface Person {
  id: number
  name: string
  gender: Gender
  tribe: Tribe
  role: Role
  // Age in simulated years. Increments continuously.
  age: number
  // Life expectancy — natural death rolls in once age crosses this envelope.
  lifespan: number
  // 0..1 sliders driving behaviour.
  hunger: number
  fatigue: number
  faith: number
  morality: number // low = crime-prone
  aggression: number
  wealth: number // rupees, abstract
  // Social ties.
  familyId: number
  homeId: number
  spouseId?: number
  parentIds: [number, number] | []
  childrenIds: number[]
  // World position (pixel coords for smooth motion).
  x: number
  y: number
  vx: number
  vy: number
  // Movement target (pixel coords) plus building id we're heading to.
  targetX: number
  targetY: number
  targetBuildingId?: number
  // Runtime state.
  activity: Activity
  emotion: Emotion
  interactingWith?: number
  interactionTimer: number
  // Life status.
  alive: boolean
  causeOfDeath?: string
  // Justice state.
  isCriminal: boolean
  isSaint: boolean
  crimesCommitted: number
  wanted: boolean
  jailUntilYear?: number
  sentencedToDeath: boolean
  // Reproduction cooldown so births don't run away.
  reproCooldown: number
}

export interface Family {
  id: number
  surname: string
  tribe: Tribe
  homeId: number
  members: Set<number>
}

export interface Interaction {
  a: number
  b: number
  kind: 'chat' | 'trade' | 'court' | 'arrest' | 'teach' | 'heal' | 'preach' | 'flirt' | 'quarrel'
  since: number // simulated year the interaction started
}

// Log of noteworthy events (births, marriages, deaths, sentences).
export interface WorldEvent {
  year: number // fractional simulated years since sim start
  clock: string // formatted DD:HH:MM
  text: string
  kind: 'birth' | 'death' | 'marriage' | 'crime' | 'arrest' | 'trial' | 'execution' | 'saint' | 'note'
}

export interface World {
  // Simulation clock.
  simYear: number // fractional years elapsed
  yearOfDay: number // 0..1 within the current day (day/night cycle)
  simDays: number
  realSecondsElapsed: number
  // Speed: how many simulated years pass per real second when running.
  yearsPerSecond: number
  // Grid & pixel size.
  cellSize: number
  cols: number
  rows: number
  // Terrain — grid of wall cells (impassable). 0 = open, 1 = wall.
  walls: Uint8Array
  // Content.
  buildings: Building[]
  people: Person[]
  families: Family[]
  interactions: Interaction[]
  events: WorldEvent[]
  // Autoincrement counters.
  nextPersonId: number
  nextFamilyId: number
  // Aggregates for the UI (kept fresh so panel doesn't recompute each frame).
  stats: {
    population: number
    births: number
    deaths: number
    marriages: number
    crimes: number
    arrests: number
    executions: number
    saints: number
  }
}

export interface SimConfig {
  seed: number
  cols: number
  rows: number
  cellSize: number
  initialPopulation: number
  yearsPerSecond: number
}
