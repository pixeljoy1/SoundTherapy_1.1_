/**
 * AppFooter — page footer.
 *
 * <kyn-footer> takes plain <a> tags in its default slot for the link row and a
 * dedicated slot="copyright" for the copyright line.
 */
export function AppFooter() {
  return (
    <kyn-footer rootUrl="/">
      <kyn-link href="/privacy" standalone>Privacy</kyn-link>
      <kyn-link href="/terms" standalone>Terms</kyn-link>
      <kyn-link href="/status" standalone>Status</kyn-link>
      <kyn-link href="/contact" standalone>Contact</kyn-link>
      <span slot="copyright">© {new Date().getFullYear()} Kyndryl</span>
    </kyn-footer>
  )
}
