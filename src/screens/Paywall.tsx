/**
 * Paywall — Drift spec §14. Bottom sheet (not full-screen takeover), one-tap
 * dismiss. Appears when a locked session is tapped. No ads, ever.
 */

import { Sheet } from '../components/Sheet'
import { Pill } from '../components/Pill'
import { Session } from '../session/types'

const BENEFITS = [
  'Full session catalog — every soundscape',
  'FLAC audio quality',
  'Unlimited session timer',
  'Early access to new soundscapes',
  'Offline caching for everything',
]

export function Paywall({
  session,
  onClose,
  onUnlock,
}: {
  session: Session | null
  onClose: () => void
  onUnlock: () => void
}) {
  const comingSoon = session?.comingSoon
  return (
    <Sheet open={!!session} onClose={onClose} title={comingSoon ? 'Coming soon' : 'Attune Premium'}>
      {comingSoon ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '0 0 20px' }}>
          {session?.title} is a Focus session — arriving in a future update.
        </p>
      ) : (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '0 0 16px' }}>
            Unlock {session?.title} and everything else.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BENEFITS.map((b) => (
              <li key={b} style={{ display: 'flex', gap: 10, fontSize: 15 }}>
                <span style={{ color: 'var(--accent)' }}>✦</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Pill onClick={onUnlock} full>
            Start Premium
          </Pill>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-ghost)', margin: '14px 0 0' }}>
            No ads. Ever. Not anywhere.
          </p>
        </>
      )}
    </Sheet>
  )
}
