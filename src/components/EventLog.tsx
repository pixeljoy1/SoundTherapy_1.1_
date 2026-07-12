import type { World, WorldEvent } from '../sim/types'

const KIND_LABEL: Record<WorldEvent['kind'], string> = {
  birth: '👶',
  death: '⚰',
  marriage: '❤',
  crime: '⚠',
  arrest: '⛓',
  trial: '⚖',
  execution: '☠',
  saint: '☸',
  note: '·',
}

export function EventLog({ world }: { world: World }): JSX.Element {
  const events = world.events.slice(-40).reverse()
  return (
    <div className="panel">
      <h3>Chronicle</h3>
      {events.length === 0 ? (
        <p className="muted small">The commune settles into its first hours.</p>
      ) : (
        <ul className="log">
          {events.map((e, i) => (
            <li key={i} className={`log-item log-${e.kind}`}>
              <span className="log-kind">{KIND_LABEL[e.kind]}</span>
              <span className="log-time mono">{e.clock}</span>
              <span className="log-text">{e.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
