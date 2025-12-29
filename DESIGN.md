DESIGN — Zander (Svelte 5)

This document is the design reference for the Svelte 5 implementation of Zander: the LCARS‑style bookmark manager. It describes visual tokens, UI primitives, component mappings (to `src/lib/components/*`), interaction patterns, accessibility rules, and theming guidance for implementers and contributors.

This document purposefully describes primitives and composition rather than prescribing exact DOM shapes — the Svelte components in `src/lib/components/` provide the canonical implementation.

**Scope**

- Audience: frontend implementers, designers, and accessibility reviewers working on the Svelte 5 app.
- Goal: document the LCARS visual system as used by the Svelte app, mapping design primitives to Svelte components and describing keyboard‑first and accessible interaction patterns.
- Out of scope: legacy single‑file implementation details, right‑click/context menu behaviors, platform‑specific packaging.

**LCARS Shell Layout**

The app follows an LCARS shell composed of header, sidebar, main content area (views), status/display strip, and footer.

High level regions (logical, not prescriptive markup):

- Header: persistent top area used for the app title, primary navigation shortcuts, and global actions.
- Sidebar: left rail containing Category navigation and the primary view selector for Bookmarks / Settings / About.
- Main content: view container rendering one of the Views (BookmarksView, SettingsView, AboutView).
- Status display: compact readout for stardate, item counts, and transient status messages.
- Footer: global footer bar for quick actions and brand/attribution.

Svelte component mappings:

- Root shell: `src/lib/components/lcars/LcarsApp.svelte` (hosts routing / view switcher).
- Header: `src/lib/components/lcars/LcarsHeaderBar.svelte`.
- Sidebar: `src/lib/components/lcars/LcarsSidebarBar.svelte`.
- Status: `src/lib/components/lcars/LcarsStatusDisplay.svelte`.
- Footer: `src/lib/components/lcars/LcarsFooterBar.svelte`.

The Views live under `src/lib/components/views/`:

- `BookmarksView.svelte` — default landing view showing Category list and Bookmark grid.
- `SettingsView.svelte` — theme and persistence settings.
- `AboutView.svelte` — app credits and export/import / reset affordances.

Dialog components live under `src/lib/components/dialogs/`:

- `BookmarkDialog.svelte` — add/edit Bookmark and Category picker.
- `ConfirmDialog.svelte` — generic confirmation modal.
- Other dialogs (color pickers, import/export) follow the same dialog patterns.

**Color & Typography**

Tokens (semantic):

- Color roles (examples; exact tokens live in the CSS system):
  - `--lcars-bg`: app background (deep, slightly warm black).
  - `--lcars-panel`: primary surface for tiles and panels.
  - `--lcars-accent-primary`: primary LCARS accent (warm orange / neon coral).
  - `--lcars-accent-secondary`: secondary accent (teal / cyan variations).
  - `--lcars-meta`: muted text and borders.
  - `--lcars-focus-glow`: neon glow used for `:focus-visible`.

- Typography roles:
  - `--font-sans`: UI body face (system stack recommended).
  - `--type-display`: header / logo size.
  - `--type-heading`: view headings and section labels.
  - `--type-body`: body and list text.

Design guidance:

- Favor high contrast between text and background for readability (WCAG AA). Accent colors are used for affordances and status, not for body copy.
- Use the LCARS color accents to convey interactive controls (buttons, active categories, selected bookmarks) but avoid using color alone to communicate state.

Illustrative markup snippet (non‑canonical):

<header class="lcars-header">
  <div class="logo">ZANDER</div>
  <nav class="header-actions" aria-label="Global actions">...</nav>
</header>

**Focus & Interaction**

Accessibility rules (must be followed across components):

- Keyboard‑first: all UI controls must be operable via keyboard. Provide meaningful `:focus-visible` styles.
- Focus indicator: use a neon glow focus ring implemented with `:focus-visible` (CSS outline, box‑shadow or filter). Do not use white focus bars anywhere in the UI.
- Dialogs must trap focus while open and restore focus to the triggering element when closed.
- Avoid mouse‑only affordances. Any control reachable only by mouse is a bug.
- Provide skip links or logical tab order for keyboard users in complex views.

Focus guidance (implementation notes):

- Use `:focus-visible` only; do not override `:focus` for keyboard focus. This prevents focus styles when interacting by mouse.
- The focus glow should be visible on high‑contrast backgrounds and not be clipped by overflow. Add sufficient focus padding within compact controls.
- Interactive tiles (e.g., Bookmark tiles) must be focusable elements (`button`, `a`, or role with tabindex) and expose keyboard activation (Enter/Space semantics).

Keyboard shortcuts and navigation:

- Preserve keyboard shortcuts described in the app's docs (Alt+B, Alt+S, Alt+H, Alt+C, Esc, Enter) where possible; ensure they do not conflict with browser/system accessibility keys.
- Shortcuts should be documented in Settings and be discoverable via the UI.

**Primitives Catalog**

This section describes the reusable visual primitives used by the Svelte components. Each primitive should be implemented as a small Svelte component or CSS utility so views can compose them.

- LcarsPanel
  - Purpose: rectangular content surface with LCARS curved corner treatment.
  - Role: structural container for lists, forms, and content blocks.
  - States: `default`, `active`, `muted`.

- LcarsButton
  - Purpose: primary interactive control styled with LCARS accent shapes.
  - Implementation: use `<button>` with accessible aria attributes.
  - Variants: `primary`, `secondary`, `ghost`.

- LcarsNavItem
  - Purpose: sidebar or header navigation item representing a view or Category.
  - States: `idle`, `hover`, `focused`, `selected`.

- LcarsTile (Bookmark tile)
  - Purpose: displays Bookmark title, optional favicon, and quick actions.
  - Interaction: tile itself should be focusable and support activation via Enter/Space. Quick actions inside tile (edit, delete, open) must be keyboard reachable.

- LcarsBadge
  - Purpose: small status indicator used for counts and tags.

- LcarsDialog
  - Purpose: modal dialog wrapper providing overlay, focus trap, accessible role and heading.
  - Responsibilities: trap focus, label by heading, provide `aria-modal`, close on Esc, restore focus to trigger.

- LcarsFormField
  - Purpose: label + input pairing with validation messaging and accessible `aria-describedby`.

- LcarsSidebar (Category tree)
  - Purpose: tree or nested list representing Categories.
  - Interaction: each Category item is focusable; arrow keys can move focus within the tree; Enter expands/collapses or selects depending on pattern.

Implementation note: primitives should not include complex domain logic. Keep them presentation + small interaction only; higher‑level stores and views orchestrate behavior.

**View Composition**

Bookmarks View (`BookmarksView.svelte`):

- Layout: split area with the Category sidebar to the left and Bookmark grid to the right (responsive: sidebar collapses on small screens).
- Sidebar: rendered with `LcarsSidebar` primitive; shows nested Categories and an `ADD ENTRY` control (label must read exactly `ADD ENTRY`).
- Bookmark grid: uses `LcarsTile` for each Bookmark. Provide filtering by selected Category subtree.
- Empty state: encourage positive affordances — a short instructional message plus `ADD ENTRY` call to action.

Settings View (`SettingsView.svelte`):

- Sections: Theme selection, Persistence backend (local only in v1), Keyboard shortcuts help, Export/Import, Reset.
- Theme selection: visual swatches implemented with accessible buttons; current theme indicated with a check and focus ring.

About View (`AboutView.svelte`):

- Static content: app description, credits, privacy notes, and links for export/import guidance.

Composition notes:

- Views assemble primitives rather than duplicating styling.
- All state mutations (add/edit/delete Bookmark/Category) are implemented via stores under `src/lib/state/` and invoked by view actions; primitives are passive.

**Dialog Patterns**

Dialog goals: focused, clear actions and full keyboard operability.

Universal dialog rules:

- Use `LcarsDialog` wrapper component for all modal flows.
- Dialogs must set `role="dialog"` and `aria-labelledby`/`aria-describedby` as appropriate.
- Focus management:
  - On open: focus the first meaningful control (usually the first form field or primary button).
  - Trap focus inside the dialog until it is closed.
  - On close: return focus to the element that opened the dialog.
- Keyboard:
  - `Esc` closes the dialog.
  - `Enter` triggers the primary action when focus is in a form control, unless the control is a multi‑line text area.

Bookmark Dialog (`BookmarkDialog.svelte`):

- Purpose: add/edit a Bookmark; also used to create or pick a Category.
- Fields: `Title`, `URL`, `Category` picker, `Color` (optional), `Notes` (optional).
- Validation: inline validation on blur and on submit, with accessible error messages and `aria-invalid` where applicable.
- Primary action label: `Save` for edits, `Add` for new items (but the global UI uses `ADD ENTRY` for the high‑level CTA).

Confirm Dialog (`ConfirmDialog.svelte`):

- Purpose: confirm destructive actions (delete Bookmark, delete Category with cascade, reset system).
- Pattern: brief explanation, primary destructive action button (e.g. `Delete`) and a secondary `Cancel` button.
- Extra caution: when deleting Categories with child Bookmarks, show an explicit count and consequences.

Non‑modal toasts / status messages:

- Short status messages should be rendered in the `LcarsStatusDisplay` area (not as floating toasts unless necessary).
- Keep voice concise; always include visible confirmation of success or error.

**Theming**

Theme primitives and tokens:

- Themes are collections of token values (colors and minor layout tweaks). Each theme must provide values for the core color roles and be contrast‑checked.
- Theme identifiers live in the theme store (`src/lib/state/themeStore.ts`). Theme switcher UI lives in Settings.

Applying themes:

- Themes are applied by setting attributes on the `html` or `body` element (e.g. `data-theme="classic"`) so tokens cascade to all components.
- Avoid inline hardcoded colors inside components; prefer CSS variables to make theme swapping robust.

Accessibility & theme contrast:

- Each theme must be validated to meet at least WCAG AA for body text and large text where appropriate.
- Provide a high‑contrast theme option for users who need it.

Versioning & design drift

- The Svelte app's implementation is canonical for the Svelte project. If a design token or primitive changes, update this document and the CSS tokens together.
- Avoid importing legacy behavior from the single‑file index.html; use it only as a UX reference when necessary.

Appendix: implementation pointers

- Prefer small, well‑named CSS variables for every semantic role.
- Keep components small and focused: primitives handle presentation; views handle orchestration; stores hold domain logic.
- Tests: add visual/touch tests (Vitest + Playwright) for keyboard navigation, dialog focus trapping, theme application, and color contrast checks.

Files (Svelte mapping):

- `src/lib/components/lcars/LcarsApp.svelte`
- `src/lib/components/lcars/LcarsHeaderBar.svelte`
- `src/lib/components/lcars/LcarsSidebarBar.svelte`
- `src/lib/components/lcars/LcarsStatusDisplay.svelte`
- `src/lib/components/lcars/LcarsFooterBar.svelte`
- `src/lib/components/views/BookmarksView.svelte`
- `src/lib/components/views/SettingsView.svelte`
- `src/lib/components/views/AboutView.svelte`
- `src/lib/components/dialogs/BookmarkDialog.svelte`
- `src/lib/components/dialogs/ConfirmDialog.svelte`

If you want, I can also add a small example CSS token file or a brief visual spec for the primary theme next. Please let me know which next step you'd like.