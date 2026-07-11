/**
 * SideNav — left navigation drawer.
 *
 * Wraps <kyn-local-nav> (the Shidoka side/local nav component). Pinned open on
 * desktop; the component collapses to an icon rail on narrow viewports on its
 * own. The React file name stays SideNav so it reads naturally in code — the
 * DOM tag is what Code Connect matches to the Figma library.
 */
export function SideNav() {
  return (
    <kyn-local-nav pinned>
      <kyn-local-nav-link href="/overview" active>
        Overview
      </kyn-local-nav-link>
      <kyn-local-nav-link href="/bridges">Bridges</kyn-local-nav-link>
      <kyn-local-nav-link href="/runs">Runs</kyn-local-nav-link>
      <kyn-local-nav-link href="/connectors">Connectors</kyn-local-nav-link>
      <kyn-local-nav-link href="/settings">Settings</kyn-local-nav-link>
    </kyn-local-nav>
  )
}
