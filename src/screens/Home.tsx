/**
 * Home — Drift spec §8.1 / §8.4.
 * Mobile-first and responsive: a single vertical scroll column with a fixed top
 * bar. The featured (last-played) session sits up top, then each mood group is a
 * wrapping responsive grid of cards — so nothing is cut off in portrait or
 * landscape, on phone or desktop. No bottom nav (§7.3).
 */

import { useMemo, useState } from 'react'
import { CATALOG, byId } from '../session/catalog'
import { GROUP_LABEL, Session, SessionGroup } from '../session/types'
import { SessionCard } from '../components/SessionCard'
import { VersionPill } from '../components/VersionPill'
import { PullToRefresh } from '../components/PullToRefresh'
import { AddThemeCard } from '../components/AddThemeCard'
import { RequestCard } from '../components/RequestCard'
import { RequestThemeSheet } from '../components/RequestThemeSheet'
import { AboutSheet, AboutFocus } from '../components/AboutSheet'
import { MakersPage } from '../components/MakersPage'
import wizardLogo from '../assets/wizard-footer-logo.png'
import { Pill } from '../components/Pill'
import { Sheet } from '../components/Sheet'
import { useStore } from '../state/store'
import { greeting, nextInvitation } from '../state/util'
import { emailThemeRequest, makeId } from '../state/themeRequest'
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

const ROW_ORDER: SessionGroup[] = ['sleep', 'chanting', 'bodyScan', 'breathwork']

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
  const { persisted, openSettings, addRequest, removeRequest, patchSettings } = useStore()
  const name = persisted.settings.name
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
  // fresh invitation line each visit
  const invitation = useState(() => nextInvitation())[0]

  const submitRequest = async (data: { name: string; mood: string; note: string }) => {
    addRequest({ id: makeId(), createdAt: Date.now(), ...data })
    return emailThemeRequest({ ...data, from: name || 'anonymous' })
  }
  const featured = useMemo(
    () => byId(persisted.lastPlayedId ?? 'drift') ?? byId('drift')!,
    [persisted.lastPlayedId],
  )

  const rows = useMemo(
    () =>
      ROW_ORDER.map((g) => ({ group: g, items: CATALOG.filter((s) => s.group === g) })).filter(
        (r) => r.items.length > 0,
      ),
    [],
  )

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* fixed top bar: app name left · version + settings right */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="serif" style={{ fontSize: 18, color: 'var(--text-primary)' }}>
            Attune
          </span>
          <span aria-hidden style={{ fontSize: 14, color: 'var(--accent)', letterSpacing: -1 }}>◦◉◦</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <VersionPill />
          <button aria-label="Settings" onClick={() => openSettings(true)} style={gear}>
            ⚙
          </button>
        </div>
      </div>

      {/* scrollable content with pull-to-refresh */}
      <PullToRefresh style={scroll}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
          <div className="label" style={{ marginBottom: 6 }}>
            {greeting()}
            {name ? `, ${name}` : ''}
          </div>
          <h1 className="serif" style={{ fontSize: 32, margin: '0 0 14px', lineHeight: 1.12, maxWidth: 520 }}>
            {invitation}
          </h1>

          {/* active therapy profile — tap to re-tune or try another profile */}
          <button onClick={() => setProfileOpen(true)} aria-label="Change therapy profile" style={profileChip}>
            <span style={{ color: 'var(--accent)' }}>◉</span>
            <span>
              Tuned for {AGE_LABEL[persisted.settings.ageGroup]} · {GOAL_LABEL[persisted.settings.goal]}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>· change</span>
          </button>

          <div style={{ height: 14 }} />

          {/* fast-track entry */}
          <Pill onClick={onAutoStart} variant="ghost" style={{ minHeight: 46 }}>
            ✦&nbsp;&nbsp;Decide for me
          </Pill>

          {/* breathing space after the greeting */}
          <div style={{ height: 40 }} />

          {/* featured — continue last played */}
          <div className="label" style={{ marginBottom: 10 }}>
            Continue
          </div>
          <SessionCard session={featured} onSelect={onSelect} onPreview={onPreview} onLocked={onLocked} featured fluid />

          {/* mood groups as wrapping grids */}
          {rows.map((row) => (
            <div key={row.group} style={{ marginTop: 26 }}>
              <div className="label" style={{ marginBottom: 10 }}>
                {GROUP_LABEL[row.group]}
              </div>
              <div style={grid}>
                {row.items.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onSelect={onSelect}
                    onPreview={onPreview}
                    onLocked={onLocked}
                    fluid
                  />
                ))}
              </div>
            </div>
          ))}

          {/* request a new theme — logged here + emailed to the developer */}
          <div style={{ marginTop: 26 }}>
            <div className="label" style={{ marginBottom: 10 }}>
              Your Themes
            </div>
            <div style={grid}>
              <AddThemeCard onClick={() => setRequestOpen(true)} />
              {persisted.requests.map((r) => (
                <RequestCard key={r.id} req={r} onLongPress={setRemoveTarget} />
              ))}
            </div>
          </div>

          {/* discreet footer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
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
            </div>
            <button
              onClick={() => setMakersOpen(true)}
              aria-label="About the makers, Wizard Communications"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
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
            <button key={a} onClick={() => patchSettings({ ageGroup: a })} style={profileCard(persisted.settings.ageGroup === a)}>
              <span style={{ fontSize: 15 }}>{AGE_LABEL[a]}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{AGE_BENEFIT[a]}</span>
            </button>
          ))}
        </div>
        <div className="label" style={{ marginBottom: 10 }}>Goal</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {GOALS.map((g) => (
            <button key={g} onClick={() => patchSettings({ goal: g })} style={goalChip(persisted.settings.goal === g)}>
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
        <Pill full onClick={() => setProfileOpen(false)}>
          Done
        </Pill>
      </Sheet>

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

const profileChip: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 38,
  padding: '0 16px',
  borderRadius: 100,
  border: '1px solid var(--hairline)',
  background: 'var(--chip)',
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
  background: on ? 'rgba(167,139,250,0.16)' : 'var(--chip)',
  color: 'var(--text-primary)',
  width: '100%',
})
const goalChip = (on: boolean): React.CSSProperties => ({
  minHeight: 40,
  padding: '0 16px',
  borderRadius: 100,
  border: `1px solid ${on ? 'var(--accent)' : 'var(--hairline)'}`,
  background: on ? 'rgba(167,139,250,0.16)' : 'var(--chip)',
  color: 'var(--text-primary)',
  fontSize: 13,
})
const footerLink: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary)',
  letterSpacing: 0.3,
  padding: '4px 2px',
}
const topBar: React.CSSProperties = {
  flex: '0 0 auto',
  height: 52,
  padding: '0 18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
}
const gear: React.CSSProperties = { fontSize: 20, color: 'var(--text-secondary)' }
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
