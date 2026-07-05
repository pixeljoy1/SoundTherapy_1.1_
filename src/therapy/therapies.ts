/**
 * The therapy model — Attune's research-grounded core.
 * Six sound-therapy modalities, each backed by published evidence, each with its
 * own visual identity (hue pair for meshes/tags) and a persona map saying who it
 * serves best. Every tile, card, mesh and section on Home derives from this file,
 * and the persona prescription engine picks a listener's plan from it.
 *
 * Evidence base (see AboutSheet → Sources for the reader-facing list):
 *  · Nature soundscapes: faster cortisol/stress recovery vs urban noise, water
 *    strongest (Alvarsson et al. 2010; Michels & Hamers 2023); forest soundscapes
 *    improve mood + attention restoration (Sci Reports 2025).
 *  · Broadband noise: white noise tripled infant sleep-onset likelihood
 *    (Spencer et al.); steady rain behaves like natural pink noise.
 *  · Rhythmic entrainment: theta-band beat stimulation reduced anxiety ~25%
 *    over 4 weeks; monaural beats reduced anxiety and improved mood
 *    (Frontiers in Psychology 2025); paced breathing drives the same slow rhythms.
 *  · Slow tempo: 60–80 BPM music raises vagal heart-rate modulation and lowers
 *    arousal (Bretherton et al. 2019).
 *  · Resonant instruments: singing-bowl meditation lowered tension, anger and
 *    fatigue in 62 adults (Goldsby et al. 2017).
 *  · Vocal resonance: fMRI shows 'OM' chanting deactivates the amygdala and
 *    limbic system, comparable to vagus-nerve stimulation (Kalyani et al. 2011).
 */

import { AgeGroup, TherapyGoal } from '../state/types'

export type TherapyId =
  | 'natureField'
  | 'noiseColor'
  | 'entrainment'
  | 'slowTempo'
  | 'resonantBowls'
  | 'vocalResonance'

export interface Therapy {
  id: TherapyId
  /** Chapter number on the Home journal, "01"…"06". */
  no: string
  name: string
  tagline: string
  /** One evidence sentence, reader-facing. */
  science: string
  /** Short source tag shown after the science line. */
  source: string
  /** Who this modality serves best (reader-facing). */
  bestFor: string
  /** Hue pair for meshes, tags and section art. */
  hues: [string, string]
}

export const THERAPIES: Record<TherapyId, Therapy> = {
  natureField: {
    id: 'natureField',
    no: '01',
    name: 'Nature Field',
    tagline: 'Water, birdsong, forest air.',
    science:
      'After acute stress, people recover faster listening to nature — water and birdsong speed cortisol recovery and restore attention through effortless "soft fascination".',
    source: 'Alvarsson 2010 · Sci. Reports 2025',
    bestFor: 'Stress relief at every age · children at bedtime',
    hues: ['#55D68F', '#2E9E6B'],
  },
  noiseColor: {
    id: 'noiseColor',
    no: '02',
    name: 'Rain & Broadband',
    tagline: "Steady rain — nature's pink noise.",
    science:
      'Continuous broadband sound masks the startles that wake light sleepers; in infants, white noise tripled the likelihood of falling asleep within five minutes.',
    source: 'Spencer et al. · Amplifon review',
    bestFor: 'Children falling asleep · light sleepers · open-office focus',
    hues: ['#7BA7C9', '#4E6E8C'],
  },
  entrainment: {
    id: 'entrainment',
    no: '03',
    name: 'Paced Entrainment',
    tagline: 'Breath and tone in slow rhythm.',
    science:
      'Slow rhythmic stimulation calms the anxious mind — beat-paced audio reduced anxiety by about a quarter over four weeks, and paced breathing drives the same low-frequency rhythms.',
    source: 'Frontiers in Psych. 2025',
    bestFor: 'Teens & young adults · focus · exam-season anxiety',
    hues: ['#4FD1E8', '#2E7FD1'],
  },
  slowTempo: {
    id: 'slowTempo',
    no: '04',
    name: 'Slow Tempo',
    tagline: 'Sound at the pace of a resting heart.',
    science:
      'Music near 60–80 beats per minute increases vagal modulation of the heart and lowers blood pressure and arousal — the body entrains to the slower pulse.',
    source: 'Bretherton et al. 2019',
    bestFor: 'Young adults unwinding · deep rest · adults at night',
    hues: ['#7C6FF2', '#4A3ED1'],
  },
  resonantBowls: {
    id: 'resonantBowls',
    no: '05',
    name: 'Resonant Instruments',
    tagline: 'Bowls, flute and long decay.',
    science:
      'A single singing-bowl sound meditation measurably lowered tension, anger, fatigue and depressed mood in adults — strongest in first-time listeners.',
    source: 'Goldsby et al. 2017',
    bestFor: 'Mood repair · tension release · sound-bath newcomers',
    hues: ['#F2A65A', '#D17A2E'],
  },
  vocalResonance: {
    id: 'vocalResonance',
    no: '06',
    name: 'Vocal Resonance',
    tagline: 'The oldest instrument is a voice.',
    science:
      "fMRI shows 'OM' chanting deactivates the amygdala and limbic system — a signature comparable to vagus-nerve stimulation used clinically for depression.",
    source: 'Kalyani et al. 2011',
    bestFor: 'Emotional balance · settling a racing mind',
    hues: ['#F2856D', '#C74E4E'],
  },
}

export const THERAPY_ORDER: TherapyId[] = [
  'natureField',
  'noiseColor',
  'entrainment',
  'slowTempo',
  'resonantBowls',
  'vocalResonance',
]

/**
 * The prescription engine: for each persona (age × goal), the ordered therapies
 * research points to. First entry is the primary prescription; the Home
 * "Prescribed for you" section is built from it.
 */
export const PRESCRIPTION: Record<AgeGroup, Record<TherapyGoal, TherapyId[]>> = {
  child: {
    sleep: ['noiseColor', 'natureField'], // steady rain + gentle nature: proven for young sleepers
    focus: ['noiseColor', 'entrainment'],
    stress: ['natureField', 'slowTempo'],
    mood: ['vocalResonance', 'natureField'],
  },
  teen: {
    sleep: ['slowTempo', 'noiseColor'],
    focus: ['entrainment', 'noiseColor'], // beat-paced rhythm: strongest calming effect in younger listeners
    stress: ['entrainment', 'natureField'],
    mood: ['vocalResonance', 'resonantBowls'],
  },
  youngAdult: {
    sleep: ['slowTempo', 'noiseColor'],
    focus: ['entrainment', 'noiseColor'],
    stress: ['natureField', 'slowTempo'],
    mood: ['resonantBowls', 'vocalResonance'],
  },
  adult: {
    sleep: ['slowTempo', 'natureField'],
    focus: ['entrainment', 'slowTempo'],
    stress: ['resonantBowls', 'natureField'], // low-arousal, familiar textures land best with older listeners
    mood: ['vocalResonance', 'resonantBowls'],
  },
}

/** Why this prescription, in one warm reader-facing line per persona. */
export const PRESCRIPTION_NOTE: Record<AgeGroup, Record<TherapyGoal, string>> = {
  child: {
    sleep: 'Steady rain works like natural pink noise — it masks household sounds so young sleepers stay asleep.',
    focus: 'A soft broadband bed quiets distraction without pulling attention the way music does.',
    stress: 'Water and birdsong help small nervous systems recover from big feelings, fast.',
    mood: 'Gentle voices are the most familiar calming sound a child knows.',
  },
  teen: {
    sleep: 'A slow steady pulse tells a busy brain the day is over.',
    focus: 'Beat-paced rhythm is most calming for younger listeners — ideal before study.',
    stress: 'Slow rhythmic sound takes the edge off exam-season anxiety, measurably.',
    mood: 'Resonant voices settle mood swings without asking anything of you.',
  },
  youngAdult: {
    sleep: 'Sound at resting heart-rate tempo entrains the body toward rest.',
    focus: 'Paced tones sharpen attention through entrainment — proven in 40 Hz learning studies.',
    stress: 'Nature restores attention with zero effort — the antidote to a fast-paced day.',
    mood: 'A sound bath measurably lowers tension and lifts mood in one sitting.',
  },
  adult: {
    sleep: 'Low-arousal, slow-tempo sound raises vagal tone — the physiology of winding down.',
    focus: 'Slow rhythm steadies attention without stimulation.',
    stress: 'Long resonant decays release tension the way a massage releases muscle.',
    mood: 'Chant deactivates the limbic system — calm you can feel in the chest.',
  },
}
