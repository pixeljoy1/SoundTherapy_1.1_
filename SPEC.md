# Drift — Product Specification
### *A sleep meditation app for Android*
**Version 1.0 · June 2026**

> This is the source product specification implemented (as a web prototype) by this
> repository. See [README.md](./README.md) for what's built and
> [ANDROID_PORTING.md](./ANDROID_PORTING.md) for the native-Android mapping.

---

## 1. Vision & North Star

Drift exists for one moment: the moment you put your phone down, close your eyes, and let go. Everything in the product is optimized for that single outcome.

The experience model is **zero friction to sleep**. Like calling an Uber — tap once, confirm, it happens. No onboarding mazes, no habit-tracking, no gamification. The app's job is to be used, then forgotten.

**Core thesis:** Most meditation apps are built for daytime engagement loops. Drift is built for night. Every design decision — color, animation, sound, interaction weight — is governed by whether it helps the user fall asleep faster.

---

## 2. Unique Differentiators

| Differentiator | Description |
|---|---|
| **Gradient Atmosphere** | Real-time animated gradient backgrounds that breathe and shift — not static images, not videos, but generative GPU-driven color fields synced to audio |
| **Sonic Architecture** | Curated music system with layered audio (foundation tone + breath texture + ambient drift) that fades to silence at a user-set time |
| **Butter-smooth motion** | 120fps-capable animations on supported hardware; all transitions use spring physics, never linear easing |
| **Sleep-first UX** | One-handed landscape use as primary mode; portrait supported. Screen dims progressively. Interaction surface shrinks as session deepens |
| **Curation over catalog** | ~20 hand-selected sessions rather than 500 mediocre ones. Quality over quantity, always |

---

## 3. Platform & Technical Baseline

| Property | Spec |
|---|---|
| **Primary Platform** | Android 12+ (API 31+) |
| **Primary Orientation** | Landscape (horizontal phone hold, typically in bed) |
| **Secondary Orientation** | Portrait (supported, gracefully adapted) |
| **Target Devices** | Mid-to-high tier Android phones (Pixel 6+, Samsung S21+, OnePlus 9+) |
| **Rendering** | Jetpack Compose with Canvas/AGSL shader support |
| **Audio Engine** | ExoPlayer with custom crossfade mixer |
| **Frame Target** | 60fps floor, 120fps ceiling on ProMotion displays |
| **Dark Mode** | Always dark. No light mode — by design |
| **Connectivity** | Sessions cached locally after first play. No internet required during session |
| **Accessibility** | WCAG AA contrast on all interactive elements. `reduceMotion` respected: gradients pause, crossfades remain |

---

## 4. Visual Design Language

### 4.2 Color System

| Palette Name | Purpose | Color Range |
|---|---|---|
| **Dusk** | Sleep sessions | Indigo `#1A0B3B` → Violet `#3D1A6E` → Rose `#7A2E5B` |
| **Deep Water** | Body scan / anxiety | Navy `#060D2B` → Teal `#0D3B5E` → Slate `#1B4A6B` |
| **Ember** | Breathwork | Charcoal `#1A0A05` → Amber `#5C2B0A` → Burnt Sienna `#8B3A1A` |

Fixed UI tokens, typography, spacing, shape, and iconography per the full design
language are implemented in `src/theme/tokens.ts`.

---

## 5. The Gradient Animation System

Real-time AGSL shader (web prototype: WebGL) implementing a multi-point gradient
noise field: 5–7 drifting color sources, inverse-distance weighting, low-amplitude
Perlin micro-movement, breath-synced luminosity. Progressive sleep dimming curve
(§5.3) and 4-second palette crossfades (§5.4). See `src/gradient/`.

---

## 6. Audio System

Three independent layers — Foundation (continuous drone), Breath (4–7s texture),
Ambient Drift (sparse) — mixed by the audio designer; user controls overall volume
only. Exponential fade-to-silence sleep timer (10/20/30/45/60 min + "Until I stop
it"). 20-session MVP catalog grouped Sleep / Body Scan / Breathwork / Focus. See
`src/audio/` and `src/session/catalog.ts`.

---

## 7–17

The remaining sections (Interaction model, Screens, Settings, Onboarding, Edge
cases, Animation tokens, Performance, Monetization, Architecture, Metrics, Out of
scope) are implemented per the original specification. Coverage is tracked in the
README implementation table.

---

## 18. Open Questions

1. Name licensing — confirm "Drift" trademark availability.
2. Audio rights — all session audio must be original or fully licensed (prototype uses synth).
3. AGSL compatibility floor — define graceful fallback shader (prototype: static CSS gradient).
4. Font licensing — DM Serif Display and Inter (open license).
5. Sleep timer legality — disclosures for EU/AU.

---

*Specification maintained by Product. Last updated: June 28, 2026.*
