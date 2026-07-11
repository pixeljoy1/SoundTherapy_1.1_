/**
 * Code Connect mapping: SideNav ↔ Shidoka Applications Figma library — Side Nav.
 * See AppHeader.figma.tsx for the placeholder-replacement instructions.
 */
import figma from '@figma/code-connect'
import { SideNav } from './SideNav'

figma.connect(
  SideNav,
  'https://www.figma.com/design/REPLACE_FILE_KEY/Shidoka-Applications?node-id=REPLACE_SIDENAV_NODE_ID',
  {
    props: {},
    example: () => <SideNav />,
  },
)
