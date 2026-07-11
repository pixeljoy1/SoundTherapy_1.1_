/**
 * Code Connect mapping: AppHeader ↔ Shidoka Applications Figma library — Header.
 *
 * REPLACE the placeholder Figma URL with the node URL of the Header component in
 * your linked Shidoka Applications Figma library (right-click the component in
 * Figma → Copy link to selection). Then run `npm run figma:publish` to push the
 * mapping to Figma so `mcp__Figma__use_figma` resolves this JSX to the real
 * library instance rather than redrawing it.
 */
import figma from '@figma/code-connect'
import { AppHeader } from './AppHeader'

figma.connect(
  AppHeader,
  'https://www.figma.com/design/REPLACE_FILE_KEY/Shidoka-Applications?node-id=REPLACE_HEADER_NODE_ID',
  {
    props: {},
    example: () => <AppHeader />,
  },
)
