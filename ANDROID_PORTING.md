# Android Porting Guide

This web prototype was written to map cleanly onto the native Android target
described in the Drift spec (§3, §15). Each web module has a direct Kotlin/Compose
counterpart. The goal: a port is a *translation*, not a redesign.

## Module → Android mapping

| Web module | File(s) | Android target |
|---|---|---|
| Design tokens | `src/theme/tokens.ts` | `ui/theme/Color.kt`, `Type.kt`, `Shape.kt`, `Spacing.kt` |
| Palettes (mood engine) | `src/theme/palettes.ts` | `gradient/Palette.kt` (enum + Color stops) |
| Shader source | `src/gradient/shader.ts` (GLSL ES) | `gradient/shader.agsl` (AGSL) — near 1:1 uniform contract |
| Shader host | `src/gradient/GradientCanvas.tsx` | `RenderEffect.createRuntimeShaderEffect` on a `Modifier.graphicsLayer` |
| Gradient params + crossfade | `GradientController.ts` | `GradientController.kt` (StateFlow params) |
| Dimming curve | `DimmingScheduler.ts` | `DimmingScheduler.kt` (pure, time→state) |
| Audio engine | `audio/AudioEngine.ts` (Web Audio) | `ExoPlayer` + custom `LayerMixer` |
| Sleep fade | `audio/SleepFader.ts` (exp ramp) | `ValueAnimator` w/ exponential interpolator on `player.volume` |
| Catalog | `session/catalog.ts` | Room `@Entity Session` + seed; remote sync via Retrofit/S3 |
| Breath engine | `session/BreathController.ts` | `BreathController.kt` (pure, time→BreathState) |
| Store / prefs | `state/store.tsx` (localStorage) | `DataStore<Preferences>` |
| Session runtime | `state/useSession.ts` | `SessionEngine` + `SessionForegroundService` |
| Navigation | `App.tsx` conditional screens | `androidx.navigation.compose` NavHost |
| Screens | `src/screens/*` | `@Composable` screens 1:1 |

## Key translation notes

### Shader (the soul, §5)
`shader.ts` is GLSL ES 3.00; AGSL is a near-superset of GLSL for fragment logic.
The uniform set (`u_time`, `u_colors[6]`, `u_driftSpeed`, `u_saturation`,
`u_noise`, `u_breath`, `u_dim`, `u_motion`) is intentionally flat so it maps
directly to `RuntimeShader.setFloatUniform(...)`. The value-noise + inverse-distance
weighting port verbatim. Replace the fullscreen-quad plumbing with a Compose
`drawWithCache { onDrawBehind { ... } }` + `RenderEffect`.

**Fallback (§18 Q3):** on devices without functional `RenderEffect`, render the
animated CSS-style gradient equivalent — here it's the `canvas.style.background`
branch; on Android, an `AnimatedBrush` `Box`.

### Audio (§6)
The prototype synthesizes audio from oscillators because V1 has no licensed stems
(§18 Q2). On Android, keep the 3-layer model but back each layer with an ExoPlayer
`MediaSource` (foundation loops continuously; breath/ambient are scheduled stems).
`SleepFader`'s exponential curve is the contract to preserve — human hearing is
logarithmic (§6.2).

### Session runtime (§15)
`useSession` is the web `SessionEngine`. The dimming + breath sampler
(`sample()`) is pulled by the render loop every frame — on Android this is the
`GradientController` reading `DimmingScheduler` + the audio breath envelope inside
the Compose frame callback. Audio must continue when backgrounded via a
`SessionForegroundService` with a `MediaSession` for lock-screen controls (§11).

### Orientation (§3, §8.4)
Web uses flex/grid that reflow; Compose uses `WindowSizeClass` +
`LocalConfiguration.orientation`. Landscape is primary; portrait stacks cards and
turns Pre-Play into a bottom sheet.

## Not ported (out of scope here)
- Room/Retrofit/S3 remote sync (catalog is static in the prototype)
- Real billing / Play Billing (Premium is a prototype toggle)
- Foreground service / MediaSession (web keeps audio in-tab)
- HealthConnect, WearOS, Assistant — all V1 out-of-scope (§17)
