import type { PlannedBuilding } from '../sim/types'

export function PlansCard({ planned }: { planned: PlannedBuilding[] }): JSX.Element {
  return (
    <article className="card">
      <h3 className="card-title">Under construction</h3>
      {planned.length === 0 ? (
        <p className="card-sub">Ground is quiet. Builders are between projects.</p>
      ) : (
        <ul className="plan-list">
          {planned.map((pl) => (
            <li key={pl.id}>
              <div className="plan-row">
                <div className="plan-meta">
                  <div className="plan-type">{pl.type.replace('_', ' ')}</div>
                  <div className="plan-reason">{pl.reason}</div>
                </div>
                <div className="plan-progress">{Math.round(pl.progress * 100)}%</div>
              </div>
              <div className="plan-bar">
                <div className="plan-bar-fill" style={{ width: `${Math.max(2, pl.progress * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
