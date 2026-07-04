/** Shared helpers — greetings, palette resolution, haptics, formatting. */

import { PaletteId } from '../theme/palettes'
import { Session } from '../session/types'
import { Settings, SleepTimer } from './types'

/** §8.1 greeting adapts to time of day. */
export function greeting(now = new Date()): string {
  const h = now.getHours()
  if (h >= 18 || h < 2) return 'Good evening'
  if (h >= 2 && h < 6) return 'Rest well'
  return 'Take a breath'
}

/** Rotating invitation lines — a fresh one each visit (≥10 before any repeat). */
const INVITATIONS = [
  'What does your mind need today?',
  'Let sound do the settling.',
  'Tune out the noise. Tune into you.',
  'Ready to reset your frequency?',
  'Let your shoulders drop.',
  'Breathe out the day.',
  'What would feel good right now?',
  'Find your resonance.',
  'Set the day down for a while.',
  'Sink into a sound bath?',
  'Nothing to do but listen.',
  'Time to come back to yourself.',
]

/** Returns the next invitation line, cycling so all are shown before repeating. */
export function nextInvitation(): string {
  let i = 0
  try {
    i = parseInt(localStorage.getItem('attune.invite.idx') || '0', 10) || 0
    localStorage.setItem('attune.invite.idx', String((i + 1) % INVITATIONS.length))
  } catch {
    i = Math.floor(Math.random() * INVITATIONS.length)
  }
  return INVITATIONS[i % INVITATIONS.length]
}

/** Resolve the palette actually used: preference overrides session default (§9.1). */
export function effectivePalette(session: Session, settings: Settings): PaletteId {
  return settings.preferredPalette === 'auto' ? session.palette : settings.preferredPalette
}

/** Freemium: the 30-second trial is free for everyone; 5 min and up is Pro. */
export function isProTimer(t: SleepTimer): boolean {
  if (t === 'infinite') return true
  return t >= 5
}

export function timerLabel(t: SleepTimer): string {
  if (t === 'infinite') return 'Until I stop it'
  if (t === 0.5) return '30 sec · trial'
  return `${t} min`
}

/** mm:ss for the session timer (§8.3). */
export function clock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** §7.1 haptic language. Best-effort; no-op where unsupported. */
export const haptic = {
  light: () => navigator.vibrate?.(8),
  medium: () => navigator.vibrate?.(18),
  doublePulse: () => navigator.vibrate?.([14, 80, 14]),
}

/** §12.3 honor system reduced-motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** Every session is trial-able (30s) by anyone; only "coming soon" is locked.
 * The Pro gate lives on the sleep-timer length, not the session. */
export function isLocked(session: Session): boolean {
  return !!session.comingSoon
}
