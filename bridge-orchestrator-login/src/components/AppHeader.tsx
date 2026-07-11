/**
 * AppHeader — top bar for Bridge Orchestrator.
 *
 * Uses the Shidoka <kyn-header> global. The nav goes in slot="left"; the user
 * profile sits in the default slot (right of logo/title). Do NOT swap these for
 * styled <div>s — Code Connect maps this JSX to the Shidoka Figma Applications
 * "Header" component, and the mapping needs real tags to resolve.
 */
export function AppHeader() {
  return (
    <kyn-header appTitle="Bridge Orchestrator" rootUrl="/">
      <kyn-header-nav slot="left">
        <kyn-header-link href="/overview" isActive>
          Overview
        </kyn-header-link>
        <kyn-header-link href="/bridges">Bridges</kyn-header-link>
        <kyn-header-link href="/runs">Runs</kyn-header-link>
        <kyn-header-link href="/docs">Docs</kyn-header-link>
      </kyn-header-nav>
      <kyn-header-user-profile
        name="Guest"
        subtitle="Not signed in"
        email="guest@kyndryl.com"
      />
    </kyn-header>
  )
}
