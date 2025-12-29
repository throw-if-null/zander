# Zander (Svelte 5) Architecture

This document describes the architecture for the Svelte 5 implementation of Zander — the LCARS Bookmark System. It is the canonical reference for the Svelte SPA.

Legacy reference: the previous single-file implementation is preserved as `index.legacy.html` (not described here beyond reference links).

---

## Source of truth

The architecture is defined by these artifacts:

- **Types and data contracts:** `src/lib/state/model.ts` (or `src/lib/state/stateTypes.ts` if not yet renamed)
- **App state controller:** `src/lib/state/index.svelte.ts` (rune-based shared module)
- **Theme controller:** `src/lib/state/theme/index.svelte.ts` (rune-based shared module)
- **Persistence port:** `src/lib/persistence/PersistenceBackend.ts`
- **Persistence implementations:**
  - `src/lib/persistence/LocalStorageBackend.ts` (v1 guest mode)
  - `FirestoreBackend` (v2 user mode)
- **UI structure:** `src/App.svelte` and `src/lib/components/**`
- **Accessibility requirements:** `ACCESSIBILITY.md`
- **Visual/design primitives:** `DESIGN.md`
- **Behavioral contracts:** tests (Vitest + component tests) and Playwright (E2E)

Specs:
- **Authoritative specs:** `spec/` (YAML/Markdown requirements + scenarios)
- Any `src/spec` or other `spec/` folders are considered **legacy/internal notes** unless explicitly migrated into `spec/`.

---

## Goals

- Provide a maintainable Svelte 5 SPA that replicates LCARS look-and-feel and core flows.
- Use Svelte 5 idioms (runes) and TypeScript for state/domain logic.
- Keep persistence behind a stable port (`PersistenceBackend`) supporting:
  - **Guest mode** (localStorage)
  - **User mode** (Firestore)
- Maintain keyboard-first interactions and meet WCAG 2.1 AA where practical.

Non-goals:
- A router-based multi-page architecture (the app is a view-switching SPA).
- Extracting LCARS primitives into a standalone package before v1 is complete.

---

## Project layout

Entry points:
- `index.html` — SPA entry (boots `src/main.ts`)
- `src/main.ts` — mounts `src/App.svelte` (avoid top-level `await` to preserve older browser targets)
- `src/App.svelte` — root LCARS shell and view switcher

UI composition:
- `src/lib/components/lcars/` — LCARS layout primitives (header/sidebar/footer/status)
- `src/lib/components/views/` — view-level components:
  - `BookmarksView.svelte`
  - `SettingsView.svelte`
  - `AboutView.svelte`
- `src/lib/components/dialogs/` — modal dialogs:
  - `BookmarkDialog.svelte`
  - `ConfirmDialog.svelte`
  - (Color picker dialog if present)

State and domain (no `svelte/store`):
- `src/lib/state/` — domain model, selectors, and rune-based shared state modules
  - `index.svelte.ts` — app state controller (uses runes; must be `.svelte.ts`)
  - `index.ts` — plain TypeScript barrel re-export surface (no runes)
  - `app/` — app-state modules: persistence queue + mutation actions
  - `theme/` — theme controller module(s)
  - `domain/` — pure domain functions (no side effects; unit-testable)
  - `selectors/` — pure derived reads (selectors; no side effects)
  - `model.ts` (or `stateTypes.ts`) — canonical domain types
  - `defaults.ts` (or `stateDefaults.ts`) — default state factory

Persistence:
- `src/lib/persistence/` — persistence port + backends
  - Port: `PersistenceBackend.ts`
  - v1 backend: `LocalStorageBackend.ts`
  - v2 backend: `FirestoreBackend.ts`

Auth and telemetry:
- `src/lib/auth/` — authentication abstractions/implementations (Firestore Auth or Logto)
- `src/lib/telemetry/` — optional telemetry (no-op by default unless enabled)

---

## Data model

Canonical types are defined in `src/lib/state/model.ts` (or `stateTypes.ts`). Architectural invariants:

- **Category is a tree**
  - `Category.children: Category[]` is the canonical representation.
  - Category identity is stable via `Category.id`.
- **Bookmarks belong to a category**
  - `Bookmark.categoryId: string` is required.
  - Root selection is represented by `State.currentCategoryId = null` (not nullable bookmark categories).
- **Creation timestamps are immutable**
  - `Bookmark.createdAt` and `Category.createdAt` are creation timestamps and should not be modified during edits.

State-driven navigation:
- `State.currentView` controls which view is active (`"bookmarks" | "settings" | "about"`).
- `State.currentSettingsPage` controls the active settings sub-page.
- `State.landingCategoryId` represents the user’s configured “home” category (used when the app goes “Home”).

---

## State management (rune-based shared modules)

Zander does not use `svelte/store` (`writable`, `derived`, `$store`) for app state.

Instead, app state and theme state are managed via Svelte 5 shared modules (`.svelte.ts`) using runes:

- `$state` for shared mutable reactive state
- `$derived` for derived values (if/when needed)
- `$effect` for side effects when appropriate

### Rune module boundary rules

- Any file that uses runes must be a `.svelte.ts` (or `.svelte.js`) module.
- Plain `.ts` modules must not call runes.
- To avoid accidental `rune_outside_svelte` at runtime, Zander uses a two-file entrypoint pattern:
  - `src/lib/state/index.svelte.ts` contains the rune-based implementation
  - `src/lib/state/index.ts` re-exports from `.svelte.ts` and exports types (no runes)

This keeps imports stable (`$lib/state`) while ensuring rune usage is always inside Svelte-compiled modules.

---

## Application flow

### Startup
1. `main.ts` mounts `App.svelte`.
2. `App.svelte` creates controllers:
   - `createAppState(backend)` from `$lib/state`
   - `createThemeState(storage?)` from `$lib/state`
3. `App.svelte` calls:
   - `app.loadInitialState()` to load persisted app state
   - `theme.loadInitialTheme()` to apply persisted theme + set `data-theme`
4. UI renders based on `app.model.state` and other controller state.

### Mutations and persistence
- All mutations go through controller APIs (not direct component writes).
- Mutations persist via `PersistenceBackend.saveState(state)` as full-state snapshots.
- Writes are serialized through a single `persistAndSet` queue to prevent lost updates when multiple async mutations occur.

### View switching (no router)
- Header “Home” and footer buttons update app state (`currentView`, etc.).
- Keyboard shortcuts provide fast navigation between views and dialogs.
- When switching views, focus is moved to a predictable target (e.g., `<main tabindex="-1">`) to keep keyboard users oriented.

---

## Persistence port

Persistence is abstracted behind `src/lib/persistence/PersistenceBackend.ts`:

```ts
export interface PersistenceBackend {
  loadState(): Promise<State | null>;
  saveState(state: State): Promise<void>;
  exportData(): Promise<ExportBundle>;
  importData(bundle: ExportBundle): Pro
