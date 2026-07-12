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
    <div className="sim-controls">
      <div className="ctrl-row">
        <button
          className={`btn primary ${running ? 'is-on' : ''}`}
          onClick={onToggle}
        >
          {running ? '⏸ Pause' : '▶ Run'}
        </button>
        <button className="btn" onClick={onStep} disabled={running}>
          ⏭ Step
        </button>
        <button className="btn danger" onClick={onReset}>
          ⟲ New Seed
        </button>
      </div>

      <label className="ctrl-slider">
        <span>Age speed</span>
        <input
          type="range"
          min={0.05}
          max={3}
          step={0.05}
          value={yearsPerSecond}
          onChange={(e) => onSpeed(parseFloat(e.target.value))}
        />
        <span className="mono">{yearsPerSecond.toFixed(2)} yr/s</span>
      </label>

      <div className="ctrl-stats">
        <Stat label="Souls" value={population} />
        <Stat label="Births" value={stats.births} />
        <Stat label="Deaths" value={stats.deaths} />
        <Stat label="Marriages" value={stats.marriages} />
        <Stat label="Crimes" value={stats.crimes} />
        <Stat label="Arrests" value={stats.arrests} />
        <Stat label="Executions" value={stats.executions} />
        <Stat label="Saints" value={stats.saints} />
      </div>
    </div>
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
