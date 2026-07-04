/**
 * Theme-request email delivery.
 * Drift is a static site (GitHub Pages) with no backend, so requests are emailed
 * to the developer via FormSubmit's AJAX endpoint — no server required.
 *
 * NOTE: FormSubmit requires a one-time activation: the first submission triggers
 * a confirmation email to pixeljoy@gmail.com; clicking its link activates future
 * deliveries. Requests are always logged locally regardless of email success.
 */

const ENDPOINT = 'https://formsubmit.co/ajax/pixeljoy@gmail.com'

export interface ThemeRequestPayload {
  name: string
  mood: string
  note: string
  from: string
}

export async function emailThemeRequest(p: ThemeRequestPayload): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Drift · new theme request: ${p.name}`,
        _captcha: 'false',
        _template: 'table',
        Theme: p.name,
        Mood: p.mood || '—',
        Note: p.note || '—',
        From: p.from || 'anonymous',
        SubmittedAt: new Date().toISOString(),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export function makeId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
