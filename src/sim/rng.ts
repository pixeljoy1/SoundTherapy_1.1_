// Small deterministic PRNG so a given seed reproduces the same run.
// Mulberry32 — cheap and adequate for a simulation of a few hundred agents.

export type Rng = () => number

export function makeRng(seed: number): Rng {
  let a = seed >>> 0
  return function rand(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randInt(rng: Rng, lo: number, hi: number): number {
  return Math.floor(rng() * (hi - lo + 1)) + lo
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

export function chance(rng: Rng, p: number): boolean {
  return rng() < p
}

export function gauss(rng: Rng, mean: number, stdev: number): number {
  // Box–Muller.
  const u = 1 - rng()
  const v = rng()
  return mean + stdev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
