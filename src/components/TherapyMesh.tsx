/**
 * TherapyMesh — an organic pair of hue blobs breathing behind a therapy chapter.
 * Each modality owns two hues (therapies.ts); the mesh makes the section feel
 * like its own room without a single image asset.
 */

export function TherapyMesh({ hues, opacity = 0.16 }: { hues: [string, string]; opacity?: number }) {
  const [a, b] = hues
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        className="mesh-blob"
        style={{
          width: '55%',
          paddingBottom: '55%',
          left: '-12%',
          top: '-18%',
          background: `radial-gradient(circle at 35% 35%, ${a}, transparent 70%)`,
          opacity,
        }}
      />
      <div
        className="mesh-blob"
        style={{
          width: '48%',
          paddingBottom: '48%',
          right: '-10%',
          bottom: '-22%',
          background: `radial-gradient(circle at 60% 40%, ${b}, transparent 70%)`,
          opacity: opacity * 0.85,
          animationDelay: '-8s',
        }}
      />
    </div>
  )
}
