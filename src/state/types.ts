/** App state types — Drift spec §9 (Settings) + navigation model §7.3. */

import { PaletteId } from '../theme/palettes'

export type Screen = 'gate' | 'onboarding' | 'home' | 'preplay' | 'session'

/** Sleep timer in minutes, or 'infinite' = "Until I stop it" (§6.2).
 *  0.5 = a 30-second trial. */
export type SleepTimer = number | 'infinite'

export const TIMER_OPTIONS: SleepTimer[] = [0.5, 10, 20, 30, 45, 60, 'infinite']

export type ThemeMode = 'dark' | 'pastel'

/** Sound therapy is tuned per age group — each experiences distinct benefits. */
export type AgeGroup = 'child' | 'teen' | 'youngAdult' | 'adult'

/** What the listener wants from sound therapy; chosen during onboarding. */
export type TherapyGoal = 'sleep' | 'focus' | 'stress' | 'mood'

export const AGE_LABEL: Record<AgeGroup, string> = {
  child: 'Child (under 13)',
  teen: 'Teenager',
  youngAdult: 'Young adult',
  adult: 'Adult',
}

export const GOAL_LABEL: Record<TherapyGoal, string> = {
  sleep: 'Better sleep',
  focus: 'Focus & clarity',
  stress: 'Stress relief',
  mood: 'Emotional balance',
}

/** Age-specific benefit lines (research-informed) surfaced in onboarding & About. */
export const AGE_BENEFIT: Record<AgeGroup, string> = {
  child: 'Improved focus, better sleep patterns, and emotional balance.',
  teen: 'Reduced stress, enhanced concentration, and support with anxiety and mood swings.',
  youngAdult: 'Relaxation, productivity enhancement, and mental clarity for a fast-paced life.',
  adult: 'Deep rest, lower stress, and a steadier, calmer baseline.',
}

export interface Settings {
  // §9.1 Personalization
  name: string
  ageGroup: AgeGroup
  goal: TherapyGoal
  theme: ThemeMode
  preferredPalette: 'auto' | PaletteId
  defaultSessionLength: number // minutes, informational
  // §9.2 Sleep behavior
  defaultSleepTimer: SleepTimer
  screenOffAfter: boolean
  bedtimeMode: boolean
  // §9.3 Audio
  preloadWifiOnly: boolean
  audioQuality: 'standard' | 'flac' // flac requires premium
  // §9 opt-in nightly prompt, off by default
  nightlyPrompt: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  ageGroup: 'youngAdult',
  goal: 'stress',
  theme: 'dark',
  preferredPalette: 'auto',
  defaultSessionLength: 30,
  defaultSleepTimer: 45,
  screenOffAfter: true,
  bedtimeMode: false,
  preloadWifiOnly: true,
  audioQuality: 'standard',
  nightlyPrompt: false,
}

/** A user-submitted request for a new theme (§ feature). */
export interface ThemeRequest {
  id: string
  name: string
  mood: string
  note: string
  createdAt: number
}

export interface Persisted {
  settings: Settings
  onboardingComplete: boolean
  premium: boolean
  lastPlayedId: string | null
  requests: ThemeRequest[]
}

export const DEFAULT_PERSISTED: Persisted = {
  settings: DEFAULT_SETTINGS,
  onboardingComplete: false,
  premium: false,
  lastPlayedId: null,
  requests: [],
}
