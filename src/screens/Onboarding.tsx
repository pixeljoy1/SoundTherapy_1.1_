/**
 * Onboarding — Attune's tuning ritual. Five light steps, no account required:
 *   1. What sound therapy is   2. Name   3. Age group (benefits differ by age)
 *   4. Goal   5. Make it yours (look + session timer) → start a matched session.
 * Every choice is saved to settings, so the app is customized from the very
 * first screen — and everything remains editable later in Settings.
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

  const next = () => {
    haptic.light()
    setStep((s) => s + 1)
  }

  const pickAge = (a: AgeGroup) => {
    setAge(a)
    patchSettings({ ageGroup: a })
    next()
  }

  const pickGoal = (g: TherapyGoal) => {
    setGoal(g)
    patchSettings({ goal: g })
    next()
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
        {step === 0 && (
          <div style={panel}>
            <div className="label">ATTUNE · SOUND THERAPY</div>
            <h1 className="serif" style={{ fontSize: 40, margin: 0, lineHeight: 1.1 }}>
              Sound that helps you feel better.
            </h1>
            <p style={lead}>
              Scientific and practical evidence suggests sound therapy can improve mental,
              emotional, and even physical well-being. Rhythmic sound slows the breath, calms
              the nervous system, and helps the mind settle — at every age.
            </p>
            <Pill onClick={next}>Tune in</Pill>
          </div>
        )}

        {step === 1 && (
          <div style={panel}>
            <h1 className="serif" style={{ fontSize: 40, margin: 0 }}>
              What's your name?
            </h1>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="(optional)"
              style={inputStyle}
            />
            <Pill
              onClick={() => {
                patchSettings({ name: name.trim() })
                next()
              }}
            >
              Continue
            </Pill>
          </div>
        )}

        {step === 2 && (
          <div style={panel}>
            <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
              Who is listening?
            </h1>
            <p style={lead}>Sound therapy benefits each age differently — we tune the experience to you.</p>
            <div style={chipCol}>
              {AGES.map((a) => (
                <button key={a} onClick={() => pickAge(a)} style={chipWide}>
                  <span style={{ fontSize: 16 }}>{AGE_LABEL[a]}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {AGE_BENEFIT[a]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={panel}>
            <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
              What do you need most{name.trim() ? `, ${name.trim()}` : ''}?
            </h1>
            {age && (
              <p style={{ ...lead, margin: 0 }}>
                For you: {AGE_BENEFIT[age].charAt(0).toLowerCase() + AGE_BENEFIT[age].slice(1)}
              </p>
            )}
            <div style={chipCol}>
              {GOALS.map((g) => (
                <button key={g} onClick={() => pickGoal(g)} style={chipWide}>
                  <span style={{ fontSize: 16 }}>{GOAL_LABEL[g]}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {GOAL_HINT[g]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={panel}>
            <h1 className="serif" style={{ fontSize: 36, margin: 0 }}>
              Make it yours.
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              <div className="label">Look</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['dark', 'pastel'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => patchSettings({ theme: t })}
                    style={{
                      ...chip,
                      borderColor: persisted.settings.theme === t ? 'var(--accent)' : 'var(--hairline)',
                      background: persisted.settings.theme === t ? 'rgba(167,139,250,0.16)' : 'var(--chip)',
                    }}
                  >
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
                    style={{
                      ...chip,
                      borderColor:
                        persisted.settings.defaultSleepTimer === t ? 'var(--accent)' : 'var(--hairline)',
                      background:
                        persisted.settings.defaultSleepTimer === t ? 'rgba(167,139,250,0.16)' : 'var(--chip)',
                    }}
                  >
                    {timerLabel(t)}
                  </button>
                ))}
              </div>
            </div>

            <Pill onClick={finish}>Begin my first session</Pill>
          </div>
        )}
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
const chipWide: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 4,
  textAlign: 'left',
  padding: '14px 18px',
  borderRadius: 18,
  border: '1px solid var(--hairline)',
  background: 'var(--chip)',
  color: 'var(--text-primary)',
  width: '100%',
}
const chip: React.CSSProperties = {
  minHeight: 44,
  padding: '0 18px',
  borderRadius: radius.pill,
  border: '1px solid var(--hairline)',
  background: 'var(--chip)',
  color: 'var(--text-primary)',
  fontSize: 14,
}
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
