// How much construction do we see in the first ~60 sim years?
import { generateWorld } from '../src/sim/world.ts'
import { createSimClock, tickWorld } from '../src/sim/simulation.ts'

const w = generateWorld({
  seed: 20260712,
  cols: 68,
  rows: 44,
  cellSize: 22,
  initialPopulation: 60,
  yearsPerSecond: 0.6,
})
const clock = createSimClock(20260712)
// Simulate 90 real seconds at default speed = 54 sim years.
for (let i = 0; i < 90 * 30; i++) tickWorld(w, clock, 1 / 30)
console.log('simYear:', w.simYear.toFixed(2))
console.log('stats:', w.stats)
console.log('living:', w.people.filter((p) => p.alive).length)
console.log('buildings raised (emergent):', w.stats.buildingsRaised)
console.log('buildings by type:',
  Object.entries(w.buildings.reduce((m, b) => ((m[b.type] = (m[b.type] ?? 0) + 1), m), {})))
console.log('planned:', w.planned.map((p) => `${p.type} ${(p.progress * 100).toFixed(0)}%`).join(', '))
console.log('thriving:', w.thrivingScore.toFixed(1))
console.log('recent notes:')
for (const e of w.events.filter((e) => e.kind === 'note').slice(-8)) console.log(`  ${e.clock} ${e.text}`)
