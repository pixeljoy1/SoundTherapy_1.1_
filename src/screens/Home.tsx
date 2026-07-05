/**
 * Home — Attune's therapy journal (Sansara-grade editorial).
 * One long, calm read: hero with the living resonance field → a prescription
 * written for the active listener (research-mapped in therapy/therapies.ts) →
 * six numbered therapy chapters, each a room of its own with breathing hue
 * meshes, the science, who it serves, and its sessions. The player, previews,
 * paywall and pull-to-refresh mechanics are untouched underneath.
 */

import { useMemo, useState } from 'react'
import { CATALOG, byId } from '../session/catalog'
import { Session } from '../session/types'
import { SessionCard } from '../components/SessionCard'
import { VersionPill } from '../components/VersionPill'
import { PullToRefresh } from '../components/PullToRefresh'
import { AddThemeCard } from '../components/AddThemeCard'
import { RequestCard } from '../components/RequestCard'
import { RequestThemeSheet } from '../components/RequestThemeSheet'
import { AboutSheet, AboutFocus } from '../components/AboutSheet'
import { MakersPage } from '../components/MakersPage'
import { ResonanceField } from '../components/ResonanceField'
import { TherapyMesh } from '../components/TherapyMesh'
import wizardLogo from '../assets/wizard-footer-logo.png'
import { Pill } from '../components/Pill'
import { Sheet } from '../components/Sheet'
import { useStore } from '../state/store'
import { greeting, nextInvitation } from '../state/util'
import { emailThemeRequest, makeId } from '../state/themeRequest'
import { profileHues, AGE_ACCENT } from '../theme/profileTheme'
import { ART, PRESCRIPTION, PRESCRIPTION_NOTE, THERAPIES, THERAPY_ORDER, Therapy } from '../therapy/therapies'
import { TherapyInfoSheet } from '../components/TherapyInfoSheet'
import {
  AGE_BENEFIT,
  AGE_LABEL,
  AgeGroup,
  GOAL_LABEL,
  TherapyGoal,
  ThemeRequest,
} from '../state/types'

const AGES: AgeGroup[] = ['child', 'teen', 'youngAdult', 'adult']
const GOALS: TherapyGoal[] = ['sleep', 'focus', 'stress', 'mood']

export function Home({
  onSelect,
  onPreview,
  onLocked,
  onAutoStart,
}: {
  onSelect: (s: Session) => void
  onPreview: (s: Session) => void
  onLocked: (s: Session) => void
  onAutoStart: () => void
}) {
  const { persisted, openSettings, addRequest, removeRequest, patchSettings, logout } = useStore()
  const name = persisted.settings.name
  const age = persisted.settings.ageGroup
  const goal = persisted.settings.goal
  const [requestOpen, setRequestOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [aboutFocus, setAboutFocus] = useState<AboutFocus>('about')
  const [makersOpen, setMakersOpen] = useState(false)
  const openAbout = (f: AboutFocus) => {
    setAboutFocus(f)
    setAboutOpen(true)
  }
  const [removeTarget, setRemoveTarget] = useState<ThemeRequest | null>(null)
  const [evidence, setEvidence] = useState<Therapy | null>(null)
  const invitation = useState(() => nextInvitation())[0]

  const submitRequest = async (data: { name: string; mood: string; note: string }) => {
    addRequest({ id: makeId(), createdAt: Date.now(), ...data })
    return emailThemeRequest({ ...data, from: name || 'anonymous' })
  }

  const featured = useMemo(
    () => byId(persisted.lastPlayedId ?? 'drift') ?? byId('drift')!,
    [persisted.lastPlayedId],
  )

  // the listener's prescription: primary + secondary therapy, and their sessions
  const rx = PRESCRIPTION[age][goal]
  const rxPrimary = THERAPIES[rx[0]]
  const rxSessions = useMemo(() => {
    const pool = [
      ...CATALOG.filter((s) => s.therapy === rx[0]),
      ...CATALOG.filter((s) => s.therapy === rx[1]),
    ]
    return pool.slice(0, 4)
  }, [rx])

  // chapters: every therapy modality with its sessions, personalized order —
  // the listener's prescribed therapies lead, the rest follow (numbers stay
  // with their chapter, like a book read in the order that serves you)
  const chapters = useMemo(() => {
    const order = [...rx, ...THERAPY_ORDER.filter((t) => !rx.includes(t))]
    return order
      .map((t) => ({
        therapy: THERAPIES[t],
        items: CATALOG.filter((s) => s.therapy === t),
      }))
      .filter((c) => c.items.length > 0)
  }, [rx])

  const student = age === 'child' || age === 'teen' || age === 'youngAdult'
  const studySession = byId(age === 'child' ? 'study-rain' : 'asmr-forest')!
  const initial = (name.trim() || AGE_LABEL[age]).charAt(0).toUpperCase()

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* fixed top bar: wordmark · version / listener / settings */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="serif" style={{ fontSize: 19, color: 'var(--text-primary)' }}>
            Attune
          </span>
          <span aria-hidden style={{ fontSize: 14, color: 'var(--accent)', letterSpacing: -1 }}>◦◉◦</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <VersionPill />
          <button
            aria-label="Switch listener or log out"
            title="Switch listener"
            onClick={logout}
            style={{ ...avatarBtn, background: AGE_ACCENT[age].accent }}
          >
            {initial}
          </button>
          <button aria-label="Settings" onClick={() => openSettings(true)} style={gear}>
            ⚙
          </button>
        </div>
      </div>

      <PullToRefresh style={scroll}>
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', position: 'relative' }}>
          {/* ── hero ── */}
          <ResonanceField hues={profileHues(age, goal)} height={340} />
          <div style={{ position: 'relative', padding: '34px 0 0' }}>
            <div className="label reveal d1" style={{ marginBottom: 12 }}>
              {greeting()}
              {name ? `, ${name}` : ''}
            </div>
            <h1
              className="serif ink reveal d2"
              style={{ fontSize: 'clamp(40px, 8.5vw, 76px)', margin: '0 0 20px', lineHeight: 1.02, maxWidth: 640, letterSpacing: -1 }}
            >
              {invitation}
            </h1>

            <button className="reveal d3" onClick={() => setProfileOpen(true)} aria-label="Change therapy profile" style={profileChip}>
              <span className="pulse-dot" />
              <span>
                Tuned for {AGE_LABEL[age]} · {GOAL_LABEL[goal]}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>· change</span>
            </button>

            <div style={{ height: 16 }} />
            <div className="reveal d4" style={{ display: 'inline-flex', gap: 12 }}>
              <Pill onClick={onAutoStart} style={{ minHeight: 48 }}>
                ✦&nbsp;&nbsp;Decide for me
              </Pill>
            </div>
            <p className="reveal d5" style={{ fontSize: 12, color: 'var(--text-ghost)', margin: '14px 0 0' }}>
              Every session free for 30 seconds · Premium for the full length
            </p>
          </div>

          <div style={{ height: 40 }} />

          {/* ── study spotlight — the unmissable door for students ── */}
          {student && (
            <section
              className="soft-panel reveal d5"
              style={studyBanner}
              onClick={() => onSelect(studySession)}
              role="button"
              aria-label="Start a study session"
            >
              <img
                className="art-img"
                src={ART(age === 'child' ? 'study-kid.svg' : 'study-teen.svg')}
                alt=""
                aria-hidden
                style={{ opacity: 1 }}
              />
              <div style={studyScrim} />
              <div style={{ position: 'relative', maxWidth: 480 }}>
                <div className="label" style={{ color: '#EDE4FF', marginBottom: 8 }}>
                  {THERAPIES.asmrStudy.no} · ASMR & STUDY BEDS
                </div>
                <div className="serif" style={{ fontSize: 'clamp(26px, 5vw, 40px)', lineHeight: 1.05, color: '#FFF', marginBottom: 8 }}>
                  Study time{name.trim() ? `, ${name.trim()}` : ''}?
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', margin: '0 0 16px' }}>
                  Whisper-soft sound that slows the heart and holds attention — tuned for homework,
                  revision and deep work.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Pill
                    onClick={() => onSelect(studySession)}
                    style={{ minHeight: 46 }}
                  >
                    ▶&nbsp;&nbsp;Start studying with sound
                  </Pill>
                  <button
                    className="evidence-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEvidence(THERAPIES.asmrStudy)
                    }}
                  >
                    The science ↗
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── adult: therapy, stated plainly ── */}
          {!student && (
            <div className="reveal d5" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', margin: '0 0 6px' }}>
              <p className="serif-i" style={{ fontSize: 16, color: 'var(--text-secondary)', margin: 0 }}>
                Sound therapy, grounded in clinical research — every chapter cites its studies.
              </p>
              <button className="evidence-btn" onClick={() => setEvidence(rxPrimary)}>
                The evidence ↗
              </button>
            </div>
          )}

          <div style={{ height: student ? 34 : 24 }} />

          {/* ── marquee ── */}
          <div className="marquee reveal d5" aria-hidden>
            <div>
              {[0, 1].map((k) => (
                <span key={k}>
                  BREATHE <em>slowly</em> &nbsp;·&nbsp; LISTEN <em>closely</em> &nbsp;·&nbsp; RESTORE <em>gently</em> &nbsp;·&nbsp; SOUND IS <em>therapy</em> &nbsp;·&nbsp;{' '}
                </span>
              ))}
            </div>
          </div>

          {/* ── the prescription — research mapped to this listener ── */}
          <section className="soft-panel" style={{ ...chapterBox, marginTop: 44 }}>
            <TherapyMesh hues={rxPrimary.hues} opacity={0.2} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', minWidth: 260 }}>
                  <div className="label" style={{ color: 'var(--accent)', marginBottom: 10 }}>
                    Prescribed for {name.trim() || `the ${AGE_LABEL[age].toLowerCase()}`} · {GOAL_LABEL[goal]}
                  </div>
                  <h2 className="serif" style={h2}>
                    {rxPrimary.name} <span className="serif-i" style={{ color: 'var(--text-secondary)' }}>first.</span>
                  </h2>
                  <p style={sciNote}>{PRESCRIPTION_NOTE[age][goal]}</p>
                  <p style={sciLine}>
                    {rxPrimary.science} <span style={srcTag}>{rxPrimary.source}</span>
                  </p>
                  <div style={{ marginTop: 14 }}>
                    <button className="evidence-btn" onClick={() => setEvidence(rxPrimary)}>
                      The evidence ↗
                    </button>
                  </div>
                </div>
                <div className="chapter-art" style={{ flex: '0 1 200px', height: 130, minWidth: 150 }}>
                  <img src={ART(rxPrimary.art)} alt="" aria-hidden />
                </div>
              </div>
              <div style={{ ...grid, marginTop: 20 }}>
                {rxSessions.map((s) => (
                  <SessionCard key={s.id} session={s} onSelect={onSelect} onPreview={onPreview} onLocked={onLocked} fluid />
                ))}
              </div>
            </div>
          </section>

          {/* ── continue ── */}
          <div style={{ marginTop: 40 }}>
            <div className="label sect" style={{ marginBottom: 12 }}>
              Continue
            </div>
            <SessionCard session={featured} onSelect={onSelect} onPreview={onPreview} onLocked={onLocked} featured fluid />
          </div>

          {/* ── six therapy chapters ── */}
          <div className="label sect" style={{ margin: '52px 0 6px' }}>
            The six therapies
          </div>
          {chapters.map(({ therapy, items }) => (
            <section key={therapy.id} className="soft-panel" style={chapterBox}>
              <TherapyMesh hues={therapy.hues} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px', minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
                      <span className="chapter-no">{therapy.no}</span>
                      <div style={{ paddingBottom: 8 }}>
                        <h2 className="serif" style={{ ...h2, margin: 0 }}>
                          {therapy.name}
                        </h2>
                        <div className="serif-i" style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 4 }}>
                          {therapy.tagline}
                        </div>
                      </div>
                    </div>
                    <p style={sciLine}>
                      {therapy.science} <span style={srcTag}>{therapy.source}</span>
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0 20px' }}>
                      <span style={bestForChip(therapy.hues[0])}>Best for · {therapy.bestFor}</span>
                      <button className="evidence-btn" onClick={() => setEvidence(therapy)}>
                        The evidence ↗
                      </button>
                    </div>
                  </div>
                  <div className="chapter-art" style={{ flex: '0 1 210px', height: 140, minWidth: 160, marginBottom: 20 }}>
                    <img src={ART(therapy.art)} alt="" aria-hidden loading="lazy" />
                  </div>
                </div>
                <div style={grid}>
                  {items.map((s) => (
                    <SessionCard key={s.id} session={s} onSelect={onSelect} onPreview={onPreview} onLocked={onLocked} fluid />
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* ── your themes ── */}
          <div style={{ marginTop: 40 }}>
            <div className="label sect" style={{ marginBottom: 12 }}>
              Your Themes
            </div>
            <div style={grid}>
              <AddThemeCard onClick={() => setRequestOpen(true)} />
              {persisted.requests.map((r) => (
                <RequestCard key={r.id} req={r} onLongPress={setRemoveTarget} />
              ))}
            </div>
          </div>

          {/* ── editorial footer ── */}
          <div style={{ padding: '72px 0 20px', textAlign: 'center' }}>
            <div className="serif ink" style={{ fontSize: 'clamp(30px, 6vw, 52px)', lineHeight: 1.08, marginBottom: 10 }}>
              Feel better by listening.
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 26px' }}>
              Tuned for {AGE_LABEL[age].toLowerCase()}s: {AGE_BENEFIT[age].toLowerCase()}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <button onClick={() => openAbout('about')} style={footerLink}>
                About
              </button>
              <span style={{ color: 'var(--text-ghost)' }}>·</span>
              <button onClick={() => openAbout('legal')} style={footerLink}>
                Legal
              </button>
              <span style={{ color: 'var(--text-ghost)' }}>·</span>
              <button onClick={() => openAbout('sources')} style={footerLink}>
                Sources
              </button>
              <span style={{ color: 'var(--text-ghost)' }}>·</span>
              <button onClick={logout} style={footerLink}>
                Switch listener
              </button>
            </div>
            <button
              onClick={() => setMakersOpen(true)}
              aria-label="About the makers, Wizard Communications"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, margin: '22px auto 0' }}
            >
              <img
                src={wizardLogo}
                alt="Wizard Communications"
                style={{
                  height: 20,
                  filter: persisted.settings.theme === 'pastel' ? 'brightness(0.4)' : 'brightness(0) invert(1)',
                  opacity: 0.95,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 0.6 }}>
                CRAFTED IN KOLKATA →
              </span>
            </button>
          </div>
        </div>
      </PullToRefresh>

      {/* therapy profile switcher — re-tune, or step into another profile */}
      <Sheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Therapy profile">
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>
          Sound therapy benefits each age differently. Switch profiles anytime — for yourself, or
          to set up a session for someone else, like a teenager winding down before study.
        </p>
        <div className="label" style={{ marginBottom: 10 }}>Who is listening</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {AGES.map((a) => (
            <button key={a} onClick={() => patchSettings({ ageGroup: a })} style={profileCard(age === a)}>
              <span style={{ fontSize: 15 }}>{AGE_LABEL[a]}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{AGE_BENEFIT[a]}</span>
            </button>
          ))}
        </div>
        <div className="label" style={{ marginBottom: 10 }}>Goal</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {GOALS.map((g) => (
            <button key={g} onClick={() => patchSettings({ goal: g })} style={goalChip(goal === g)}>
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
        <Pill full onClick={() => setProfileOpen(false)}>
          Done
        </Pill>
      </Sheet>

      <TherapyInfoSheet therapy={evidence} onClose={() => setEvidence(null)} />
      <RequestThemeSheet open={requestOpen} onClose={() => setRequestOpen(false)} onSubmit={submitRequest} />
      <AboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} focus={aboutFocus} />
      <MakersPage open={makersOpen} onClose={() => setMakersOpen(false)} />

      {/* confirm removal of a logged request */}
      <Sheet open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remove request?">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: '0 0 20px' }}>
          Remove “{removeTarget?.name}” from your requests? This can't be undone.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Pill variant="ghost" full onClick={() => setRemoveTarget(null)}>
            Keep
          </Pill>
          <Pill
            full
            onClick={() => {
              if (removeTarget) removeRequest(removeTarget.id)
              setRemoveTarget(null)
            }}
          >
            Remove
          </Pill>
        </div>
      </Sheet>
    </div>
  )
}

const footerLink: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)',
  letterSpacing: 0.3,
  padding: '4px 2px',
}
const topBar: React.CSSProperties = {
  flex: '0 0 auto',
  height: 54,
  padding: '0 18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
}
const gear: React.CSSProperties = { fontSize: 20, color: 'var(--text-secondary)' }
const avatarBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontSize: 14,
  fontWeight: 500,
  color: '#0C1018',
}
const scroll: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  padding: '18px 18px 8px',
}
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: 12,
}
const studyBanner: React.CSSProperties = {
  position: 'relative',
  borderRadius: 28,
  overflow: 'hidden',
  padding: 'clamp(22px, 4vw, 36px)',
  border: '1px solid var(--hairline)',
  cursor: 'pointer',
  minHeight: 220,
  display: 'flex',
  alignItems: 'center',
}
const studyScrim: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(100deg, rgba(6,4,14,0.82) 20%, rgba(6,4,14,0.35) 62%, rgba(6,4,14,0.08) 100%)',
}
const chapterBox: React.CSSProperties = {
  position: 'relative',
  marginTop: 26,
  padding: 'clamp(20px, 4vw, 34px)',
  borderRadius: 28,
  border: '1px solid var(--hairline)',
  overflow: 'hidden',
  background: 'var(--chip)',
}
const h2: React.CSSProperties = {
  fontSize: 'clamp(26px, 4.6vw, 40px)',
  lineHeight: 1.05,
  margin: '0 0 10px',
  letterSpacing: -0.5,
}
const sciNote: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  color: 'var(--text-primary)',
  margin: '0 0 8px',
  maxWidth: 560,
}
const sciLine: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.65,
  color: 'var(--text-secondary)',
  margin: '10px 0 0',
  maxWidth: 620,
}
const srcTag: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: 'var(--text-ghost)',
  whiteSpace: 'nowrap',
}
const bestForChip = (hue: string): React.CSSProperties => ({
  fontSize: 12,
  padding: '7px 14px',
  borderRadius: 100,
  border: `1px solid ${hue}55`,
  background: `${hue}1f`,
  color: 'var(--text-primary)',
})
const profileChip: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  minHeight: 40,
  padding: '0 18px',
  borderRadius: 100,
  border: '1px solid var(--accent-line)',
  background: 'var(--panel)',
  backdropFilter: 'blur(12px)',
  color: 'var(--text-primary)',
  fontSize: 13,
}
const profileCard = (on: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 3,
  textAlign: 'left',
  padding: '12px 16px',
  borderRadius: 16,
  border: `1px solid ${on ? 'var(--accent)' : 'var(--hairline)'}`,
  background: on ? 'var(--accent-soft)' : 'var(--chip)',
  color: 'var(--text-primary)',
  width: '100%',
})
const goalChip = (on: boolean): React.CSSProperties => ({
  minHeight: 40,
  padding: '0 16px',
  borderRadius: 100,
  border: `1px solid ${on ? 'var(--accent)' : 'var(--hairline)'}`,
  background: on ? 'var(--accent-soft)' : 'var(--chip)',
  color: 'var(--text-primary)',
  fontSize: 13,
})
