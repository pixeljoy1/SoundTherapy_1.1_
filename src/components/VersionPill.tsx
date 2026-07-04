/** Small build-version pill. Increments every build (v1.00, v1.01, …). */

import { APP_VERSION } from '../version'
import { radius } from '../theme/tokens'

export function VersionPill({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      title={`Attune build ${APP_VERSION}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        padding: '0 10px',
        borderRadius: radius.pill,
        background: 'var(--accent-soft)',
        border: '1px solid var(--accent-line)',
        color: 'var(--accent)',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.5,
        fontFamily: 'var(--sans)',
        userSelect: 'none',
        ...style,
      }}
    >
      {APP_VERSION}
    </span>
  )
}
