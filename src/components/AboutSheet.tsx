/**
 * AboutSheet — three distinct footer pages selected by `focus`:
 *   about   → what Drift is
 *   legal   → wellness disclaimer + privacy
 *   sources → texts, citations, typography, audio
 * Each renders its own title and content (not one shared page scrolled).
 */

import { Sheet } from './Sheet'
import { APP_VERSION } from '../version'

export type AboutFocus = 'about' | 'legal' | 'sources'

const TITLES: Record<AboutFocus, string> = {
  about: 'About Attune',
  legal: 'Legal',
  sources: 'Sources & Credits',
}

export function AboutSheet({ open, onClose, focus = 'about' }: { open: boolean; onClose: () => void; focus?: AboutFocus }) {
  return (
    <Sheet open={open} onClose={onClose} title={TITLES[focus]}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
        {focus === 'about' && (
          <>
            <Block title="What sound therapy is">
              Sound therapy uses curated soundscapes, resonant voices, and paced breathing to calm
              the nervous system. Scientific and practical evidence suggests it can play a
              significant role in improving mental, emotional, and even physical well-being —
              lowering stress, steadying mood, and easing the way into deep rest.
            </Block>
            <Block title="Benefits by age">
              Different age groups experience unique benefits:
              <ul style={list}>
                <li><strong style={strong}>Children</strong> — improved focus, better sleep patterns, and emotional balance.</li>
                <li><strong style={strong}>Teenagers</strong> — reduced stress, enhanced concentration, and support in managing anxiety and mood fluctuations.</li>
                <li><strong style={strong}>Young adults</strong> — relaxation, productivity enhancement, and overall mental clarity in fast-paced lifestyles.</li>
              </ul>
              Attune asks who is listening during onboarding, and tunes itself accordingly.
            </Block>
            <Block title="How Attune works">
              Living gradients and layered, calming audio play in your browser while a session
              timer fades everything to silence on its own. No streaks, no noise, no engagement
              loops. It is made to be used, then set down.
            </Block>
            <Block title="Notice">
              Attune is an independent web prototype crafted by Wizard Communications, Kolkata.
              All marks belong to their respective owners.
            </Block>
          </>
        )}

        {focus === 'legal' && (
          <>
            <Block title="Wellness disclaimer">
              Attune is a relaxation aid, not a medical device. Sound therapy here is not intended
              to diagnose, treat, cure, or prevent any condition, and is not a substitute for
              professional care for sleep disorders, anxiety, or any health concern. If problems
              persist, please consult a qualified clinician. Do not use while driving or operating
              machinery.
            </Block>
            <Block title="Privacy">
              Your name, preferences, and theme requests are stored locally on this device. Submitting
              a theme request sends its contents to the developer by email (via FormSubmit). Nothing
              else is collected or shared.
            </Block>
          </>
        )}

        {focus === 'sources' && (
          <>
            <Block title="The science we lean on">
              Attune's therapy chapters and per-listener prescriptions are grounded in published
              research:
              <ul style={list}>
                <li>
                  Nature sound &amp; stress recovery — Alvarsson et&nbsp;al. 2010,{' '}
                  <Src href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2872309/">Int J Env Res Public Health</Src>; forest
                  soundscapes &amp; restoration,{' '}
                  <Src href="https://www.nature.com/articles/s41598-025-11469-x">Sci Reports 2025</Src>.
                </li>
                <li>
                  Broadband/white noise &amp; infant sleep onset —{' '}
                  <Src href="https://www.amplifon.com/uk/audiology-magazine/white-noises">Spencer et&nbsp;al., review</Src>.
                </li>
                <li>
                  Beat-paced audio &amp; anxiety/mood —{' '}
                  <Src href="https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1539823/full">
                    Frontiers in Psychology 2025
                  </Src>.
                </li>
                <li>
                  Slow tempo (60–80 BPM) &amp; vagal tone —{' '}
                  <Src href="https://journals.sagepub.com/doi/10.1177/2059204319858281">Bretherton et&nbsp;al. 2019</Src>.
                </li>
                <li>
                  Singing-bowl meditation &amp; tension/mood —{' '}
                  <Src href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5871151/">Goldsby et&nbsp;al. 2017</Src>.
                </li>
                <li>
                  'OM' chanting &amp; limbic deactivation —{' '}
                  <Src href="https://pubmed.ncbi.nlm.nih.gov/21654968/">Kalyani et&nbsp;al. 2011 (fMRI)</Src>.
                </li>
              </ul>
              Findings are promising but effect sizes vary; Attune presents them as support for
              relaxation, not medical claims.
            </Block>
            <Block title="Texts &amp; citations">
              Chant subtitles are traditional, public-domain passages, reproduced with their sources:
              <ul style={list}>
                <li>Dhammapada, vv. 1, 5, 277 — Pāli Canon (public domain).</li>
                <li>Prajñāpāramitāhṛdaya (Heart Sūtra) mantra — traditional.</li>
                <li>Bṛhadāraṇyaka Upaniṣad 1.3.28 &amp; 1.4.10 — public domain.</li>
                <li>Chāndogya Upaniṣad 3.14.1 &amp; 6.8.7 — public domain.</li>
                <li>Oṃ &amp; Oṃ Śāntiḥ — traditional Vedic invocations.</li>
              </ul>
              Transliterations are standard IAST. Any error is unintentional — corrections welcome.
            </Block>
            <Block title="Audio">
              Sessions play curated ambient recordings and vocal chants bundled with the app,
              layered and faded live in your browser. No third-party streaming services are used.
            </Block>
            <Block title="Typography">
              DM Serif Display and Inter, served via Google Fonts under the SIL Open Font License 1.1.
            </Block>
          </>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-ghost)', textAlign: 'center', paddingTop: 4 }}>
          Attune {APP_VERSION} · © {new Date().getFullYear()} Wizard Communications
        </div>
      </div>
    </Sheet>
  )
}

function Src({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
      {children}
    </a>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 6, color: 'var(--text-primary)' }}>
        {title}
      </div>
      <div>{children}</div>
    </div>
  )
}

const list: React.CSSProperties = { margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }
const strong: React.CSSProperties = { color: 'var(--text-primary)', fontWeight: 500 }
