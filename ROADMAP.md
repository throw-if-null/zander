# Svelte 5 Migration Roadmap

This roadmap breaks the Svelte 5 implementation into concrete, verifiable tasks. It is organized into phases that mirror the System Agent’s responsibilities in `AGENTS.md`. Each task should preserve LCARS visuals and accessibility behavior as described in the legacy single-file implementation, while following the Svelte-specific data contracts defined in the “Svelte 5 Architecture” section of `ARCHITECTURE.md`.

Status markers are suggestions; keep this file up to date as work progresses.

- `[ ]` not started
- `[~]` in progress
- `[x]` complete

Phases 0–6 deliver **Svelte v1 (guest-only, localStorage-backed)**.

- Phase 7 delivers **Svelte v2 (guest + signed-in with Firestore)**.
- Phase 8 reserves space for **v3+ (offline-first / advanced features)**.

---

## Phase 0 – Foundations & Planning

**Goal:** Confirm scope, keep the legacy app intact, and set up the Svelte workspace without changing runtime behavior.

- `[ ]` P0.1 Confirm Svelte toolchain and project layout
  - Decide on bundler (e.g., Vite + `@sveltejs/vite-plugin-svelte`).
  - Ensure build can output a static bundle (HTML + JS + CSS) that works without a server.
- `[ ]` P0.2 Initialize Svelte 5 project in repo
  - Create `src/` structure as described in `AGENTS.md`.
  - Add minimal `App.svelte` that renders a placeholder LCARS frame.
- `[ ]` P0.3 Capture legacy behavioral baseline
  - Document key flows directly from `index.html` (screenshots, notes).
  - Verify keyboard shortcuts, dialogs, and import/export behavior.
- `[ ]` P0.4 Align documentation
  - Update `ARCHITECTURE.md` with a short “Svelte 5 Overview” section (entry point, store plan).
  - Ensure `AGENTS.md` and `AGENTS.single-file.md` accurately describe both implementations.

---

## Phase 1 – LCARS Shell & Layout in Svelte

**Goal:** Recreate the LCARS shell and view containers in Svelte using the existing CSS primitives, without moving any business logic yet.

- `[ ]` P1.1 Extract LCARS primitive components
  - Create `src/lib/components/lcars/LcarsApp.svelte` wrapping the `.lcars-app` grid.
  - Create `LcarsHeaderBar.svelte`, `LcarsSidebarBar.svelte`, `LcarsFooterBar.svelte`, `LcarsStatusDisplay.svelte`, and any other primitives mapped in `DESIGN.md` section 10.6.
- `[ ]` P1.2 Implement view containers
  - Create `BookmarksView.svelte`, `SettingsView.svelte`, `AboutView.svelte` with static markup mirroring `index.html`.
  - Ensure correct DOM hierarchy (`<main>`, `<aside>`, `<section>`) and IDs/classes for CSS reuse.
- `[ ]` P1.3 Wire basic view switching
  - Implement simple Svelte state (local `currentView`) to toggle between views.
  - Hook footer buttons and header home control to update `currentView`.
- `[ ]` P1.4 Validate accessibility shell
  - Confirm heading levels, landmark roles, and focus order across the three views.
  - Ensure keyboard navigation between footer buttons and views matches the legacy app.

**Exit criteria:** Svelte app shows LCARS frame with three static views that can be switched via buttons, visually matching `index.html` but using placeholder data.

---

## Phase 2 – State Model, Data Contracts & Persistence Stores

**Goal:** Define Svelte-specific data contracts and core state management in Svelte stores, backed by localStorage for v1 via a persistence port.

- `[ ]` P2.1 Define Svelte v1 data contracts
  - Define `Bookmark`, `Category`, `State`, and `ExportBundle` for the Svelte app in a new “Svelte 5 Architecture” section of `ARCHITECTURE.md`.
  - Decide Svelte v1 storage key names (e.g. `zander-svelte:v1`, `zander-svelte-theme:v1`) and a simple versioning strategy.

- `[ ]` P2.2 Define `PersistenceBackend` interface
  - Add a TypeScript interface that abstracts persistence operations:
    - `loadState`, `saveState`, `exportData`, `importData` (and optionally `subscribe`).
  - Document the interface in `ARCHITECTURE.md` and (optionally) a `spec/` contract.

- `[ ]` P2.3 Implement `LocalStorageBackend`
  - Implement `LocalStorageBackend` as the v1 persistence backend, conforming to `PersistenceBackend`.
  - Ensure it uses the Svelte v1 storage keys and data contracts defined in P2.1.

- `[ ]` P2.4 Implement `stateStore` for bookmarks, categories, and view state
  - Create `src/lib/stores/stateStore.ts` exposing a store for `State`.
  - Implement helper methods equivalent to legacy functions:
    - `loadState`, `saveState`, `addCategory`, `moveCategory`, `deleteCategory`,
      `addBookmark`, `updateBookmark`, `deleteBookmark`, `getCategoryPath`, etc.
  - Have the store depend only on the `PersistenceBackend` interface, not directly on `localStorage`.

- `[ ]` P2.5 Implement theme store
  - Create `src/lib/stores/themeStore.ts` managing `currentTheme` and the Svelte theme list.
  - Persist theme selection via `localStorage` (separate key from bookmark data).
  - Mirror legacy behavior of applying theme via a `data-theme` attribute on `<body>`.

- `[ ]` P2.6 Wire stores into `App.svelte` and views
  - Replace local placeholder state with subscriptions to `stateStore` and `themeStore`.
  - Ensure view switching state (`currentView`, `currentSettingsPage`, `currentCategory`) is modeled in Svelte stores and reflected in persistence.

- `[ ]` P2.7 Validate v1 data contract & persistence
  - Smoke-test that the Svelte app can:
    - Initialize from an empty store (defaults).
    - Persist changes and reload into the same state.
  - Confirm that storage keys and JSON shape are documented in `ARCHITECTURE.md`.
  - Add unit tests for `PersistenceBackend` and `LocalStorageBackend`.

**Exit criteria:** Svelte app can load and persist real bookmark/category/theme data using the Svelte v1 storage schema through the `PersistenceBackend` interface.

---

## Phase 3 – Interactions, Dialogs & Data Flows

**Goal:** Move all interactive flows (dialogs, import/export, reset, category editing) into Svelte components while maintaining parity with the single-file app.

- `[ ]` P3.1 Implement bookmark dialog behavior
  - Create `BookmarkDialog.svelte` with add/edit modes and form validation.
  - Wire to `stateStore` for creating and updating bookmarks.
  - Preserve stardate display (`calculateStardate`, `parseStardate`) and Earth date tooltip.
- `[ ]` P3.2 Implement category configuration tools
  - Create components for category config rows (name, color, move up/down, add child, delete).
  - Wire to `stateStore` helpers for tree mutations (`addCategory`, `moveCategory`, `deleteCategory`).
  - Ensure cascading delete semantics match legacy behavior.
- `[ ]` P3.3 Implement color picker dialog
  - Create `ColorPickerDialog.svelte` using LCARS palette and focus rules from `DESIGN.md`.
  - Integrate with category config and any places category color can be changed.
- `[ ]` P3.4 Implement confirm/alert dialog
  - Create `ConfirmDialog.svelte` capable of confirm and alert modes.
  - Use it for delete category, reset system, and import overwrite confirmation.
- `[ ]` P3.5 Implement import/export flows
  - Recreate export and import behavior in Svelte using the Svelte v1 `ExportBundle` shape.
  - Validate imported data, normalize category colors, and run backfill for `createdAt` fields as needed.
  - Show import summary (counts, discarded items, normalized colors).
- `[ ]` P3.6 Implement system reset
  - Provide a `resetSystem()` action that clears storage keys, restores defaults, and reinitializes stores.

**Exit criteria:** All core user flows (add/edit/delete bookmarks, manage categories, change colors, import/export, reset) work end-to-end in Svelte and match the legacy UX.

---

## Phase 4 – Keyboard Shortcuts, Focus & A11y Parity

**Goal:** Ensure the Svelte implementation meets or exceeds the accessibility and keyboard behavior of the single-file app.

- `[ ]` P4.1 Implement global keyboard shortcuts
  - `Alt+H`, `Alt+B`, `Alt+S`, `Alt+C`, `Esc`, `Enter` behaviors mirrored in Svelte.
  - Ensure shortcuts respect focused inputs (do not fire while typing).
- `[ ]` P4.2 Ensure dialog focus management
  - On open, move focus to the first meaningful element.
  - Trap focus within dialogs until closed.
  - Restore focus to the triggering control on close.
- `[ ]` P4.3 Verify focus styles & tab order
  - Confirm LCARS focus bar and neon glow patterns apply correctly to Svelte components.
  - Test Tab/Shift+Tab order against legacy behavior, including Add Entry menu.
- `[ ]` P4.4 Screen reader & ARIA audit
  - Validate labels, roles, and `aria-live` regions for status messages.
  - Fix any regressions compared to the legacy implementation.
- `[ ]` P4.5 Run automated accessibility tools
  - Run axe, WAVE, and Lighthouse audits against the Svelte app.
  - Address high and medium priority issues.

**Exit criteria:** Svelte app passes the same accessibility checklist as defined in `ACCESSIBILITY.md`, with no regressions from the single-file version.

---

## Phase 5 – Cutover Strategy & Cleanup

**Goal:** Decide how and when to treat the Svelte implementation as primary while keeping an escape hatch back to the legacy single-file app.

- `[ ]` P5.1 Decide distribution model
  - Option 1: Single built `index.html` + `bundle.js` that can still be opened via `file://`.
  - Option 2: Small static site served via HTTP with documented tradeoffs.
- `[ ]` P5.2 Update README and docs
  - Document how to run the Svelte dev environment and build the app.
  - Clarify which implementation is canonical for users vs. historical reference.
- `[ ]` P5.3 Add migration validation checklist
  - Create a manual test checklist based on core flows and accessibility requirements.
  - Use this list before promoting Svelte to default.
- `[ ]` P5.4 Decide fate of legacy `index.html`
  - Option A: Keep as `index.legacy.html` for reference.
  - Option B: Generate a Svelte build that overwrites `index.html` once confidence is high, after clearly documenting the change.

**Exit criteria:** Clear documentation for building, running, and maintaining the Svelte app, with an explicit statement of how the legacy and Svelte versions coexist.

---

## Phase 6 – Nice-to-Have Enhancements (Post-Migration)

These are optional improvements that respect the Product Agent’s scope boundaries and should only be tackled after full parity is achieved.

- `[ ]` P6.1 Improved error messaging for import validation
  - More detailed summaries with examples of discarded items.
- `[ ]` P6.2 Optional animations and transitions
  - Subtle LCARS transitions when switching views or opening dialogs.
- `[ ]` P6.3 Theming improvements
  - Live theme preview, theme presets as exportable/importable profiles (without changing bookmark data format).
- `[ ]` P6.4 Internal test harness
  - Add lightweight component tests or integration tests for critical flows (bookmark CRUD, import/export, reset) using Svelte testing utilities.

These tasks are not required for the initial migration but can further improve maintainability and polish once parity is guaranteed.

---

## Phase 7 – v2 Auth & Cloud Persistence

**Goal:** Introduce authentication and Firestore-backed persistence, while preserving guest mode semantics.

- `[ ]` P7.1 Define v2 mode semantics
  - Document in `ARCHITECTURE.md` and `README.md`:
    - Guest mode: localStorage-backed, same behavior as v1.
    - Signed-in mode: Firestore-backed, per-user data.
    - On login: Firestore data is the source of truth when present; no silent merge of guest data.
    - Import/export semantics for each mode.

- `[ ]` P7.2 Define `AuthProvider` interface
  - Specify methods such as:
    - `signIn`, `signOut`, `onAuthStateChanged`, `getCurrentUser`.
  - Document in `ARCHITECTURE.md` and (optionally) `spec/`.

- `[ ]` P7.3 Implement `FirebaseAuthProvider`
  - Implement `AuthProvider` on top of Firebase Auth.
  - Support at least:
    - Email/password.
    - One federated provider (e.g. Google).
  - Configure separate Firebase projects or environments for dev/test/prod as needed.

- `[ ]` P7.4 Implement `FirestoreBackend`
  - Implement `PersistenceBackend` backed by Firestore collections:
    - e.g. `users/{userId}/categories/*`, `users/{userId}/bookmarks/*`.
  - Ensure it respects the Svelte v1 data contracts (or explicitly documented v2 contracts).
  - Add tests that run against an emulator or test Firestore project where possible.

- `[ ]` P7.5 Wire guest vs signed-in modes
  - Introduce an `authStore` that tracks current user and mode (guest vs signed-in).
  - On auth state changes:
    - Swap the active `PersistenceBackend` between `LocalStorageBackend` and `FirestoreBackend`.
    - Load data from the active backend according to v2 semantics.
  - Ensure UI clearly indicates current mode and active backend.

- `[ ]` P7.6 v2 import/export behavior
  - Implement import/export so that:
    - In guest mode, operations target localStorage data.
    - In signed-in mode, operations target the current user’s Firestore data.
  - Update `README.md` with clear explanations and warnings.
  - Add Playwright tests covering import/export in both modes.

- `[ ]` P7.7 Auth & cloud E2E tests
  - Add Playwright scenarios for:
    - Sign-in, sign-out.
    - Bookmark/category CRUD in signed-in mode.
    - Data persistence across reloads in Firestore-backed mode.
    - Switching between guest and signed-in without losing data unintentionally.

---

## Phase 8 – v3+ Offline & Advanced Features

**Goal:** Reserve space for future offline-first behavior and advanced capabilities. Do not start work here until v1 and v2 are stable.

- `[ ]` P8.1 Design offline-first strategy
  - Evaluate using Firestore offline persistence and/or an additional local cache layer.
  - Define conflict resolution, last-writer-wins semantics, or explicit merge UIs as needed.
  - Document proposed behavior and risks in `ARCHITECTURE.md` and `ROADMAP.md`.

- `[ ]` P8.2 Implement minimal offline support (if approved)
  - Implement caching strategy agreed in P8.1.
  - Add tests to ensure basic operations work while temporarily offline and resync when back online.

- `[ ]` P8.3 Explore advanced enhancements (if ever in scope)
  - Examples:
    - Workspaces or saved views.
    - More powerful filtering or tagging that does not disrupt baseline flows.
  - Any such work must respect LCARS design, accessibility, and simplicity constraints.
