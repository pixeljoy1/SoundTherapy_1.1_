import { type FormEvent } from 'react'

/**
 * LoginForm — the sign-in card.
 *
 * Uncontrolled inputs: values are read from FormData on submit. Web components
 * emit custom events (kyn-text-input fires on-input, kyn-checkbox fires
 * on-checkbox-change), which React's synthetic event system doesn't bridge; the
 * FormData path avoids that friction while still using real Shidoka elements.
 */
export function LoginForm() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    // kyn-text-input exposes its value via the light-DOM <input> it wraps.
    const email =
      (form.querySelector('[name="email"] input') as HTMLInputElement | null)?.value ?? ''
    const remember = !!(
      form.querySelector('[name="remember"]') as HTMLElement & { checked?: boolean }
    )?.checked
    // Wired to a real orchestrator auth call in the next iteration.
    console.log('sign-in submitted', { email, remember })
  }

  return (
    <section
      style={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--kd-font-family-primary, inherit)',
            fontSize: 'var(--kd-font-size-h1, 32px)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Sign in to Bridge Orchestrator
        </h1>
        <p
          style={{
            margin: 0,
            color: 'var(--kd-color-text-level-secondary)',
            fontSize: 'var(--kd-font-size-body-01, 14px)',
          }}
        >
          Use your Kyndryl account to access bridges and runs.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <kyn-text-input
          name="email"
          label="Work email"
          type="email"
          placeholder="you@kyndryl.com"
          required
          autoComplete="email"
        />

        <kyn-text-input
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <kyn-checkbox name="remember" value="1">
            Remember this device
          </kyn-checkbox>
          <kyn-link href="/forgot" kind="primary">
            Forgot password?
          </kyn-link>
        </div>

        <kyn-button kind="primary" size="md" type="submit">
          Sign in
        </kyn-button>

        <kyn-button kind="tertiary" size="md" type="button">
          Continue with SSO
        </kyn-button>
      </form>

      <footer
        style={{
          fontSize: 'var(--kd-font-size-body-02, 12px)',
          color: 'var(--kd-color-text-level-secondary)',
        }}
      >
        Need access? <kyn-link href="/request-access">Request an account</kyn-link>
      </footer>
    </section>
  )
}
