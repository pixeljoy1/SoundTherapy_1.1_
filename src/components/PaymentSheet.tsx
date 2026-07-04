/**
 * PaymentSheet — a mock payment gateway for Drift Premium (₹99).
 * Simulates a full checkout (order summary, Card / UPI methods, processing,
 * success). No real charge — on success it unlocks Premium.
 */

import { useState } from 'react'
import { Sheet } from './Sheet'
import { Pill } from './Pill'
import { useStore } from '../state/store'

type Method = 'card' | 'upi'
type Status = 'form' | 'processing' | 'success'

const BENEFITS = ['Full sessions — 5 min to all night', 'Every soundscape & chant', 'Unlimited session timer', 'Offline caching']

export function PaymentSheet() {
  const { paymentOpen, openPayment, setPremium } = useStore()
  const [method, setMethod] = useState<Method>('card')
  const [status, setStatus] = useState<Status>('form')
  const [card, setCard] = useState('')
  const [exp, setExp] = useState('')
  const [cvv, setCvv] = useState('')
  const [upi, setUpi] = useState('')

  const close = () => {
    openPayment(false)
    window.setTimeout(() => setStatus('form'), 360)
  }

  const canPay = method === 'card' ? card.replace(/\s/g, '').length >= 12 && exp.length >= 4 && cvv.length >= 3 : /.+@.+/.test(upi)

  const pay = () => {
    if (!canPay || status !== 'form') return
    setStatus('processing')
    window.setTimeout(() => {
      setStatus('success')
      setPremium(true)
      window.setTimeout(close, 1600)
    }, 1800)
  }

  return (
    <Sheet open={paymentOpen} onClose={close} title={status === 'success' ? undefined : 'Attune Premium'}>
      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
          <div style={{ fontSize: 44 }}>✓</div>
          <h2 className="serif" style={{ fontSize: 26, margin: '10px 0 6px' }}>
            Payment successful
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>Welcome to Attune Premium.</p>
        </div>
      ) : (
        <>
          {/* order summary */}
          <div style={summary}>
            <div>
              <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>Attune Premium</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>One-time · lifetime access</div>
            </div>
            <div className="serif" style={{ fontSize: 26 }}>
              ₹99
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BENEFITS.map((b) => (
              <li key={b} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent)' }}>✦</span>
                {b}
              </li>
            ))}
          </ul>

          {/* method tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['card', 'upi'] as Method[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                style={{
                  flex: 1,
                  minHeight: 40,
                  borderRadius: 12,
                  border: `1px solid ${method === m ? 'var(--accent)' : 'var(--hairline)'}`,
                  background: method === m ? 'var(--accent-soft)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              >
                {m === 'card' ? 'Card' : 'UPI'}
              </button>
            ))}
          </div>

          {method === 'card' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input inputMode="numeric" value={card} onChange={(e) => setCard(formatCard(e.target.value))} placeholder="Card number" maxLength={19} style={input} />
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={exp} onChange={(e) => setExp(formatExp(e.target.value))} placeholder="MM/YY" maxLength={5} style={{ ...input, flex: 1 }} />
                <input inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} placeholder="CVV" maxLength={4} style={{ ...input, flex: 1 }} />
              </div>
            </div>
          ) : (
            <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="yourname@upi" style={input} />
          )}

          <div style={{ marginTop: 20 }}>
            <Pill full onClick={pay} style={{ opacity: canPay && status === 'form' ? 1 : 0.55 }}>
              {status === 'processing' ? 'Processing…' : 'Pay ₹99'}
            </Pill>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-ghost)', margin: '12px 0 0' }}>
            🔒 Demo payment — no real charge is made.
          </p>
        </>
      )}
    </Sheet>
  )
}

function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExp(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

const summary: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderRadius: 16,
  background: 'var(--accent-soft)',
  border: '1px solid var(--hairline)',
}
const input: React.CSSProperties = {
  width: '100%',
  background: 'rgba(127,127,150,0.08)',
  border: '1px solid var(--hairline)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 15,
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--sans)',
}
