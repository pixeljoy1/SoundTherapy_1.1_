/**
 * SessionCard — Drift spec §8.1.
 * 160×100dp card with gradient preview, group label, title, duration.
 * Long-press = 10s preview (§7.2). Locked sessions show a lock + open paywall.
 */

import { useRef } from 'react'
import { Session, GROUP_LABEL } from '../session/types'
import { MiniGradient } from './MiniGradient'
import { ART } from '../therapy/therapies'
import { effectivePalette, haptic, isLocked } from '../state/util'
import { useStore } from '../state/store'
import { radius } from '../theme/tokens'

interface Props {
  session: Session
  onSelect: (s: Session) => void
  onPreview?: (s: Session) => void
  onLocked?: (s: Session) => void
  featured?: boolean
  /** Stretch to fill its grid cell (used by the responsive Home grid). */
  fluid?: boolean
}

export function SessionCard({ session, onSelect, onPreview, onLocked, featured, fluid }: Props) {
  const { persisted } = useStore()
  const locked = isLocked(session)
  const palette = effectivePalette(session, persisted.settings)
  const pastel = persisted.settings.theme === 'pastel'
  const pressTimer = useRef<number | null>(null)

  const startPress = () => {
    if (!onPreview || locked) return
    pressTimer.current = window.setTimeout(() => {
      haptic.light()
      onPreview(session)
    }, 450) // long-press threshold (§7.2)
  }
  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const handleClick = () => {
    haptic.light()
    if (locked) onLocked?.(session)
    else onSelect(session)
  }

  return (
    <button
      className="session-card"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      style={{
        position: 'relative',
        width: fluid ? '100%' : featured ? 240 : 160,
        height: featured ? (fluid ? 150 : 168) : fluid ? 116 : 100,
        borderRadius: radius.card,
        overflow: 'hidden',
        flex: fluid ? undefined : '0 0 auto',
        textAlign: 'left',
        transition: 'transform 280ms cubic-bezier(0.34,1.2,0.4,1)',
      }}
    >
      <MiniGradient palette={palette} pastel={pastel} />
      {/* tile artwork — feathered edges, slow zoom on hover */}
      {session.art && <img className="art-img" src={ART(session.art)} alt="" aria-hidden loading="lazy" />}
      {/* legibility scrim — light in pastel, dark otherwise */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: pastel
            ? 'linear-gradient(180deg, rgba(255,255,255,0) 25%, rgba(255,255,255,0.72) 100%)'
            : 'linear-gradient(180deg, rgba(8,8,16,0) 30%, rgba(8,8,16,0.78) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <span className="label" style={{ color: pastel ? 'rgba(43,37,64,0.72)' : 'rgba(240,238,248,0.7)' }}>
          {GROUP_LABEL[session.group]}
        </span>
        <span
          className="serif"
          style={{ fontSize: featured ? 28 : 20, lineHeight: 1.05, marginTop: 4 }}
        >
          {session.title}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {session.comingSoon ? 'Coming soon' : `${session.durationMin} min`}
        </span>
      </div>
      {locked && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            fontSize: 13,
            color: 'rgba(240,238,248,0.85)',
          }}
          aria-label="locked"
        >
          {session.comingSoon ? '◦' : '🔒'}
        </div>
      )}
      {featured && !locked && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 40,
            height: 40,
            borderRadius: radius.pill,
            background: 'rgba(8,8,16,0.45)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
          }}
        >
          ▶
        </div>
      )}
    </button>
  )
}
