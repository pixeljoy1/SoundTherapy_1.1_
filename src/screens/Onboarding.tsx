/**
 * Onboarding — Attune's tuning ritual. Five gentle steps, no account required:
 *   1. What sound therapy is   2. Name   3. Age group (benefits differ by age)
 *   4. Goal   5. Make it yours (look + session timer) → start a matched session.
 * Therapeutic pacing: nothing auto-advances — every step has Back / Next so the
 * listener moves at their own rhythm and can revisit a choice. Every choice is
 * saved to settings and remains editable later (Settings, or the Home profile).
 */

import { useMemo, useState } from 'react'
import { GradientCanvas } from '../gradient/GradientCanvas'
import { GradientController } from '../gradient/GradientController'
import { Pill } from '../components/Pill'
import { useStore } from '../state/store'
import {
  AGE_BENEFIT,
  AGE_LABEL,
  AgeGroup,
  GOAL_LABEL,
  SleepTimer,
  TherapyGoal,
  TIMER_OPTIONS,
} from '../state/types'
import { radius } from '../theme/tokens'
import { haptic, timerLabel } from '../state/util'

const AGES: AgeGroup[] = ['child', 'teen', 'youngAdult', 'adult']
const GOALS: TherapyGoal[] = ['sleep', 'focus', 'stress', 'mood']
const STEPS = 5

const GOAL_HINT: Record<TherapyGoal, string> = {
  sleep: 'Slow soundscapes that ease you into deep rest.',
  focus: 'Steady tones and breath pacing that sharpen attention.',
  stress: 'Warm, natural textures that let the tension drain.',
  mood: 'Resonant voices and chants that settle the heart.',
}

export function Onboarding({ onDone }: { onDone: (goal: TherapyGoal) => void }) {
  const { persisted, patchSettings, setOnboardingComplete } = useStore()
  const controller = useMemo(() => new GradientController('deepWater'), [])
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState<AgeGroup | null>(null)
  const [goal, setGoal] = useState<TherapyGoal | null>(null)

  // each step gates Next until it has what it needs (name is optional)
  const canNext = step === 2 ? age != null : step === 3 ? goal != null : true

  const back = () => {
    haptic.light()
    setStep((s) => Math.max(0, s - 1))
  }

  const next = () => {
    if (!canNext) return
    haptic.light()
    if (step === 1) patchSettings({ name: name.trim() })
    if (step === 2 && age) patchSettings({ ageGroup: age })
    if (step === 3 && goal) patchSettings({ goal })
    setStep((s) => s + 1)
  }

  const finish = () => {
    haptic.medium()
    setOnboardingComplete(true)
    onDone(goal ?? 'stress')
  }

  return (
    <div className="screen">
      <GradientCanvas controller={controller} psychedelic={0.7} pastel={persisted.settings.theme === 'pastel'} />
      <div style={overlay}>
        <div style={panel}>
          {step === 0 && (
            <>
              <div className="label">ATTUNE · SOUND THERAPY</div>
              <h1 className="serif" style={{ fontSize: 40, margin: 0, lineHeight: 1.1 }}>
                Sound that helps you feel better.
              </h1>
              <p style={lead}>
                Scientific and practical evidence suggests sound therapy can improve mental,
                emotional, and even physical well-being. Rhythmic sound slows the breath, calms
                the nervous system, and helps the mind settle — at every age.
              </p>
              <p style={{ ...lead, color: 'var(--text-primary)' }}>
                Before we begin, unclench your jaw. Let your shoulders drop. There is no rush here.
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="serif" style={{ fontSize: 40, margin: 0 }}>
                What may we call you?
              </h1>
              <p style={lead}>Only so your sessions can greet you. You're welcome to stay anonymous.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="(optional)"
                style={inputStyle}
              />
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
                Who is listening?
              </h1>
              <p style={lead}>
                Sound meets each age differently. Choose whose calm we're tuning today — you can
                switch profiles anytime, or simply explore another one.
              </p>
              <div style={chipCol}>
                {AGES.map((a) => (
                  <button key={a} onClick={() => setAge(a)} style={selCard(age === a)}>
                    <span style={{ fontSize: 16 }}>{AGE_LABEL[a]}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {AGE_BENEFIT[a]}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
                What does your mind need most{name.trim() ? `, ${name.trim()}` : ''}?
              </h1>
              {age && (
                <p style={{ ...lead, margin: 0 }}>
                  For you: {AGE_BENEFIT[age].charAt(0).toLowerCase() + AGE_BENEFIT[age].slice(1)}
                </p>
              )}
              <div style={chipCol}>
                {GOALS.map((g) => (
                  <button key={g} onClick={() => setGoal(g)} style={selCard(goal === g)}>
                    <span style={{ fontSize: 16 }}>{GOAL_LABEL[g]}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {GOAL_HINT[g]}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
                Make it yours.
              </h1>
              <p style={lead}>Set the feel and how long sound stays with you. Everything can change later.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
                <div className="label">Look</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['dark', 'pastel'] as const).map((t) => (
                    <button key={t} onClick={() => patchSettings({ theme: t })} style={chipSel(persisted.settings.theme === t)}>
                      {t === 'dark' ? 'Night' : 'Pastel'}
                    </button>
                  ))}
                </div>

                <div className="label" style={{ marginTop: 6 }}>Session fades out after</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {TIMER_OPTIONS.map((t: SleepTimer) => (
                    <button
                      key={String(t)}
                      onClick={() => patchSettings({ defaultSleepTimer: t })}
                      style={chipSel(persisted.settings.defaultSleepTimer === t)}
                    >
                      {timerLabel(t)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* step dots + back / next — present on every step */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 7 }}>
              {Array.from({ length: STEPS }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === step ? 22 : 7,
                    height: 7,
                    borderRadius: 4,
                    background: i === step ? 'var(--accent)' : 'var(--text-ghost)',
                    transition: 'all 260ms ease',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              {step > 0 && (
                <Pill variant="ghost" onClick={back} style={{ minWidth: 110 }}>
                  ← Back
                </Pill>
              )}
              {step < STEPS - 1 ? (
                <Pill onClick={next} style={{ flex: 1, opacity: canNext ? 1 : 0.45 }}>
                  {step === 0 ? 'Begin gently' : 'Next →'}
                </Pill>
              ) : (
                <Pill onClick={finish} style={{ flex: 1 }}>
                  Begin my first session
                </Pill>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  padding: 24,
  overflowY: 'auto',
}
const panel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  alignItems: 'flex-start',
  maxWidth: 480,
  width: '100%',
}
const lead: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.65,
  color: 'var(--text-secondary)',
  margin: 0,
  maxWidth: 440,
}
const chipCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: '100%',
}
const selCard = (on: boolean): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 4,
  textAlign: 'left',
  padding: '14px 18px',
  borderRadius: 18,
  border: `1px solid ${on ? 'var(--accent)' : 'var(--hairline)'}`,
  background: on ? 'rgba(167,139,250,0.16)' : 'var(--chip)',
  color: 'var(--text-primary)',
  width: '100%',
})
const chipSel = (on: boolean): React.CSSProperties => ({
  minHeight: 44,
  padding: '0 18px',
  borderRadius: radius.pill,
  border: `1px solid ${on ? 'var(--accent)' : 'var(--hairline)'}`,
  background: on ? 'rgba(167,139,250,0.16)' : 'var(--chip)',
  color: 'var(--text-primary)',
  fontSize: 14,
})
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--text-ghost)',
  padding: '12px 4px',
  fontSize: 24,
  fontFamily: 'var(--serif)',
  outline: 'none',
}
