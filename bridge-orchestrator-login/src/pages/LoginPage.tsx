import { AppHeader } from '../components/AppHeader'
import { SideNav } from '../components/SideNav'
import { AppFooter } from '../components/AppFooter'
import { LoginForm } from '../components/LoginForm'

/**
 * LoginPage — full app-shell login layout.
 *
 * The shell (header + side nav + footer + main) mirrors the Shidoka
 * Applications library's page layout, so a Figma push resolves each region to
 * its library instance instead of a bespoke frame.
 */
export function LoginPage() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-body">
        <SideNav />
        <main className="app-main">
          <LoginForm />
        </main>
      </div>
      <AppFooter />
    </div>
  )
}
