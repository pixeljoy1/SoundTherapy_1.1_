import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Shidoka ships Lit-based custom elements. React treats any tag with a hyphen
      // as a custom element, so no extra config is required — but we tell the JSX
      // runtime to leave unknown tags alone.
    }),
  ],
  server: {
    port: 4200,
    open: true,
  },
})
