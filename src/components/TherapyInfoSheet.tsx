/**
 * TherapyInfoSheet — the evidence window.
 * A calm reading room for one therapy modality: artwork, the long-form science
 * in plain language, the actual studies as links, and (for the Study chapter)
 * curated free streams to keep working with. Rides the existing Sheet, so the
 * open/close is the same buttery slide the rest of the app uses.
 */

import { Sheet } from './Sheet'
import { ART, STUDY_STREAMS, Therapy } from '../therapy/therapies'

export function TherapyInfoSheet({ therapy, onClose }: { therapy: Therapy | null; onClose: () => void }) {
  return (
    <Sheet open={!!therapy} onClose={onClose} title={therapy ? `${therapy.no} · ${therapy.name}` : undefined}>
      {therapy && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="chapter-art" style={{ height: 160 }}>
            <img src={ART(therapy.art)} alt="" aria-hidden />
          </div>

          <div className="serif-i" style={{ fontSize: 19, color: 'var(--text-secondary)' }}>
            {therapy.tagline}
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', margin: 0 }}>
            {therapy.detail}
          </p>

          <div>
            <div className="label" style={{ marginBottom: 10 }}>Read the research</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {therapy.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={srcLink}>
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          {therapy.id === 'asmrStudy' && (
            <div>
              <div className="label" style={{ marginBottom: 10 }}>Keep studying — free streams</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STUDY_STREAMS.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={srcLink}>
                    <span style={{ flex: 1 }}>{s.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--text-ghost)', margin: 0 }}>
            Findings are promising but effect sizes vary between studies. Attune presents sound as
            support for relaxation and focus, not as a medical treatment.
          </p>
        </div>
      )}
    </Sheet>
  )
}

const srcLink: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '11px 14px',
  borderRadius: 14,
  border: '1px solid var(--hairline)',
  background: 'var(--chip)',
  color: 'var(--text-primary)',
  fontSize: 13,
  lineHeight: 1.45,
  textDecoration: 'none',
}
