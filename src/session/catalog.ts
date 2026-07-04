/**
 * Session catalog — each session plays a real, curated MP3 (public/audio),
 * distributed so tracks rarely repeat. Mood-matched gradients per session.
 * All Sleep + Chanting themes are free.
 */

import { BreathPattern, Session } from './types'

/** Resolve an audio file to a URL. VITE_AUDIO_BASE lets the slim APK stream the
 *  audio from the web instead of bundling it; otherwise it's served locally. */
const AUDIO_BASE = import.meta.env.VITE_AUDIO_BASE || import.meta.env.BASE_URL
const A = (file: string) => `${AUDIO_BASE}audio/${file}`

const BOX: BreathPattern = {
  name: '4-4-4-4',
  phases: [
    { label: 'Inhale', seconds: 4 },
    { label: 'Hold', seconds: 4 },
    { label: 'Exhale', seconds: 4 },
    { label: 'Rest', seconds: 4 },
  ],
}

export const CATALOG: Session[] = [
  // ── Sleep (8) ────────────────────────────────────────────────
  {
    id: 'drift', title: 'Deep Drift', group: 'sleep', durationMin: 48, palette: 'dusk', free: true,
    track: A('sleep1_.mp3'),
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.3, cutoff: 600, ambient: 'none' },
  },
  {
    id: 'coastal-night', title: 'Coastal Night', group: 'sleep', durationMin: 32, palette: 'coastal', free: true,
    track: A('ocean1.mp3'),
    sound: { root: 98, breathCycle: 6, ambientDensity: 0.9, cutoff: 700, ambient: 'waves' },
  },
  {
    id: 'rainfall-system', title: 'Rainfall System', group: 'sleep', durationMin: 40, palette: 'rainfall', free: true,
    track: A('rain1_.mp3'),
    sound: { root: 90, breathCycle: 5, ambientDensity: 0.95, cutoff: 1200, ambient: 'rain' },
  },
  {
    id: 'northern-lights', title: 'Northern Lights', group: 'sleep', durationMin: 35, palette: 'aurora', free: true,
    track: A('flute_zen.mp3'),
    sound: { root: 130, breathCycle: 6.5, ambientDensity: 0.55, cutoff: 900, ambient: 'shimmer' },
  },
  {
    id: 'forest-breathe', title: 'Forest Breathe', group: 'sleep', durationMin: 38, palette: 'forest', free: true,
    track: A('forest.mp3'),
    sound: { root: 100, breathCycle: 6, ambientDensity: 0.7, cutoff: 800, ambient: 'forest' },
  },
  {
    id: 'deep-tide', title: 'Deep Tide', group: 'sleep', durationMin: 45, palette: 'tide', free: true,
    track: A('rest_.mp3'),
    sound: { root: 70, breathCycle: 7, ambientDensity: 0.7, cutoff: 420, ambient: 'waves' },
  },
  {
    id: 'starfield', title: 'Starfield', group: 'sleep', durationMin: 50, palette: 'starfield', free: true, stars: true,
    track: A('zen1.mp3'),
    sound: { root: 120, breathCycle: 7, ambientDensity: 0.2, cutoff: 1100, ambient: 'shimmer' },
  },
  {
    id: 'mountain-pass', title: 'Mountain Pass', group: 'sleep', durationMin: 36, palette: 'mountain', free: true,
    track: A('nature_.mp3'),
    sound: { root: 105, breathCycle: 6, ambientDensity: 0.6, cutoff: 750, ambient: 'wind' },
  },

  // ── Body Scan (4) ────────────────────────────────────────────
  {
    id: 'slow-descent', title: 'Slow Descent', group: 'bodyScan', durationMin: 20, palette: 'deepWater', free: false,
    track: A('meditation1_.mp3'),
    sound: { root: 96, breathCycle: 6, ambientDensity: 0.1, cutoff: 650, ambient: 'none' },
  },
  {
    id: 'weight-and-warmth', title: 'Weight & Warmth', group: 'bodyScan', durationMin: 22, palette: 'ember', free: false,
    track: A('relax1.mp3'),
    sound: { root: 92, breathCycle: 6.5, ambientDensity: 0.15, cutoff: 700, ambient: 'none' },
  },
  {
    id: 'pressure-release', title: 'Pressure Release', group: 'bodyScan', durationMin: 25, palette: 'deepWater', free: false,
    track: A('meditation2_.mp3'),
    sound: { root: 85, breathCycle: 6, ambientDensity: 0.1, cutoff: 600, ambient: 'none' },
  },
  {
    id: 'stillness', title: 'Stillness', group: 'bodyScan', durationMin: 30, palette: 'dusk', free: false,
    track: A('forest3.mp3'),
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.12, cutoff: 900, ambient: 'shimmer' },
  },

  // ── Breathwork (4) ───────────────────────────────────────────
  {
    id: 'box-breath', title: 'Box Breath', group: 'breathwork', durationMin: 10, palette: 'ember', free: true,
    track: A('om1.mp3'),
    sound: { root: 120, breathCycle: 4, ambientDensity: 0.05, cutoff: 1000, ambient: 'none' },
    breath: { ...BOX },
  },
  {
    id: '4-7-8-sleep', title: '4-7-8 Sleep', group: 'breathwork', durationMin: 12, palette: 'dusk', free: false,
    track: A('om_2vocal.mp3'),
    sound: { root: 110, breathCycle: 7, ambientDensity: 0.05, cutoff: 800, ambient: 'none' },
    breath: {
      name: '4-7-8',
      phases: [
        { label: 'Inhale', seconds: 4 },
        { label: 'Hold', seconds: 7 },
        { label: 'Exhale', seconds: 8 },
      ],
    },
  },
  {
    id: 'coherent-breath', title: 'Coherent Breath', group: 'breathwork', durationMin: 12, palette: 'deepWater', free: false,
    track: A('om3_female.mp3'),
    sound: { root: 100, breathCycle: 5.5, ambientDensity: 0.05, cutoff: 900, ambient: 'none' },
    breath: {
      name: '5.5 · 5.5',
      phases: [
        { label: 'Inhale', seconds: 5.5 },
        { label: 'Exhale', seconds: 5.5 },
      ],
    },
  },
  {
    id: 'exhale-extended', title: 'Exhale Extended', group: 'breathwork', durationMin: 10, palette: 'ember', free: false,
    track: A('om1.mp3'),
    sound: { root: 105, breathCycle: 6, ambientDensity: 0.05, cutoff: 850, ambient: 'none' },
    breath: {
      name: '4 · 8',
      phases: [
        { label: 'Inhale', seconds: 4 },
        { label: 'Exhale', seconds: 8 },
      ],
    },
  },

  // ── Chanting (3) — real vocal chants ─────────────────────────
  {
    id: 'buddhist-chant', title: 'Buddhist Chant', group: 'chanting', durationMin: 30, palette: 'temple', free: true,
    track: A('om1.mp3'),
    sound: { root: 82, breathCycle: 7, ambientDensity: 0.9, cutoff: 620, ambient: 'chant' },
    subtitles: [
      'Oṃ maṇi padme hūṃ',
      'All conditioned things are impermanent.\n— Dhammapada 277',
      'Hatred is never appeased by hatred;\nby love alone is it healed.\n— Dhammapada 5',
      'What we think, we become.\n— Dhammapada 1',
      'Gate gate pāragate pārasaṃgate bodhi svāhā.\n— Heart Sūtra',
      'Peace comes from within.\nDo not seek it without.',
      'Let go, and be still.',
      'This too shall pass.',
    ],
  },
  {
    id: 'hindu-chant', title: 'Hindu Chant', group: 'chanting', durationMin: 30, palette: 'saffron', free: true,
    track: A('om_2vocal.mp3'),
    sound: { root: 110, breathCycle: 6, ambientDensity: 0.9, cutoff: 760, ambient: 'chant' },
    subtitles: [
      'Oṃ',
      'Asato mā sad gamaya —\nLead me from the unreal to the real.\n— Bṛhadāraṇyaka Upaniṣad 1.3.28',
      'Tamaso mā jyotir gamaya —\nLead me from darkness to light.',
      'Mṛtyor mā amṛtaṃ gamaya —\nLead me from death to immortality.',
      'Tat tvam asi —\nThou art That.\n— Chāndogya Upaniṣad 6.8.7',
      'Ahaṃ brahmāsmi —\nI am Brahman.\n— Bṛhadāraṇyaka Upaniṣad 1.4.10',
      'Sarvaṃ khalvidaṃ brahma —\nAll this is Brahman.\n— Chāndogya Upaniṣad 3.14.1',
      'Oṃ śāntiḥ śāntiḥ śāntiḥ —\nPeace, peace, peace.',
    ],
  },
  {
    id: 'sacred-om', title: 'Sacred Om', group: 'chanting', durationMin: 30, palette: 'aurora', free: true,
    track: A('om3_female.mp3'),
    sound: { root: 130, breathCycle: 6.5, ambientDensity: 0.9, cutoff: 900, ambient: 'chant' },
    subtitles: [
      'Oṃ',
      'Oṃ — the sound of the universe.',
      "So'ham —\nI am That.",
      'Oṃ pūrṇam adaḥ pūrṇam idam —\nThat is whole, this is whole.\n— Īśa Upaniṣad',
      'Oṃ śāntiḥ śāntiḥ śāntiḥ —\nPeace, peace, peace.',
    ],
  },
]

export const byId = (id: string) => CATALOG.find((s) => s.id === id)
export const FREE_IDS = CATALOG.filter((s) => s.free).map((s) => s.id)
