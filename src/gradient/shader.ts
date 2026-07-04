/**
 * Gradient shader — Drift spec §5.
 * GLSL ES fragment shader implementing the multi-point gradient noise field.
 * This is the WebGL twin of `ShaderProgram.agsl`; the uniform contract is kept
 * deliberately close to what an AGSL RuntimeShader would take so the port is 1:1.
 *
 * Field model (§5.1):
 *   - 6 color "sources" at pseudo-random positions
 *   - each drifts on an independent slow sinusoid (period 8–45s)
 *   - colors blend via inverse-distance weighting
 *   - a low-amplitude value-noise layer adds organic micro-movement
 *   - global luminosity breathes in sync with the audio breath rhythm
 */

export const VERT_SRC = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

export const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2  u_res;          // viewport px
uniform float u_time;         // seconds
uniform vec3  u_colors[6];    // color sources (rgb 0..1), cycled from palette stops
uniform float u_driftSpeed;   // §5.2 driftSpeed 0.1..3.0
uniform float u_saturation;   // §5.2 colorSaturation 0.3..1.0
uniform float u_noise;        // §5.2 noiseIntensity 0.0..0.4
uniform float u_breath;       // 0..1 breath envelope (luminosity), §5.1
uniform float u_dim;          // 0..1 dimming multiplier, §5.3
uniform float u_motion;       // 1 = full shader, 0 = reduced motion static field
uniform float u_psych;        // 0..1.5 psychedelic intensity (hue rotation + bloom)
uniform float u_pastel;       // 1 = pastel (light) theme, 0 = dark

// --- hue rotation (Rodrigues rotation about the grey axis) -----------------
vec3 hueShift(vec3 col, float a){
  const vec3 k = vec3(0.57735); // (1,1,1)/sqrt(3)
  float c = cos(a);
  return col * c + cross(k, col) * sin(a) + k * dot(k, col) * (1.0 - c);
}

// --- value noise -----------------------------------------------------------
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash(i);
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

// Fixed base anchors for the 6 sources (pseudo-random but stable).
const vec2 ANCHOR[6] = vec2[6](
  vec2(0.18, 0.28), vec2(0.78, 0.20), vec2(0.50, 0.62),
  vec2(0.22, 0.80), vec2(0.85, 0.72), vec2(0.62, 0.40)
);
// Independent drift periods (s) within the 8–45s band (§5.1).
const float PERIOD[6] = float[6](31.0, 19.0, 43.0, 11.0, 26.0, 8.0);

void main() {
  vec2 aspect = vec2(u_res.x / u_res.y, 1.0);
  vec2 uv = v_uv * aspect;

  float t = u_time * u_driftSpeed * u_motion;

  vec3 acc = vec3(0.0);
  float wsum = 0.0;
  for (int k = 0; k < 6; k++) {
    float ph = float(k) * 1.7;
    vec2 drift = vec2(
      sin(t * 6.2831853 / PERIOD[k] + ph),
      cos(t * 6.2831853 / (PERIOD[k] * 1.3) + ph * 0.7)
    ) * 0.18;
    vec2 pos = (ANCHOR[k] + drift) * aspect;
    float d = distance(uv, pos);
    // inverse-distance weighting (softened)
    float w = 1.0 / (d * d * 9.0 + 0.04);
    acc += u_colors[k] * w;
    wsum += w;
  }
  vec3 col = acc / max(wsum, 0.0001);

  // organic micro-movement (§5.1 ~0.02 scale Perlin-ish layer)
  float n = vnoise(uv * 3.0 + t * 0.05) - 0.5;
  col += n * u_noise;

  // saturation control around luma
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, u_saturation);

  // --- psychedelic transition (§ enhancement) ------------------------------
  // Bright, shifting color field: continuous hue rotation across space + time,
  // oversaturation, and a rainbow shimmer. Scales with u_psych so the calm
  // sleep state (psych = 0) is untouched.
  if (u_psych > 0.001) {
    float ang = u_time * 0.45 + (uv.x * 1.3 + uv.y * 0.9) * 3.14159;
    col = hueShift(col, ang * u_psych);
    col = mix(vec3(luma), col, 1.0 + 0.9 * u_psych); // oversaturate
    col += u_psych * 0.16 * vec3(sin(ang), sin(ang + 2.094), sin(ang + 4.188));
    col *= 1.0 + 0.30 * u_psych; // bloom / brighten
  }

  // pastel (light) theme: keep each palette's hue but as a soft, light tint
  if (u_pastel > 0.5) {
    vec3 base = min(vec3(1.0), col * 1.8);   // lift the dark palette so hue reads
    col = mix(base, vec3(1.0), 0.5);         // tint toward white → pastel shade
  }

  // breath luminosity + sleep dimming
  float lum = mix(0.86, 1.06, u_breath); // gentle ±, §5.1
  col *= lum * u_dim;

  // subtle vignette for depth (color-opacity depth, §4.4 — no shadows).
  // Much gentler in pastel so the light theme doesn't dim at the edges.
  vec2 vc = v_uv - 0.5;
  float vig = 1.0 - dot(vc, vc) * (u_pastel > 0.5 ? 0.15 : 0.55);
  col *= vig;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`
