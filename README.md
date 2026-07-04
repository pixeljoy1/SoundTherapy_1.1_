# Attune — SoundTherapy 1.1

> *Sound therapy for focus, calm, and deep rest. Tuned for every age.*

An evolution of the Drift meditation prototype into a **sound therapy app**: the same
gradient + layered-audio engine, recontextualized around the wellness impact of sound —
with an onboarding that customizes the experience by **age group** (children · teenagers ·
young adults) and **goal** (sleep · focus · stress · mood). Web-first and **Android-ready**
(see [ANDROID_PORTING.md](./ANDROID_PORTING.md)); original spec in [SPEC.md](./SPEC.md).

The spec targets native Android (Kotlin / Jetpack Compose / AGSL). This prototype
implements the *full UX, the signature gradient engine, and a layered audio system*
on the web so the experience can be felt today — with code structured to port 1:1.

**Live:** _published via GitHub Pages — see the repo's Pages URL._

---

## What's implemented

| Spec area | Status |
|---|---|
| §4 Visual design language (tokens, type scale, spacing, shape) | ✅ `src/theme/` |
| §5 Gradient animation system — real-time multi-point noise shader | ✅ WebGL `src/gradient/` |
| §5.3 Sleep dimming curve (drift + brightness over time) | ✅ `DimmingScheduler.ts` |
| §5.4 Palette crossfade (4s GPU lerp) | ✅ `GradientController.ts` |
| §6 Audio system — 3 layers (foundation / breath / ambient), synth mock | ✅ `src/audio/` |
| §6.2 Exponential fade-to-silence + sleep timer | ✅ `SleepFader.ts` / `useSession.ts` |
| §6.3 20-session catalog (+ 4 Focus "coming soon") | ✅ `src/session/catalog.ts` |
| §7 Interaction model (tap-to-summon, long-press preview, haptics) | ✅ |
| §8 Screens — Home, Pre-Play, Active Session, Breathwork, portrait adapt | ✅ `src/screens/` |
| §8.5 Breathwork ring (Box / 4-7-8 / Coherent / Exhale-extended) | ✅ `BreathRing.tsx` / `BreathController.ts` |
| §9 Settings (3 sections, bottom sheet) | ✅ `Settings.tsx` |
| §10 Onboarding — 5 steps, customization-first (age group, goal, look, timer) | ✅ `Onboarding.tsx` |
| §11 States & edge cases (pause, battery banner, status notes) | ◐ partial |
| §12 Animation tokens & reduced-motion | ✅ |
| §14 Monetization — free tier (3 sessions, 30-min cap) + paywall sheet | ✅ `Paywall.tsx` |

**Mock audio:** sessions are rendered live from oscillators (no licensed stems — spec §18 Q2).
Swap `Session.sound` for stream URLs when real audio lands.

---

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production bundle → dist/
npm run preview    # serve the built bundle on :4190
```

> Tip: open browser dev-tools and toggle **device toolbar → landscape** for the
> intended bed-held experience. Audio starts after the first tap (browser policy).

---

## Architecture (web → Android map)

```
src/
├── theme/        Color/Type/Spacing tokens + 3 palettes   → Theme.kt / Color.kt
├── gradient/     WebGL shader engine                       → AGSL RenderEffect
│   ├── shader.ts            multi-point noise field        → ShaderProgram.agsl
│   ├── GradientController.ts params + palette crossfade
│   ├── DimmingScheduler.ts  §5.3 luminosity curve
│   └── GradientCanvas.tsx   rAF render loop
├── audio/        Web Audio synth (3 layers)                → ExoPlayer + LayerMixer
│   ├── AudioEngine.ts
│   └── SleepFader.ts        exponential fade
├── session/      Catalog + breath pattern engine           → SessionRepository / BreathController
├── state/        Store (localStorage) + useSession runtime → DataStore + SessionEngine
├── components/   Cards, pills, sheet, overlay, breath ring
└── screens/      Onboarding · Home · PrePlay · Session · Settings · Paywall
```

Full mapping in [ANDROID_PORTING.md](./ANDROID_PORTING.md).

---

## Prototype notes

- **Premium** can be toggled in Settings → Account to unlock the full catalog /
  unlimited timer without a billing flow.
- **Reduced motion** (OS setting) pauses the shader to a slow static field and
  removes screen-transition motion, per §12.3.
- **AGSL fallback** (§18 Q3) is mirrored here: if WebGL2 is unavailable the canvas
  paints a static CSS gradient.
