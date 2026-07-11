/**
 * AppHeader — top bar for Bridge Orchestrator.
 *
 * Uses the Shidoka <kyn-header> global. Do NOT replace with a styled <div>; the
 * whole point is that Code Connect maps this JSX to the header component in the
 * Shidoka Figma Applications library.
 */
export function AppHeader() {
  return (
    <kyn-header appTitle="Bridge Orchestrator" rootUrl="/" divider>
      <kyn-header-nav>
        <kyn-header-link href="/overview" isActive>
          Overview
        </kyn-header-link>
        <kyn-header-link href="/bridges">Bridges</kyn-header-link>
        <kyn-header-link href="/runs">Runs</kyn-header-link>
        <kyn-header-link href="/docs">Docs</kyn-header-link>
      </kyn-header-nav>
      <kyn-header-user-profile slot="right" name="Guest" subtitle="Not signed in" />
    </kyn-header>
  )
}
