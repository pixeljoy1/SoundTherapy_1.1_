import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Shidoka Foundation ships the design tokens (color, spacing, typography) as CSS
// custom properties. Loading these BEFORE any component mounts is what gives the
// Shidoka look and what Code Connect uses to match code ↔ Figma variable defs.
import '@kyndryl-design-system/shidoka-foundation/css/global.css'
import '@kyndryl-design-system/shidoka-foundation/css/tokens.css'

// Registering the web components so <kyn-*> tags resolve. Importing the barrel
// side-effect registers every custom element in the applications library.
import '@kyndryl-design-system/shidoka-applications/components/reusable/button'
import '@kyndryl-design-system/shidoka-applications/components/reusable/textInput'
import '@kyndryl-design-system/shidoka-applications/components/reusable/checkbox'
import '@kyndryl-design-system/shidoka-applications/components/reusable/link'
import '@kyndryl-design-system/shidoka-applications/components/global/header'
import '@kyndryl-design-system/shidoka-applications/components/global/sideNav'
import '@kyndryl-design-system/shidoka-applications/components/global/footer'

import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
