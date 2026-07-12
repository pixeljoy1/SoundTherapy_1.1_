// The headline for the simulator: current thriving score with a sparkline
// history and a one-word verdict. Positioned high in the layout so it
// answers "how is this commune doing?" at a glance.

import type { World } from '../sim/types'

interface Props {
  world: World
}

export function ThrivingMeter({ world }: Props): JSX.Element {
  const score = Math.round(world.thrivingScore)
  const verdict = verdictFor(world.thrivingScore)
  return (
    <section className="meter" aria-label="Commune vitality">
      <div className="meter-head">
        <div>
          <span className="meter-label">Commune vitality</span>
          <div className="meter-value">
            {score}
            <span style={{ fontSize: '0.5em', marginLeft: 4, color: 'var(--fg-muted)' }}>
              /100
            </span>
          </div>
        </div>
        <div className={`meter-verdict is-${verdict.tone}`}>{verdict.label}</div>
      </div>
      <div className="meter-track" aria-hidden="true">
        <div className="meter-fill" style={{ width: `${Math.max(2, score)}%` }} />
      </div>
      <Sparkline history={world.thrivingHistory} />
    </section>
  )
}

function verdictFor(score: number): { tone: 'thriving' | 'stable' | 'decaying'; label: string } {
  if (score >= 68) return { tone: 'thriving', label: 'Thriving' }
  if (score >= 40) return { tone: 'stable', label: 'Stable' }
  return { tone: 'decaying', label: 'Decaying' }
}

function Sparkline({ history }: { history: number[] }): JSX.Element {
  const w = 320
  const h = 44
  const pad = 2
  const values = history.length ? history : [50]
  const min = 0
  const max = 100
  const stepX = (w - pad * 2) / Math.max(1, values.length - 1)
  const scaleY = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2)
  const points = values.map((v, i) => [pad + i * stepX, scaleY(v)] as const)
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaPath = `${path} L${(pad + (values.length - 1) * stepX).toFixed(1)},${h - pad} L${pad},${h - pad} Z`
  const last = points[points.length - 1]!
  return (
    <svg
      className="meter-spark"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Vitality trend"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1={pad}
        x2={w - pad}
        y1={scaleY(50)}
        y2={scaleY(50)}
        stroke="var(--line-strong)"
        strokeDasharray="2 3"
      />
      <path d={areaPath} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill="var(--accent)" />
    </svg>
  )
}
