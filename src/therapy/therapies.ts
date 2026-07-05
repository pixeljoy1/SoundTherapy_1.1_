/**
 * The therapy model — Attune's research-grounded core.
 * Seven sound-therapy modalities, each backed by published evidence, each with
 * its own visual identity (hue pair + tile artwork) and a persona map saying who
 * it serves best. Every tile, card, mesh and section on Home derives from this
 * file; the persona prescription engine picks a listener's plan from it, and the
 * evidence window (TherapyInfoSheet) reads the long-form science + sources here.
 */

import { AgeGroup, TherapyGoal } from '../state/types'

export type TherapyId =
  | 'natureField'
  | 'noiseColor'
  | 'asmrStudy'
  | 'entrainment'
  | 'slowTempo'
  | 'resonantBowls'
  | 'vocalResonance'

/** Resolve a tile artwork to a URL (served from public/img). */
export const ART = (file: string) => `${import.meta.env.BASE_URL}img/${file}`

export interface TherapySource {
  label: string
  url: string
}

export interface Therapy {
  id: TherapyId
  /** Chapter number on the Home journal, "01"…"07". */
  no: string
  /** Agent-style codename for the Therapy Matrix (quiet-systems layer). */
  code: string
  name: string
  tagline: string
  /** One evidence sentence, reader-facing. */
  science: string
  /** Longer plain-language explanation for the evidence window. */
  detail: string
  /** Short source tag shown after the science line. */
  source: string
  /** Full citations for the evidence window. */
  sources: TherapySource[]
  /** Who this modality serves best (reader-facing). */
  bestFor: string
  /** Hue pair for meshes, tags and section art. */
  hues: [string, string]
  /** Tile artwork (public/img). */
  art: string
}

export const THERAPIES: Record<TherapyId, Therapy> = {
  natureField: {
    id: 'natureField',
    no: '01',
    code: 'NATURE_FIELD',
    name: 'Nature Field',
    tagline: 'Water, birdsong, forest air.',
    science:
      'After acute stress, people recover faster listening to nature — water and birdsong speed cortisol recovery and restore attention through effortless "soft fascination".',
    detail:
      'In lab studies, physiological stress markers return to baseline sooner when people hear natural soundscapes instead of urban noise, with water sounds showing the strongest recovery effect. Attention-restoration research adds that nature holds the mind gently — enough to occupy it, never enough to tax it — which is why a forest can feel like rest for the eyes and the ears at once.',
    source: 'Alvarsson 2010 · Sci. Reports 2025',
    sources: [
      { label: 'Alvarsson et al. 2010 — stress recovery during nature sound (PMC)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2872309/' },
      { label: 'Forest soundscapes improve mood & restoration — Scientific Reports 2025', url: 'https://www.nature.com/articles/s41598-025-11469-x' },
      { label: 'Michels & Hamers 2023 — water vs bird sound for recovery', url: 'https://journals.sagepub.com/doi/abs/10.1177/00139165231174622' },
    ],
    bestFor: 'Stress relief at every age · children at bedtime',
    hues: ['#55D68F', '#2E9E6B'],
    art: 'forest.svg',
  },
  noiseColor: {
    id: 'noiseColor',
    no: '02',
    code: 'RAIN_KEEPER',
    name: 'Rain & Broadband',
    tagline: "Steady rain — nature's pink noise.",
    science:
      'Continuous broadband sound masks the startles that wake light sleepers; in infants, white noise tripled the likelihood of falling asleep within five minutes.',
    detail:
      'Broadband sound works by evening out the auditory landscape: sudden spikes — a door, a dog, a passing car — get absorbed into the steady bed, so the sleeping brain has nothing to startle at. Steady rain is the natural version, its energy sloping gently toward the low frequencies the way pink noise does. For children especially, that constancy reads as safety.',
    source: 'Spencer et al. · Amplifon review',
    sources: [
      { label: 'White noise and infant sleep onset — clinical review (Amplifon)', url: 'https://www.amplifon.com/uk/audiology-magazine/white-noises' },
      { label: 'Alpha binaural beats vs white noise for cognition (PMC 2025)', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12287642/' },
    ],
    bestFor: 'Children falling asleep · light sleepers · noisy rooms',
    hues: ['#7BA7C9', '#4E6E8C'],
    art: 'rain.svg',
  },
  asmrStudy: {
    id: 'asmrStudy',
    no: '03',
    code: 'WHISPER_TUTOR',
    name: 'ASMR & Study Beds',
    tagline: 'Whisper-soft sound for deep work.',
    science:
      'ASMR listening lowers heart rate by about 3 bpm — on par with mindfulness — and lyric-free, low-volume background beds measurably support student attention.',
    detail:
      'Two findings meet here. ASMR — gentle, close, repetitive sound — reliably slows the heart in responders (−3.14 bpm in the first controlled study, comparable to established stress-reduction techniques) while raising focus-friendly calm. And classroom research keeps landing on the same recipe for study sound: no lyrics, steady texture, low volume — enough signal to mask distraction, never enough to compete with the work. This chapter is that recipe: whisper-soft textures and steady beds tuned for homework, revision and deep work.',
    source: 'Poerio 2018 · Atlantis Press 2023',
    sources: [
      { label: 'Poerio et al. 2018 — ASMR lowers heart rate (PLOS One)', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0196645' },
      { label: 'Soft lyric-free music raises student attention (Atlantis Press 2023)', url: 'https://www.atlantis-press.com/proceedings/ssha-23/125988693' },
      { label: 'Background music & attention performance (PubMed)', url: 'https://pubmed.ncbi.nlm.nih.gov/22523045/' },
      { label: 'ASMR & parasympathetic activity (Neuroscience of Consciousness 2025)', url: 'https://academic.oup.com/nc/article/2025/1/niaf012/8127084' },
    ],
    bestFor: 'Students & young adults · homework, revision, deep work',
    hues: ['#C9A2F2', '#8A5CD1'],
    art: 'asmr.svg',
  },
  entrainment: {
    id: 'entrainment',
    no: '04',
    code: 'PULSE_PACER',
    name: 'Paced Entrainment',
    tagline: 'Breath and tone in slow rhythm.',
    science:
      'Slow rhythmic stimulation calms the anxious mind — beat-paced audio reduced anxiety by about a quarter over four weeks, and paced breathing drives the same low-frequency rhythms.',
    detail:
      'The nervous system follows rhythm. Give it a slow, steady one — a beat pattern, a breath cycle counted in seconds — and heart rate, breathing and cortical activity begin to fall in step. Studies of beat-paced audio report meaningful anxiety reduction over weeks of daily use, with the calming effect most pronounced in younger listeners. The breathwork sessions here pace you visually and sonically at once.',
    source: 'Frontiers in Psych. 2025',
    sources: [
      { label: 'Monaural beats reduce anxiety, improve mood — Frontiers in Psychology 2025', url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1539823/full' },
      { label: 'Binaural beats overview — Healthline (evidence summary)', url: 'https://www.healthline.com/health/binaural-beats' },
    ],
    bestFor: 'Teens & young adults · pre-exam nerves · racing thoughts',
    hues: ['#4FD1E8', '#2E7FD1'],
    art: 'breath.svg',
  },
  slowTempo: {
    id: 'slowTempo',
    no: '05',
    code: 'TEMPO_HEART',
    name: 'Slow Tempo',
    tagline: 'Sound at the pace of a resting heart.',
    science:
      'Music near 60–80 beats per minute increases vagal modulation of the heart and lowers blood pressure and arousal — the body entrains to the slower pulse.',
    detail:
      'Sixty beats per minute is a resting heart. Music that moves at that pace nudges the cardiovascular system toward it: controlled-tempo studies show stronger vagal (rest-and-digest) heart modulation at 60 BPM than at faster tempi, alongside lower blood pressure and emotional arousal. It is the physiology of winding down, delivered as sound.',
    source: 'Bretherton et al. 2019',
    sources: [
      { label: 'Bretherton et al. 2019 — tempo & cardiovascular autonomic function', url: 'https://journals.sagepub.com/doi/10.1177/2059204319858281' },
      { label: 'Slow-tempo music aids recovery after exertion (ScienceDirect)', url: 'https://www.sciencedirect.com/science/article/pii/S0001691825007693' },
    ],
    bestFor: 'Young adults unwinding · deep rest · adults at night',
    hues: ['#7C6FF2', '#4A3ED1'],
    art: 'waves.svg',
  },
  resonantBowls: {
    id: 'resonantBowls',
    no: '06',
    code: 'BOWL_KEEPER',
    name: 'Resonant Instruments',
    tagline: 'Bowls, flute and long decay.',
    science:
      'A single singing-bowl sound meditation measurably lowered tension, anger, fatigue and depressed mood in adults — strongest in first-time listeners.',
    detail:
      'In an observational study of 62 adults, one Tibetan singing-bowl meditation significantly reduced tension, anger, fatigue and depressed mood, with spiritual well-being rising across the group. The long, slowly decaying overtones of struck metal and wooden flute give the auditory system a single unhurried thing to follow — the sonic equivalent of watching a slow tide.',
    source: 'Goldsby et al. 2017',
    sources: [
      { label: 'Goldsby et al. 2017 — singing bowl meditation study (PMC)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5871151/' },
      { label: 'Tibetan singing bowls & wellbeing — student review 2024', url: 'https://inspirestudentjournal.co.uk/wp-content/uploads/2024/11/Inspire-Student-Journal-Serena-Deekollu.pdf' },
    ],
    bestFor: 'Adult therapy · tension release · sound-bath newcomers',
    hues: ['#F2A65A', '#D17A2E'],
    art: 'bowl.svg',
  },
  vocalResonance: {
    id: 'vocalResonance',
    no: '07',
    code: 'OM_VOICE',
    name: 'Vocal Resonance',
    tagline: 'The oldest instrument is a voice.',
    science:
      "fMRI shows 'OM' chanting deactivates the amygdala and limbic system — a signature comparable to vagus-nerve stimulation used clinically for depression.",
    detail:
      "The Hindu and Buddhist contemplative traditions arrived at slow vocal resonance centuries before neuroscience could ask why it works. Now imaging offers a clue: during 'OM' chanting, the brain's alarm centres — amygdala, hippocampus, anterior cingulate — quiet down, in a pattern researchers compare to vagus-nerve stimulation, a clinical treatment for depression and epilepsy. The chants in this chapter are sung with their traditional texts, subtitled with their sources.",
    source: 'Kalyani et al. 2011',
    sources: [
      { label: "Kalyani et al. 2011 — 'OM' chanting fMRI (PubMed)", url: 'https://pubmed.ncbi.nlm.nih.gov/21654968/' },
      { label: 'Omkar chanting & the nervous system — review', url: 'https://www.researchgate.net/publication/361149208_A_REVIEW_OF_THE_EFFECT_OF_OMKAR_MANTRA_CHANTING_ON_THE_NERVOUS_SYSTEM_AND_ITS_BENEFITS' },
    ],
    bestFor: 'Adult therapy · emotional balance · settling a racing mind',
    hues: ['#F2856D', '#C74E4E'],
    art: 'lotus.svg',
  },
}

export const THERAPY_ORDER: TherapyId[] = [
  'natureField',
  'noiseColor',
  'asmrStudy',
  'entrainment',
  'slowTempo',
  'resonantBowls',
  'vocalResonance',
]

/** Curated free streams to continue studying with (evidence window, Study chapter). */
export const STUDY_STREAMS: TherapySource[] = [
  { label: 'lofi hip hop radio — beats to relax/study to (Lofi Girl)', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  { label: 'Rainy Mood — endless rain for working', url: 'https://rainymood.com' },
  { label: 'musicForProgramming() — focus mixes', url: 'https://musicforprogramming.net' },
]

/**
 * The prescription engine: for each persona (age × goal), the ordered therapies
 * research points to. First entry is the primary prescription; the Home
 * "Prescribed for you" section is built from it. Students and young adults are
 * deliberately nudged toward ASMR & study beds for focus.
 */
export const PRESCRIPTION: Record<AgeGroup, Record<TherapyGoal, TherapyId[]>> = {
  child: {
    sleep: ['noiseColor', 'natureField'],
    focus: ['asmrStudy', 'noiseColor'],
    stress: ['natureField', 'slowTempo'],
    mood: ['vocalResonance', 'natureField'],
  },
  teen: {
    sleep: ['slowTempo', 'asmrStudy'],
    focus: ['asmrStudy', 'entrainment'],
    stress: ['entrainment', 'asmrStudy'],
    mood: ['vocalResonance', 'resonantBowls'],
  },
  youngAdult: {
    sleep: ['slowTempo', 'noiseColor'],
    focus: ['asmrStudy', 'entrainment'],
    stress: ['natureField', 'asmrStudy'],
    mood: ['resonantBowls', 'vocalResonance'],
  },
  adult: {
    sleep: ['slowTempo', 'natureField'],
    focus: ['entrainment', 'slowTempo'],
    stress: ['resonantBowls', 'natureField'],
    mood: ['vocalResonance', 'resonantBowls'],
  },
}

/** Why this prescription, in one warm reader-facing line per persona. */
export const PRESCRIPTION_NOTE: Record<AgeGroup, Record<TherapyGoal, string>> = {
  child: {
    sleep: 'Steady rain works like natural pink noise — it masks household sounds so young sleepers stay asleep.',
    focus: 'Whisper-soft study beds keep homework calm — steady, wordless, and never louder than the thinking.',
    stress: 'Water and birdsong help small nervous systems recover from big feelings, fast.',
    mood: 'Gentle voices are the most familiar calming sound a child knows.',
  },
  teen: {
    sleep: 'A slow steady pulse tells a busy brain the day is over.',
    focus: 'ASMR-soft beds and steady rhythm are the study stack — lyric-free, low, and proven to hold attention.',
    stress: 'Slow rhythmic sound takes the edge off exam-season anxiety, measurably.',
    mood: 'Resonant voices settle mood swings without asking anything of you.',
  },
  youngAdult: {
    sleep: 'Sound at resting heart-rate tempo entrains the body toward rest.',
    focus: 'Whisper-soft ASMR beds slow the heart while wordless texture holds deep work in place.',
    stress: 'Nature restores attention with zero effort — the antidote to a fast-paced day.',
    mood: 'A sound bath measurably lowers tension and lifts mood in one sitting.',
  },
  adult: {
    sleep: 'Low-arousal, slow-tempo sound raises vagal tone — the physiology of winding down.',
    focus: 'Slow rhythm steadies attention without stimulation.',
    stress: 'Long resonant decays release tension the way a massage releases muscle.',
    mood: 'Chant quiets the limbic system — calm you can feel in the chest.',
  },
}
