import type { Tribe, Role } from './types'

export const TRIBES: readonly Tribe[] = [
  'Punjabi',
  'Gujarati',
  'Tamil',
  'Bengali',
  'Marathi',
  'Malayali',
  'Kashmiri',
  'Sindhi',
] as const

// Distinct, colourblind-friendly-ish palette for tribe hues on the map.
export const TRIBE_COLORS: Record<Tribe, string> = {
  Punjabi: '#f2994a',
  Gujarati: '#eb5757',
  Tamil: '#27ae60',
  Bengali: '#9b51e0',
  Marathi: '#2f80ed',
  Malayali: '#00b8a9',
  Kashmiri: '#f2c94c',
  Sindhi: '#eb8fd1',
}

// Adult role palette; children/students/elders are handled separately.
export const ADULT_ROLES: readonly Role[] = [
  'farmer',
  'merchant',
  'weaver',
  'potter',
  'blacksmith',
  'teacher',
  'doctor',
  'priest',
  'musician',
  'housewife',
  'constable',
  'judge',
  'saint',
  'beggar',
] as const

export const ROLE_GLYPH: Record<Role, string> = {
  child: 'C',
  student: 'S',
  farmer: 'F',
  merchant: 'M',
  weaver: 'W',
  potter: 'P',
  blacksmith: 'B',
  teacher: 'T',
  doctor: 'D',
  priest: 'P',
  musician: 'M',
  housewife: 'H',
  constable: 'K',
  judge: 'J',
  saint: 'A', // ascetic
  thief: 'X',
  dacoit: 'X',
  beggar: 'b',
  elder: 'E',
}
