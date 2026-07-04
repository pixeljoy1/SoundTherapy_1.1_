/**
 * Banner — transient 4s notice (§11): low battery, headphones, call, etc.
 * Single line, no action required, auto-dismisses.
 */

export function Banner({ text }: { text: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 18px',
        borderRadius: 100,
        background: 'rgba(15,15,30,0.86)',
        backdropFilter: 'blur(12px)',
        color: 'var(--text-primary)',
        fontSize: 13,
        letterSpacing: 0.3,
        zIndex: 60,
        animation: 'banner-in 340ms cubic-bezier(0.34,1.2,0.4,1)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      <style>{`@keyframes banner-in { from { opacity: 0; transform: translate(-50%, -8px) } to { opacity: 1; transform: translate(-50%, 0) } }`}</style>
    </div>
  )
}
