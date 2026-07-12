import type { World } from '../sim/types'

interface Props {
  running: boolean
  onToggle: () => void
  onStep: () => void
  onReset: () => void
  yearsPerSecond: number
  onSpeed: (v: number) => void
  population: number
  stats: World['stats']
}

export function Controls({
  running,
  onToggle,
  onStep,
  onReset,
  yearsPerSecond,
  onSpeed,
  population,
  stats,
}: Props): JSX.Element {
  return (
    <section className="sim-controls">
      <span className="label-eyebrow">Controls</span>
      <div className="ctrl-row">
        <button className="btn primary" onClick={onToggle}>
          {running ? 'Pause' : 'Run'}
        </button>
        <button className="btn ghost" onClick={onStep} disabled={running}>
          Step
        </button>
        <button className="btn ghost" onClick={onReset}>
          New seed
        </button>
      </div>

      <div className="slider">
        <div className="slider-track">
          <span className="label-eyebrow">Age passes</span>
          <input
            type="range"
            min={0.05}
            max={3}
            step={0.05}
            value={yearsPerSecond}
            onChange={(e) => onSpeed(parseFloat(e.target.value))}
          />
        </div>
        <div className="slider-value">{yearsPerSecond.toFixed(2)} yr/s</div>
      </div>

      <div className="stats">
        <Stat label="Souls" value={population} />
        <Stat label="Buildings" value={stats.buildingsRaised} />
        <Stat label="Marriages" value={stats.marriages} />
        <Stat label="Births" value={stats.births} />
        <Stat label="Deaths" value={stats.deaths} />
        <Stat label="Crimes" value={stats.crimes} />
        <Stat label="Arrests" value={stats.arrests} />
        <Stat label="Saints" value={stats.saints} />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
