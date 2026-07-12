import type { World, WorldEvent } from '../sim/types'

const KIND_GLYPH: Record<WorldEvent['kind'], string> = {
  birth: '◉',
  death: '◐',
  marriage: '❤',
  crime: '△',
  arrest: '◈',
  trial: '§',
  execution: '×',
  saint: '✦',
  note: '·',
}

export function EventLog({ world }: { world: World }): JSX.Element {
  const events = world.events.slice(-60).reverse()
  return (
    <article className="card">
      <h3 className="card-title">Chronicle</h3>
      {events.length === 0 ? (
        <p className="card-sub">The commune settles into its first hours.</p>
      ) : (
        <ul className="log">
          {events.map((e, i) => (
            <li key={i} className={`log-item log-${e.kind}`}>
              <span className="log-kind">{KIND_GLYPH[e.kind]}</span>
              <span className="log-time">{e.clock}</span>
              <span className="log-text">{e.text}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
