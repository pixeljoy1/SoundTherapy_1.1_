/**
 * Code Connect mapping: LoginForm ↔ Shidoka Applications Figma library — Sign In Form.
 *
 * If the Shidoka Figma library does not ship a canonical "Sign in form" pattern,
 * point this URL at your team's composition frame that assembles the individual
 * kyn-* components. The mapping still gives the Figma MCP a canonical instance
 * to place, and the child kyn-text-input / kyn-button / kyn-checkbox mappings
 * (which the Shidoka library provides out of the box) fill in the pieces.
 */
import figma from '@figma/code-connect'
import { LoginForm } from './LoginForm'

figma.connect(
  LoginForm,
  'https://www.figma.com/design/REPLACE_FILE_KEY/Shidoka-Applications?node-id=REPLACE_LOGINFORM_NODE_ID',
  {
    props: {},
    example: () => <LoginForm />,
  },
)
