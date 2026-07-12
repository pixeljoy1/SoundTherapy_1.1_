// Smoke test — run the simulation engine directly, no browser.
import { generateWorld } from '../src/sim/world.ts'
import { createSimClock, tickWorld } from '../src/sim/simulation.ts'

const w = generateWorld({
  seed: 42,
  cols: 68,
  rows: 44,
  cellSize: 22,
  initialPopulation: 60,
  yearsPerSecond: 2.0,
})
const clock = createSimClock(42)
const t0 = performance.now()
for (let i = 0; i < 3000; i++) {
  tickWorld(w, clock, 1 / 30)
}
const dt = performance.now() - t0
console.log('elapsed_ms:', dt.toFixed(0))
console.log('simYear:', w.simYear.toFixed(2))
console.log('stats:', w.stats)
console.log('living:', w.people.filter((p) => p.alive).length)
console.log('sample events:')
for (const e of w.events.slice(-10)) console.log(`  ${e.clock} [${e.kind}] ${e.text}`)
