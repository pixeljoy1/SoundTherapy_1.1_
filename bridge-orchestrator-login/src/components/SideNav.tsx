/**
 * SideNav — left navigation drawer.
 *
 * Wraps <kyn-side-nav> so the sign-in surface still shows the app's shell
 * chrome. Pinned open on desktop; the component collapses to an icon rail on
 * narrow viewports on its own.
 */
export function SideNav() {
  return (
    <kyn-side-nav pinned>
      <kyn-side-nav-link href="/overview" isActive>
        Overview
      </kyn-side-nav-link>
      <kyn-side-nav-link href="/bridges">Bridges</kyn-side-nav-link>
      <kyn-side-nav-link href="/runs">Runs</kyn-side-nav-link>
      <kyn-side-nav-link href="/connectors">Connectors</kyn-side-nav-link>
      <kyn-side-nav-link href="/settings">Settings</kyn-side-nav-link>
    </kyn-side-nav>
  )
}
