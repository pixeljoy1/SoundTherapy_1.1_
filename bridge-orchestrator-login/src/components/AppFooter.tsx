/**
 * AppFooter — page footer.
 */
export function AppFooter() {
  return (
    <kyn-footer rootUrl="/" copyright={`© ${new Date().getFullYear()} Kyndryl`}>
      <kyn-footer-nav>
        <kyn-footer-link href="/privacy">Privacy</kyn-footer-link>
        <kyn-footer-link href="/terms">Terms</kyn-footer-link>
        <kyn-footer-link href="/status">Status</kyn-footer-link>
        <kyn-footer-link href="/contact">Contact</kyn-footer-link>
      </kyn-footer-nav>
    </kyn-footer>
  )
}
