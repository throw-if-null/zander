# Zander (Svelte 5) Architecture

This document describes the architecture for the Svelte 5 implementation of Zander — the LCARS Bookmark System. It is the canonical reference for the Svelte SPA.

Legacy reference: the previous single-file implementation is preserved as `index.legacy.html` (not described here beyond reference links).

---

## Source of truth

The architecture is defined by these artifacts:

- **Types and data contracts:** `src/lib/stores/stateTypes.ts`
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
- `src/main.ts` — mounts `src/App.svelte`
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

State and domain:
- `src/lib/stores/` — state store, selectors, defaults, theme store
- Canonical types: `src/lib/stores/stateTypes.ts`

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

Canonical types are defined in `src/lib/stores/stateTypes.ts`. Architectural invariants:

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

## Application flow

### Startup
1. App mounts `App.svelte`.
2. App initializes stores.
3. Store loads persisted state via `PersistenceBackend.loadState()`.
4. Store validates and normalizes loaded state (e.g., required fields present, ids refer to existing categories).
5. UI renders based on store state (current view, current category, etc.).

### Mutations and persistence
- All mutations go through store APIs (not direct component writes).
- Store triggers persistence via `PersistenceBackend.saveState(state)`.
- Persistence is written as full-state snapshots (implementation may debounce).

### View switching (no router)
- Header “Home” and footer buttons update store state (`currentView`, etc.).
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
  importData(bundle: ExportBundle): Promise<void>;
}
