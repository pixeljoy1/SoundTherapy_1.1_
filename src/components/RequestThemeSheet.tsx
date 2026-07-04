/**
 * RequestThemeSheet — short form to request a new theme.
 * On submit the request is logged to the homepage and emailed to the developer.
 */

import { useState } from 'react'
import { Sheet } from './Sheet'
import { Pill } from './Pill'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface Props {
  open: boolean
  onClose: () => void
  /** Returns whether the email reached the developer; request is logged regardless. */
  onSubmit: (data: { name: string; mood: string; note: string }) => Promise<boolean>
}

export function RequestThemeSheet({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const reset = () => {
    setName('')
    setMood('')
    setNote('')
    setStatus('idle')
  }

  const close = () => {
    onClose()
    // clear shortly after the sheet has animated away
    window.setTimeout(reset, 360)
  }

  const submit = async () => {
    if (!name.trim() || status === 'sending') return
    setStatus('sending')
    const ok = await onSubmit({ name: name.trim(), mood: mood.trim(), note: note.trim() })
    setStatus(ok ? 'sent' : 'error')
    window.setTimeout(close, ok ? 1200 : 2200)
  }

  const label =
    status === 'sending'
      ? 'Sending…'
      : status === 'sent'
        ? 'Sent ✓'
        : status === 'error'
          ? 'Logged — email failed'
          : 'Send request'

  return (
    <Sheet open={open} onClose={close} title="Request a theme">
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 18px' }}>
        Tell us what you'd love to drift to. We read every request.
      </p>

      <Field label="Theme name">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tibetan Bowls"
          style={input}
        />
      </Field>
      <Field label="Mood / vibe (optional)">
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="e.g. warm, slow, grounding"
          style={input}
        />
      </Field>
      <Field label="Anything else (optional)">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Sounds, instruments, references…"
          rows={3}
          style={{ ...input, resize: 'none', lineHeight: 1.4 }}
        />
      </Field>

      <div style={{ marginTop: 8 }}>
        <Pill onClick={submit} full>
          {label}
        </Pill>
      </div>
    </Sheet>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="label" style={{ marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

const input: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  padding: '12px 14px',
  fontSize: 15,
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--sans)',
}
