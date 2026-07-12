import type { Building, Person, World } from '../sim/types'
import { TRIBE_COLORS } from '../sim/tribes'

interface Props {
  person: Person | undefined
  building: Building | undefined
  world: World
}

const ROLE_LABEL: Record<string, string> = {
  child: 'Child',
  student: 'Student',
  farmer: 'Farmer',
  merchant: 'Merchant',
  weaver: 'Weaver',
  potter: 'Potter',
  blacksmith: 'Blacksmith',
  teacher: 'Teacher',
  doctor: 'Vaidya',
  priest: 'Pandit',
  musician: 'Musician',
  housewife: 'Homemaker',
  constable: 'Constable',
  judge: 'Judge',
  saint: 'Saint (Sadhu)',
  thief: 'Thief',
  dacoit: 'Dacoit',
  beggar: 'Mendicant',
  elder: 'Elder',
}

const ACTIVITY_LABEL: Record<string, string> = {
  idle: 'Standing still',
  walking: 'Walking',
  working: 'Working',
  eating: 'Eating',
  sleeping: 'Sleeping',
  praying: 'Praying',
  studying: 'Studying',
  teaching: 'Teaching',
  chatting: 'Chatting',
  courting: 'Courting',
  marrying: 'Marrying',
  nursing: 'Being cared for',
  mourning: 'Mourning',
  meditating: 'Meditating',
  plotting: 'Plotting',
  stealing: 'Stealing',
  arresting: 'Being arrested',
  jailed: 'Jailed',
  on_trial: 'On trial',
  executed: 'Executed',
  healing: 'Healing others',
  begging: 'Begging',
  playing: 'Playing',
}

export function PersonPanel({ person, building, world }: Props): JSX.Element {
  if (!person && !building) {
    return (
      <div className="panel">
        <h3>Select</h3>
        <p className="muted">
          Tap or click a dot to inspect a person — their role, mood, family and current
          activity. Tap a building to see who is inside.
        </p>
      </div>
    )
  }
  if (person) {
    const partner = person.spouseId
      ? world.people.find((p) => p.id === person.spouseId)
      : undefined
    const home = world.buildings.find((b) => b.id === person.homeId)
    const family = world.families.find((f) => f.id === person.familyId)
    const target = world.buildings.find((b) => b.id === person.targetBuildingId)
    const interlocutor = person.interactingWith
      ? world.people.find((p) => p.id === person.interactingWith)
      : undefined
    return (
      <div className="panel">
        <div className="panel-title">
          <span className="tribe-dot" style={{ background: TRIBE_COLORS[person.tribe] }} />
          <div>
            <div className="p-name">{person.name}</div>
            <div className="muted small">
              {person.tribe} · {ROLE_LABEL[person.role] ?? person.role} ·{' '}
              {Math.floor(person.age)}y
            </div>
          </div>
        </div>
        <dl className="p-facts">
          <Fact k="Activity" v={ACTIVITY_LABEL[person.activity] ?? person.activity} />
          <Fact k="Emotion" v={cap(person.emotion)} />
          <Fact k="Home" v={home?.name ?? '—'} />
          <Fact k="Family" v={family ? `${family.surname} household` : '—'} />
          <Fact k="Spouse" v={partner ? partner.name : '—'} />
          <Fact k="Children" v={person.childrenIds.length.toString()} />
          <Fact k="Going to" v={target ? `${target.name}` : '—'} />
          <Fact k="Chatting with" v={interlocutor ? interlocutor.name : '—'} />
          <Fact k="Wealth" v={`₹${Math.round(person.wealth)}`} />
          <Fact k="Faith" v={bar(person.faith)} />
          <Fact k="Morality" v={bar(person.morality)} />
          <Fact k="Hunger" v={bar(person.hunger)} />
          <Fact k="Fatigue" v={bar(person.fatigue)} />
        </dl>
        {(person.isCriminal || person.isSaint || person.sentencedToDeath) && (
          <div className="p-tags">
            {person.isSaint && <span className="tag saint">Saint</span>}
            {person.wanted && <span className="tag wanted">Wanted</span>}
            {person.isCriminal && <span className="tag criminal">Criminal ({person.crimesCommitted})</span>}
            {person.activity === 'jailed' && <span className="tag jailed">Jailed</span>}
            {person.sentencedToDeath && <span className="tag death">Sentenced to death</span>}
          </div>
        )}
        {!person.alive && (
          <div className="p-tags">
            <span className="tag death">Deceased — {person.causeOfDeath ?? 'unknown'}</span>
          </div>
        )}
      </div>
    )
  }
  if (building) {
    const inside = world.people.filter(
      (p) =>
        p.alive &&
        p.targetBuildingId === building.id &&
        Math.abs(p.x / world.cellSize - building.cx) < 1.5 &&
        Math.abs(p.y / world.cellSize - building.cy) < 1.5,
    )
    return (
      <div className="panel">
        <div className="panel-title">
          <div>
            <div className="p-name">{building.name}</div>
            <div className="muted small">{prettyType(building.type)}</div>
          </div>
        </div>
        <dl className="p-facts">
          <Fact k="Purpose" v={buildingPurpose(building.type)} />
          <Fact k="Occupants" v={inside.length.toString()} />
        </dl>
        {inside.length > 0 && (
          <ul className="p-list">
            {inside.slice(0, 20).map((p) => (
              <li key={p.id}>
                <span className="tribe-dot" style={{ background: TRIBE_COLORS[p.tribe] }} />
                {p.name} — {ROLE_LABEL[p.role] ?? p.role}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
  return <div className="panel" />
}

function Fact({ k, v }: { k: string; v: string }): JSX.Element {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  )
}

function bar(v: number): string {
  const clamped = Math.max(0, Math.min(1, v))
  const filled = Math.round(clamped * 8)
  return `${'▮'.repeat(filled)}${'▯'.repeat(8 - filled)}`
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function prettyType(t: string): string {
  return t.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildingPurpose(t: string): string {
  switch (t) {
    case 'temple':
      return 'Worship and community rituals'
    case 'ashram':
      return 'Home to saints and seekers'
    case 'market':
      return 'Trade of goods; merchants gather here'
    case 'school':
      return 'Children study under teachers'
    case 'farm':
      return 'Farmers cultivate crops'
    case 'workshop':
      return 'Weavers, potters, and blacksmiths work'
    case 'clinic':
      return 'Doctors treat the ill'
    case 'panchayat':
      return 'Village assembly and civic decisions'
    case 'court':
      return 'Trials and sentencing'
    case 'jail':
      return 'Offenders serve their term here'
    case 'gallows':
      return 'Site of capital punishment'
    case 'well':
      return 'Water source; women and elders converge'
    case 'chai_stall':
      return 'Tea and gossip'
    case 'home':
      return 'A family household'
    default:
      return ''
  }
}
