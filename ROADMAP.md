# Svelte 5 Migration Roadmap (Revised)

This roadmap breaks the Svelte 5 implementation into concrete, verifiable tasks.

Assumptions reflected in this roadmap:

* The Svelte app uses **runes-based state in `.svelte.ts` modules** (no `svelte/store` stores).
* Persistence is abstracted behind `PersistenceBackend`.
* v1 is **guest-only** (localStorage). v2 adds auth + Firestore.
* The legacy single-file app remains a UX reference; Svelte’s types/contracts are canonical for the SPA.

Status markers (optional):

* `[ ]` not started
* `[~]` in progress
* `[x]` complete

---

## Phase 0 — Foundations

**Goal:** Establish the Svelte workspace, targets, and baseline checks.

* `[ ]` P0.1 Toolchain + targets

  * Vite + Svelte 5 configured.
  * Decide browser targets (and document them): if targeting older browsers, avoid **top-level `await`** in build output.
  * Add a note to `main.ts` pattern: any async probes happen inside an async function (or behind feature checks).

* `[ ]` P0.2 Repo coexistence plan

  * Keep legacy implementation intact (rename to `index.legacy.html` if/when needed).
  * Confirm which docs are “legacy reference” vs “Svelte canonical.”

* `[ ]` P0.3 Baseline behavior capture

  * Record keyboard shortcuts, dialog focus behavior, import/export flows, and category tree semantics.

**Exit criteria:** `pnpm test` + `pnpm build` succeed; targets are documented; legacy app remains accessible.

---

## Phase 1 — LCARS Shell & View Switching

**Goal:** Render the LCARS shell with three views and predictable focus.

* `[ ]` P1.1 LCARS primitives

  * Implement LCARS layout primitives in `src/lib/components/lcars/`.
  * Prefer snippet props / `{@render ...}` for composition.

* `[ ]` P1.2 Views skeletons

  * Create `BookmarksView`, `SettingsView`, `AboutView` with semantic landmarks.

* `[ ]` P1.3 View switching

  * View switching driven by app state (not a router).
  * On view switch, programmatically focus a predictable target (`<main tabindex="-1">` or the view heading).

**Exit criteria:** Shell matches LCARS layout; keyboard tab order across header/sidebar/main/footer is sane.

---

## Phase 2 — Rune-Style App State + v1 Persistence

**Goal:** Replace placeholder state with rune-style state modules and localStorage persistence.

### 2.1 Canonical types & contracts

* `[ ]` P2.1 Define canonical types

  * `src/lib/state/app/*` for app state types (`AppStateModel`, `State`, etc.).
  * `src/lib/state/theme/*` for theme types.
  * Keep domain types used by multiple areas stable and versionable.

* `[ ]` P2.2 Define storage keys + versions

  * Document `zander-svelte:v1` and `zander-svelte-theme:v1` (or your chosen keys).
  * Document export bundle version (`zander-v1`) and migration policy.

### 2.2 Persistence port + backend

* `[ ]` P2.3 `PersistenceBackend` port

  * `loadState`, `saveState`, `exportData`, `importData`.
  * Define `StorageError` shape and error codes that UI can branch on.

* `[ ]` P2.4 `LocalStorageBackend`

  * Read/validate JSON, normalize shapes, throw typed `StorageError`.

### 2.3 Rune-style app state module

* `[ ]` P2.5 Create `createAppState` in **`.svelte.ts`**

  * Holds `model = $state({ state, isReady, initError })`.
  * Exposes actions (navigation/categories/bookmarks/data) as functions.
  * Rule: **no `$state` usage in plain `.ts`** (only `.svelte.ts`).

* `[ ]` P2.6 Theme state module (no store)

  * Create `createThemeState` in **`.svelte.ts`**.
  * Apply theme via `document.documentElement.setAttribute('data-theme', id)`.
  * Persist theme id to localStorage.

* `[ ]` P2.7 Wire into `App.svelte`

  * `const app = createAppState(backend)` and pass down `app.model.state` etc.

### 2.4 Tests

* `[ ]` P2.8 Unit tests

  * App actions: same coverage as the old `stateStore` tests, but against `createAppState`.
  * Theme: verify storage + `data-theme` application.
  * Backends: verify error cases (unavailable storage, invalid JSON, version mismatch).

**Exit criteria:** App loads defaults, persists mutations, reloads correctly; tests cover core actions.

---

## Phase 3 — Dialogs, CRUD, Import/Export, Reset

**Goal:** All core flows work end-to-end with the new state modules.

* `[ ]` P3.1 Bookmark dialog

  * Add/edit modes, validation, focus trap + restore.

* `[ ]` P3.2 Category management UI

  * Add root/child, rename, move up/down among siblings, delete (cascade).

* `[ ]` P3.3 Confirm dialog

  * For destructive actions and import overwrite.

* `[ ]` P3.4 Import/export

  * Export `ExportBundle`.
  * Import validates and produces a clear summary (counts, discarded items).

* `[ ]` P3.5 Reset

  * Clears state keys, restores defaults, re-initializes model.

**Exit criteria:** All CRUD + import/export + reset flows match the legacy UX intent.

---

## Phase 4 — Keyboard Shortcuts, Focus, and A11y Parity

**Goal:** Meet or exceed `ACCESSIBILITY.md` requirements.

* `[ ]` P4.1 Global shortcuts

  * Implement `Alt+H`, `Alt+B`, `Alt+S`, `Alt+C`, `Esc`.
  * Must not trigger inside inputs/textarea/select/contenteditable.

* `[ ]` P4.2 Focus rules

  * Dialogs trap focus and restore.
  * View changes move focus predictably.

* `[ ]` P4.3 Screen reader audit

  * Ensure labels, dialog roles, and `aria-live` for status.

* `[ ]` P4.4 Automated checks

  * Add Playwright + axe (or equivalent) checks for key flows.

**Exit criteria:** A11y checklist passes; no keyboard traps; focus always visible.

---

## Phase 5 — Docs, Packaging, and Cutover

**Goal:** Documentation reflects the new rune-style architecture; release/build guidance is accurate.

* `[ ]` P5.1 Documentation refresh

  * Update `ARCHITECTURE.md` to describe `.svelte.ts` state modules and the no-store approach.
  * Update `AGENTS.md` to reflect current state patterns.
  * Update `README.md` to describe Svelte app usage vs legacy.

* `[ ]` P5.2 Cutover decision

  * Decide whether the repo ships:

    * (A) legacy by default + Svelte as opt-in
    * (B) Svelte by default + legacy preserved as `index.legacy.html`

**Exit criteria:** New contributors can build/run/test; docs match implementation.

---

## Phase 6 — Post-v1 Enhancements

* `[ ]` Better import error UX (actionable messages)
* `[ ]` Optional animations with `prefers-reduced-motion` support
* `[ ]` Theme preview improvements
* `[ ]` More integration tests for dialogs and keyboard shortcuts

---

## Phase 7 — v2 Auth + Firestore Persistence

**Goal:** Add sign-in and Firestore-backed persistence while preserving guest mode.

* `[ ]` P7.1 Define mode semantics (guest vs signed-in)
* `[ ]` P7.2 `AuthProvider` port + `FirebaseAuthProvider` implementation
* `[ ]` P7.3 `FirestoreBackend` implementing `PersistenceBackend`
* `[ ]` P7.4 Mode switch UI + backend swapping
* `[ ]` P7.5 v2 storage error UX (recover/diagnostics)
* `[ ]` P7.6 E2E tests (auth, persistence, mode switching)

---

## Phase 8 — v3+ Offline-first / Advanced Features (Reserved)

* `[ ]` Define offline strategy + conflict semantics
* `[ ]` Implement minimal offline support
* `[ ]` Add resync tests + failure modes
