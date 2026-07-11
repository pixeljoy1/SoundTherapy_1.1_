import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Shidoka Foundation ships design tokens (color, spacing, type) as CSS custom
// properties. Loading these BEFORE any component mounts is what gives the
// Shidoka look — and what Code Connect uses to match code ↔ Figma variables.
import '@kyndryl-design-system/shidoka-foundation/css/index.css'

// Side-effect imports register each web component's custom element so the
// <kyn-*> tags resolve at render time.
import '@kyndryl-design-system/shidoka-applications/components/reusable/button'
import '@kyndryl-design-system/shidoka-applications/components/reusable/textInput'
import '@kyndryl-design-system/shidoka-applications/components/reusable/checkbox'
import '@kyndryl-design-system/shidoka-applications/components/reusable/link'
import '@kyndryl-design-system/shidoka-applications/components/global/header'
import '@kyndryl-design-system/shidoka-applications/components/global/localNav'
import '@kyndryl-design-system/shidoka-applications/components/global/footer'

import { App } from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
