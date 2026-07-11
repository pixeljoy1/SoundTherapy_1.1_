/**
 * Code Connect mapping: AppFooter ↔ Shidoka Applications Figma library — Footer.
 */
import figma from '@figma/code-connect'
import { AppFooter } from './AppFooter'

figma.connect(
  AppFooter,
  'https://www.figma.com/design/REPLACE_FILE_KEY/Shidoka-Applications?node-id=REPLACE_FOOTER_NODE_ID',
  {
    props: {},
    example: () => <AppFooter />,
  },
)
