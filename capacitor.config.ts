import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor wraps the built web app (dist/) in an Android WebView so it can be
 * packaged as an installable .apk. The android/ project is generated in CI.
 */
const config: CapacitorConfig = {
  appId: 'net.wizardcomm.attune',
  appName: 'Attune',
  webDir: 'dist',
  backgroundColor: '#071018',
}

export default config
