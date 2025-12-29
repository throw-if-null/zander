# AGENTS (Svelte 5 App)

This document describes how agents should work on the **Svelte 5–based Zander LCARS Bookmark System**.

* The legacy single-file implementation and its docs are the **behavioral and UX blueprint**, especially for LCARS styling, flows, and accessibility.
* The Svelte 5 app is a **new implementation**:

  * It defines its own data model, storage keys, and import/export format.
  * It runs as a built SPA (Svelte 5 + Vite) deployed to static hosting (e.g. **Cloudflare Pages**).
  * It does **not** need to work via `file://`.

`AGENTS.single-file.md` remains the canonical description for the legacy single-file app.

---

## 1. Scope & goals

* Deliver a **Svelte 5 LCARS bookmark app** that:

  * Preserves the recognizable LCARS look-and-feel.
  * Preserves the **core user flows**:

    * Add/edit/delete bookmarks.
    * Manage nested categories.
    * Themes.
    * Import/export.
    * System reset.
  * Preserves the **keyboard shortcuts** and dialog behavior (as reasonable within Svelte 5).
  * Meets or exceeds the **WCAG 2.1 AA** accessibility target.

* **Canonical keyboard shortcuts (Svelte app)**

  * `Alt+H` — Home (Bookmarks view)
  * `Alt+S` — Settings view
  * `Alt+B` — Add Bookmark (opens Bookmark dialog)
  * `Alt+C` — Add Category (opens category creation flow)
  * `Esc` — Close active dialog
  * `Enter` — Submit dialog form (when valid)
  * Shortcuts must not trigger while typing in inputs/textarea/contenteditable.

* Architecture constraints

  * Use **Svelte 5 runes** and `.svelte.ts` shared modules for app state.
  * Keep domain logic and selectors pure and testable.
  * Keep persistence behind a port interface.
  * Support:

    * **v1**: guest-only, LocalStorage-backed.
    * **v2**: guest + signed-in (Firestore) with pluggable auth.
    * **v3+**: reserve space for offline-first/sync.

---

## 2. Agent overview

### 2.1 System Agent (`system-agent`)

**Role:** Own the technical architecture, data contracts, and quality bar.

#### Svelte 5 requirements

* Prefer Svelte 5 idioms.

  * In runes mode, do not use `export let`; use `$props()`.
  * In runes mode, avoid `$:`; use `$derived()` / `$effect()`.
  * In runes mode, avoid `on:…`; use DOM-style handlers (`onclick`, `onkeydown`, etc.).

* Runes constraints

  * `$state`, `$derived`, `$effect` must only appear in `.svelte` and `.svelte.ts/.svelte.js` files.
  * Plain `.ts` files must not reference runes (directly or indirectly).

* Public API boundary for rune modules

  * Use the **barrel pattern** to prevent importing rune code from plain TS:

    * `src/lib/state/index.svelte.ts` contains rune code.
    * `src/lib/state/index.ts` re-exports safe entrypoints/types (no runes).

* Browser targets

  * Avoid top-level `await` in entrypoints/modules when targeting older browsers.
  * Prefer `onMount(async () => …)` in components or an async IIFE in `main.ts`.

* TypeScript discipline

  * Avoid `any` and implicit `any`.
  * Annotate event handler parameters and snippet props.

#### Responsibilities

* Project structure & runtime model

  * Maintain a clear Svelte layout:

    * `src/App.svelte` as the root LCARS shell + view switcher.
    * `src/lib/components/lcars/` for LCARS primitives.
    * `src/lib/components/views/` for Bookmarks/Settings/About.
    * `src/lib/components/dialogs/` for dialogs.
    * `src/lib/state/` for domain + rune controllers.

* Versioned behavior roadmap

  * Keep `ROADMAP.md` aligned with actual code.

* Ports & abstractions

  * Persistence port (`PersistenceBackend`):

    * `loadState(): Promise<State | null>`
    * `saveState(state: State): Promise<void>`
    * `exportData(): Promise<ExportBundle>`
    * `importData(bundle: ExportBundle): Promise<void>`
  * Auth port (`AuthProvider`) for v2.
  * Optional telemetry port.

* Data contracts

  * Keep canonical types in the state layer (and reflect them in `ARCHITECTURE.md`).
  * Breaking changes require:

    * versioned storage keys,
    * migration or reset strategy,
    * tests.

* Quality, testing, and CI

  * Minimum bar:

    * Vitest unit tests for domain logic/selectors/controller behavior.
    * Svelte Testing Library for critical UI components.
    * Playwright for core flows + keyboard shortcuts + a11y checks.

---

### 2.2 Product Agent (`product-agent`)

**Role:** Define what must stay the same for users, where the Svelte app can improve, and how v1/v2/v3 evolve behavior.

Responsibilities include:

* non-negotiable flows and UX parity,
* acceptance criteria per phase,
* scope boundaries.

(Keep existing detailed content; update only when behavior changes.)

---

### 2.3 Frontend Agent (`frontend-agent`)

**Role:** Implement the Svelte 5 app, respecting LCARS design, data contracts, accessibility, and the ports.

#### Responsibilities

* Svelte component architecture

  * Implement LCARS primitives under `src/lib/components/lcars/`.
  * Implement views under `src/lib/components/views/`.
  * Implement dialogs under `src/lib/components/dialogs/`.
  * Use snippet props (`Snippet` + `{@render …}`) where it fits the LCARS shell composition.

* State management (no `svelte/store`)

  * Use rune controllers in `.svelte.ts`:

    * `src/lib/state/app/*` for app state + actions.
    * `src/lib/state/theme/*` for theme state + actions.
  * Pure code lives in plain `.ts`:

    * `src/lib/state/domain/*` (pure domain ops)
    * `src/lib/state/selectors/*` (pure derived reads)

* Behavior parity

  * Preserve the canonical shortcuts and dialog behaviors.
  * Ensure category subtree filtering and cascading deletes behave as specified.

* Accessibility

  * Maintain semantic HTML, focus management, and keyboard behavior.
  * Treat regressions as bugs.

---

## 3. Collaboration rules

1. **Legacy app is the UX blueprint, not the data contract**

   * Match user-visible behavior and LCARS feel.
   * Svelte data contracts/storage keys are independent and versioned.

2. **Data contract evolution is explicit**

   * Breaking changes require new storage keys, migration/reset, docs, and tests.

3. **Ports-only for auth/persistence**

   * UI and state controllers depend on ports, not implementations.

4. **Accessibility is non-negotiable**

   * Follow `ACCESSIBILITY.md`.
   * Add tests for focus traps/shortcuts where feasible.

5. **Incremental evolution**

   * Prefer small steps with tests.

---

## 4. Allowed technologies

* Svelte 5 + Vite
* TypeScript
* Vitest + Svelte Testing Library
* Playwright (E2E)

---

## 5. File & structure conventions

* `src/App.svelte` — root LCARS shell and view switching

* `src/main.ts` — bootstrap (avoid top-level `await` for older browser targets)

* `src/lib/components/`

  * `lcars/` — LCARS primitives
  * `views/` — Bookmarks/Settings/About
  * `dialogs/` — modal dialogs

* `src/lib/state/`

  * `index.svelte.ts` — rune-based entrypoints (`createAppState`, `createThemeState`)
  * `index.ts` — safe re-exports (no runes)
  * `app/` — app state controller modules
  * `theme/` — theme controller modules
  * `domain/` — pure domain logic
  * `selectors/` — pure selectors

* `src/lib/persistence/`

  * `PersistenceBackend.ts`
  * `LocalStorageBackend.ts`
  * `FirestoreBackend.ts` (v2)

* `src/lib/auth/`

  * `AuthProvider.ts`
  * `FirebaseAuthProvider.ts` (v2)

If documentation and implementation disagree, the **implementation + tests** are the source of truth; update docs to match.
