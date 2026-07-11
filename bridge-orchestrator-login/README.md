# Bridge Orchestrator — Login

A minimal React + Vite app that composes the sign-in surface for **Bridge Orchestrator** out of real [Shidoka Design System](https://github.com/Kyndryl-Design-System) web components. It is deliberately scaffolded so a `use_figma` push resolves each region to its Shidoka Figma library counterpart, rather than redrawing everything as bespoke frames.

## Why this is different from a "Shidoka-looking" app

Previous attempts styled bespoke `<div>`s to _look like_ Shidoka. Figma has no way to know a rounded div is meant to become `Kyn / Button / Primary`, so it recreates the div verbatim. Here, every visible control is a real `kyn-*` custom element, and each composite component has a `.figma.tsx` mapping. That gives the Figma MCP the two things it needs:

1. **The right semantic tag in the DOM** — `<kyn-button>`, not `<button class="btn">`.
2. **A Code Connect mapping** — "this JSX component ↔ that node in the Shidoka Applications Figma library."

## Getting started

```bash
npm install
npm run dev        # http://localhost:4200
npm run typecheck
npm run build
```

## Making the Figma push actually land on Shidoka components

Do these once, per Figma file you plan to push into.

### 1. Confirm the Shidoka libraries are enabled in the target file

_Linked ≠ enabled._ In the target Figma file: **Assets → Libraries → toggle ON**:

- **Shidoka Foundation** (tokens, colors, type)
- **Shidoka Applications** (Header, Side Nav, Footer, Buttons, Inputs, etc.)
- **Shidoka Icons**

You can verify from code via the Figma MCP:

```
mcp__Figma__get_libraries({ fileKey: "<target file key>" })
```

If Shidoka isn't in the enabled list, the MCP will still fall back to primitive frames — enable, then retry.

### 2. Fill in the Figma node URLs in `*.figma.tsx`

Each `src/components/*.figma.tsx` file has a placeholder URL:

```ts
'https://www.figma.com/design/REPLACE_FILE_KEY/Shidoka-Applications?node-id=REPLACE_HEADER_NODE_ID'
```

Replace it with the real Figma URL for the corresponding component in the Shidoka Applications library:

1. Open the Shidoka Applications Figma library file.
2. Select the component (e.g. `Header`).
3. Right-click → **Copy link to selection**.
4. Paste it into the matching `.figma.tsx` file.

The Shidoka library already publishes Code Connect mappings for the primitives (`kyn-button`, `kyn-text-input`, `kyn-checkbox`, `kyn-link`) via its own npm packages — you only need to map the **composite** components you own here (`AppHeader`, `SideNav`, `AppFooter`, `LoginForm`).

### 3. Publish the Code Connect mappings to Figma

```bash
# One-time login
npx figma connect login

# Validate the mappings
npx figma connect

# Push the mappings to Figma
npm run figma:publish
```

After this, the Figma MCP `use_figma` tool will place real library instances instead of drawing rectangles.

### 4. Push the app into Figma

From this repo, in a Claude Code session with the Figma MCP loaded:

```
/figma-generate-design
```

...and reference this project. The MCP will:

- Read the DOM → see real `kyn-*` tags.
- Look up each tag in the Code Connect map → resolve to the Shidoka Figma library node.
- Instantiate the library component at the mapped node URL, using your Foundry variables.

That is the "pixel perfect" transfer.

## Project layout

```
bridge-orchestrator-login/
├── figma.config.json               # Code Connect config
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx                    # Loads Shidoka Foundation tokens + registers custom elements
    ├── index.css                   # Layout scaffolding only — visuals come from Shidoka tokens
    ├── shidoka.d.ts                # Ambient JSX types for the kyn-* elements
    ├── components/
    │   ├── AppHeader.tsx           ├── AppHeader.figma.tsx
    │   ├── SideNav.tsx             ├── SideNav.figma.tsx
    │   ├── AppFooter.tsx           ├── AppFooter.figma.tsx
    │   └── LoginForm.tsx           └── LoginForm.figma.tsx
    └── pages/
        └── LoginPage.tsx
```

## The pixel-perfect checklist (short version)

- [ ] Shidoka packages installed (`npm install`).
- [ ] `main.tsx` imports Foundation CSS **before** any component renders.
- [ ] Every visible control uses a `kyn-*` element (no styled divs).
- [ ] Shidoka Foundation + Applications libraries are **enabled** in the target Figma file.
- [ ] Every composite in `src/components/` has a matching `.figma.tsx` with a real node URL.
- [ ] `npm run figma:publish` has been run at least once against the target Figma file.
- [ ] `mcp__Figma__get_libraries` on the target file lists Shidoka.

Miss any of these and Figma will silently downgrade to primitive frames — that's the failure mode the previous project was hitting.
