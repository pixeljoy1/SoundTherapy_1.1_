/** Session domain types — Drift spec §6.3 / §8.5. */

import { PaletteId } from '../theme/palettes'
import { TherapyId } from '../therapy/therapies'

/** Legacy synth descriptor — only `breathCycle` is used by the file-based engine
 *  (for the gradient breath-sync); the rest is retained metadata. */
export interface SessionSound {
  root: number
  breathCycle: number
  ambientDensity: number
  cutoff: number
  ambient: string
}

export type SessionGroup = 'sleep' | 'bodyScan' | 'breathwork' | 'chanting'

/** A single breath phase. duration in seconds; 0 = skip phase. */
export interface BreathPhase {
  label: 'Inhale' | 'Hold' | 'Exhale' | 'Rest'
  seconds: number
}

export interface BreathPattern {
  /** e.g. "4-7-8". Display only. */
  name: string
  phases: BreathPhase[]
}

export interface Session {
  id: string
  title: string
  group: SessionGroup
  /** Which sound-therapy modality this session delivers (drives Home chapters). */
  therapy: TherapyId
  /** Minutes (the session's nominal length). */
  durationMin: number
  palette: PaletteId
  /** URL of the looping audio track for this session. */
  track: string
  /** Retained synth metadata (breathCycle drives the gradient breath-sync). */
  sound: SessionSound
  /** Present only for breathwork sessions (§8.5). */
  breath?: BreathPattern
  /** Render a twinkling starfield overlay (e.g. Starfield). */
  stars?: boolean
  /** Recycling mindful subtitles (e.g. chant sayings from the Upanishads). */
  subtitles?: string[]
  /** Free tier sessions (§14): Drift, Coastal Night, Box Breath. */
  free: boolean
  /** Focus group is locked "Coming Soon" in MVP (§6.3). */
  comingSoon?: boolean
}

export const GROUP_LABEL: Record<SessionGroup, string> = {
  sleep: 'Sleep & Deep Rest',
  bodyScan: 'Sound Bath',
  breathwork: 'Breath & Tone',
  chanting: 'Vocal Resonance',
}
