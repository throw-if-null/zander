# UI → CSS Map (Implementation Reference)

This file maps **UI concepts** (from `GLOSSARY.md`) to **current CSS classes / DOM structure**.
It exists to help refactors and keep styling changes organized.

This is **not** the authoritative source of behavior or architecture:
- Domain contracts live in `src/lib/stores/stateTypes.ts`
- Behavior is asserted by tests and `ACCESSIBILITY.md`
- Visual intent/LCARS primitives are described in `DESIGN.md`

Update this file whenever you rename classes, restructure markup, or extract the LCARS primitives.

---

## 1. LCARS shell (Frame)

**Concept:** LCARS shell / frame wrapping the app.

**Primary container**
- `.lcars-app` (expected root shell container; may be applied by `LcarsApp.svelte`)

**Regions**
- Header bar: `.lcars-header-bar`
- Sidebar bar: `.lcars-sidebar-bar`
- Footer bar: `.lcars-footer-bar`

If the shell uses a main content container, prefer:
- `main` element with `id="main"` and `tabindex="-1"` (see `ACCESSIBILITY.md`)

---

## 2. Header bar (LcarsHeaderBar.svelte)

**Concept:** Header bar + Home control.

Classes used by the primitive:
- `.lcars-header-bar` — header container
- `.lcars-header-bar-home` — clickable home control (either `<button>` or `<a>`)
- `.lcars-header-bar-fill` — decorative fill segment
- `.lcars-header-bar-endcap` — decorative end cap

A11y notes:
- Home control is a `<button>` unless a real navigation href is intended.
- Focus styling should be driven by `:focus-visible` patterns from `DESIGN.md` / `ACCESSIBILITY.md`.

---

## 3. Sidebar bar (LcarsSidebarBar.svelte)

**Concept:** Sidebar / category strip.

Classes used by the primitive:
- `.lcars-sidebar-bar` — sidebar container (`<aside>`)
- `.lcars-sidebar-bar-top-cap`
- `.lcars-sidebar-bar-track` — content slot container (where category controls render)
- `.lcars-sidebar-bar-bottom-cap`

Category UI (app-level, not part of the primitive; names here are conventions to keep consistent):
- `.lcars-sidebar-item` — wrapper row for one category entry
- `.lcars-sidebar-btn` — the category button/control
- `.lcars-sidebar-submenu` — nested container for child categories

State styling conventions:
- `.active` (or a more explicit `.is-active`) for selected category
- `.is-disabled` for disabled controls
- Prefer `data-*` attributes for variants when state combinations grow

---

## 4. Footer bar (LcarsFooterBar.svelte)

**Concept:** Footer bar with global actions and status area.

Classes used by the primitive:
- `.lcars-footer-bar` — footer container
- `.lcars-footer-bar-primary-actions` — slot container for primary actions
- `.lcars-footer-bar-status` — slot container for status display

App-level button conventions (if present in markup):
- `.lcars-footer-bar-button` — footer button
- `.is-active` for the active view button (if indicated)

---

## 5. Status display (LcarsStatusDisplay.svelte)

**Concept:** Status readout (counts, stardate, etc.).

Suggested conventions (adjust to match actual markup):
- `.lcars-status-display` — root status block
- `.lcars-status-label` — label text (e.g., STATUS)
- `.lcars-status-values` — container for values
- `.lcars-status-item` — one label/value pair

If using live announcements:
- `#status` or `[data-a11y="status-live"]` for the `aria-live` region (see `ACCESSIBILITY.md`)

---

## 6. Views

**Concept:** Bookmarks / Settings / About views.

Preferred conventions (align these with `App.svelte` / view components):
- `.main-content` — container for view region (or use `<main>`)
- `.main-view` — base class for a view root
- `.is-active` — active view marker (or use `hidden` + ARIA-friendly patterns)

View-specific roots (recommended):
- `.bookmarks-view`
- `.settings-view`
- `.about-view`

---

## 7. Dialogs

**Concept:** Bookmark dialog, confirm dialog, color picker dialog.

Preferred conventions (adjust to match actual components):
- `.lcars-dialog-container` — outer dialog container
- `.lcars-dialog` — inner panel
- `.lcars-dialog-title` — title element
- `.lcars-dialog-actions` — buttons row
- `.lcars-dialog-primary` — primary action button
- `.lcars-dialog-secondary` — cancel/secondary button

A11y hooks (recommended):
- `[data-dialog="bookmark"]`, `[data-dialog="confirm"]`, etc. for stable selectors in tests
- A focus target element (or first invalid input) for initial focus

---

## 8. Bookmark grid and tiles

**Concept:** Bookmark grid and bookmark tile.

Conventions to keep stable (adjust to match current markup):
- `.bookmark-grid` — grid container
- `.bookmark-tile` — tile root
- `.bookmark-title` — title text
- `.bookmark-description` — optional description snippet
- `.bookmark-url` — URL display region
- `.bookmark-actions` — edit/open action region

If there are icon-only controls:
- `.bookmark-action-open`
- `.bookmark-action-edit`
- `.bookmark-action-delete` (if present)

A11y notes:
- If the entire tile is clickable, ensure nested buttons/links do not create conflicting interactive semantics.
- Prefer explicit buttons for edit/delete with `aria-label`.

---

## 9. Settings UI (Category configuration)

**Concept:** Category configuration list/editor.

Conventions (adjust to match actual markup):
- `.category-config-list`
- `.category-config-row`
- `.category-name-input`
- `.category-color-button`
- `.category-move-up`
- `.category-move-down`
- `.category-add-child`
- `.category-delete`

---

## 10. Themes and palette

If theme is expressed as a data attribute (recommended):
- `body[data-theme="…"]` or `.theme--<id>`

Palette variables (recommended):
- `--lcars-*` CSS custom properties
- `--category-color` applied at category/tile scope where helpful

---

## 11. Testing selectors

Where stable selectors help:
- Prefer `data-testid="..."` for tests rather than relying on styling classes.
- Prefer `data-*` attributes for state/variant flags over adding more CSS classes.

Recommended test selectors:
- `[data-testid="home-control"]`
- `[data-testid="category-button:<id>"]`
- `[data-testid="bookmark-tile:<id>"]`
- `[data-testid="dialog:bookmark"]`, `[data-testid="dialog:confirm"]`
