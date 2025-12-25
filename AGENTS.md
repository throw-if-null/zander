# AGENTS (Svelte 5 App)

This document describes how agents should work on the **Svelte 5–based Zander LCARS Bookmark System**.

- The existing single‑file implementation in `index.html` and its docs (`ARCHITECTURE.md`, `DESIGN.md`, `ACCESSIBILITY.md`, `README.md`, `GLOSSARY.md`) are the **behavioral and UX blueprint**, especially for LCARS styling, flows, and accessibility.
- The Svelte 5 app is a **new implementation**:
  - It defines its own data model, storage keys, and import/export format.
  - It runs as a built SPA (Svelte 5 + Vite) deployed to **Cloudflare Pages**.
  - It does **not** need to work via `file://`.

`AGENTS.single-file.md` remains the canonical description for the legacy single‑file app.

---

## 1. Scope & Goals (Svelte 5)

- Deliver a **Svelte 5 LCARS bookmark app** that:
  - Preserves the recognizable LCARS look‑and‑feel.
  - Preserves the **core user flows**:
    - Add/edit/delete bookmarks.
    - Manage nested categories.
    - Themes.
    - Import/export.
    - System reset.
  - Preserves the **keyboard shortcuts** and dialog behavior (as reasonable within Svelte 5).
  - Meets or exceeds the **WCAG 2.1 AA** accessibility target.

- Introduce a modern architecture:
  - **Svelte 5 idioms** (runes‑based reactivity, Svelte 5 store patterns, component composition).
  - Typed domain model and explicit **ports** for persistence and auth.
  - Clear support for:
    - **v1**: guest‑only, localStorage‑backed SPA.
    - **v2**: guest + signed‑in mode with Firebase Auth and Firestore.
    - **v3+**: room for future offline‑first/sync behavior.

- Treat the Svelte app’s own **data contracts** and storage schema as canonical for the Svelte version:
  - Legacy `index.html` is a **reference for UX**, not a hard data‑format contract.
  - Breaking changes in the Svelte data model must be versioned and documented.

---

## 2. Agent Overview (Svelte 5 Context)

### 2.1 System Agent (`system-agent`)

**Role:** Own the Svelte 5 technical architecture, data contracts, and quality bar.

**Svelte 5 requirement:**

- Always design for and use **Svelte 5** and its idioms.
  - Prefer Svelte 5 concepts (runes‑based reactivity, current store patterns, recommended component structure).
  - Do **not** introduce patterns that are specific to older Svelte versions (3/4) when they conflict with Svelte 5 best practices.
  - When in doubt, follow the **current Svelte 5 documentation and recommendations**.
  - In runes mode, **do not** use `export let` for props; use `$props()` instead.
  - In runes mode, **do not** use legacy `$:` reactive statements; use `$derived()` or `$effect()` as appropriate.
  - When writing unit tests, avoid calling Svelte DOM lifecycle APIs (e.g. `mount` via `@testing-library/svelte` render) until tests are configured to run in a true browser client context; prefer simple compilation/behavior tests instead.

**Responsibilities:**

- **Project structure & runtime model**
  - Define the Svelte project layout:
    - `src/App.svelte` as the root LCARS shell and view switcher.
    - `src/lib/components/lcars/` for LCARS primitives.
    - `src/lib/components/views/` for Bookmarks/Settings/About.
    - `src/lib/components/dialogs/` for Bookmark/ColorPicker/Confirm dialogs.
    - `src/lib/stores/` for state and theme stores.
    - `spec/` (once introduced) for OpenSpec/contract files.
  - Choose and maintain tooling:
    - Svelte 5 + Vite.
    - TypeScript.
    - Vitest + Svelte Testing Library.
    - Playwright for E2E.
  - Define deployment:
    - Built SPA deployed on **Cloudflare Pages**.
    - No `file://` support is required; static hosting over HTTP is assumed.

- **Versioned behavior roadmap**
  - Define and maintain the versioned behavior model:
    - **v1 (Svelte initial release)**
      - Guest‑only mode.
      - Persistence via `LocalStorageBackend` using Svelte‑defined schemas and keys.
      - LCARS shell, flows, keyboard shortcuts, and import/export implemented in Svelte.
    - **v2 (Cloud sync + auth)**
      - Add **Firebase Auth** (e.g. email/password + providers like Google/Facebook).
      - Add **Firestore** as a second persistence backend:
        - Per‑user collections (e.g. `users/{userId}/categories/*`, `users/{userId}/bookmarks/*`).
      - Support:
        - Guest mode (unchanged localStorage backend).
        - Signed‑in mode (Firestore backend).
      - On login:
        - If cloud data exists, treat Firestore as source of truth.
        - Do **not** silently merge local guest data; instead, rely on explicit import/export if needed.
    - **v3+ (future)**
      - Reserve space for offline‑first sync, conflict resolution, etc. (not defined yet).

- **Ports & abstractions**
  - Define clear **persistence ports** (interfaces), e.g. `PersistenceBackend`:
    - `loadState(): Promise<State | null>`
    - `saveState(state: State): Promise<void>`
    - `exportData(): Promise<ExportBundle>`
    - `importData(bundle: ExportBundle): Promise<void>`
    - Optional:
      - `subscribe(onChange)` for real‑time updates (Firestore).
  - Define an **auth port** (e.g. `AuthProvider`):
    - Methods like `signIn`, `signOut`, `onAuthStateChanged`, `getCurrentUser`.
    - V2 default implementation: wraps **Firebase Auth**.
    - CI and test usage:
      - Use configured **test users** in Firebase Auth (no separate machine‑to‑machine OAuth).
  - Define an **observability port** (optional name, e.g. `TelemetryClient`):
    - Methods like `trackEvent`, `trackError`, `trackTiming`.
    - Base implementation: OpenTelemetry‑style tracer/span interface with a no‑op default.

- **Data contracts (Svelte app)**
  - Specify Svelte‑specific types in `ARCHITECTURE.md`, including:
    - `Bookmark`, `Category`, `State`, `ExportBundle`, and any auth/user types.
  - Make it explicit that:
    - These shapes **may differ** from the legacy single‑file version.
    - Once released, changing them in a breaking way requires:
      - Versioned storage keys (e.g. `zander-svelte:v2`).
      - Forward migration or reset strategy.
      - Tests validating migration/compat behavior.
  - Ensure import/export formats are:
    - Minimal but sufficient to reconstruct user data.
    - Stable within a major version; breaking changes require a new version and migration notes.

- **Quality, testing, and CI/CD**
  - Define the **minimum test bar**:
    - Vitest unit tests for stores, utilities, and ports.
    - Svelte Testing Library for LCARS shell and critical components (views, dialogs).
    - Playwright for:
      - Core flows (bookmark CRUD, category tree operations, themes, import/export, reset).
      - Keyboard shortcuts.
      - Basic a11y checks (e.g. axe).
  - Define the **CI/CD pipeline**:
    - Lint (if configured).
    - Run Vitest.
    - Build Svelte app.
    - Run Playwright E2E against a preview build.
    - Deploy to Cloudflare Pages.
    - Optionally run a post‑deploy smoke test against production (Playwright).
    - Fail CI on any test or a11y failure.

- **Observability**
  - Specify where and how to use **OpenTelemetry** (or equivalent):
    - Instrument key flows:
      - App startup and data load.
      - Save operations.
      - Import/export.
      - Reset.
      - Login/logout and auth errors.
    - Default exporter:
      - No‑op in development unless configured.
      - Optional OTLP exporter for tools like **Honeycomb**, controlled via environment variables.

- **Documentation**
  - Keep **Svelte architecture docs in sync**:
    - Add and maintain a “Svelte 5 Architecture” section in `ARCHITECTURE.md`.
    - Keep this `AGENTS.md` aligned with reality.
    - Ensure `ROADMAP.md` reflects the current phases, v1/v2 scope, and backend/auth plans.
  - Clearly document any divergence from the legacy single‑file behavior.

**Inputs:**

- Legacy behavior and UX from `index.html`, `ARCHITECTURE.md`, `DESIGN.md`, `ACCESSIBILITY.md`, `README.md`.
- Product constraints and priorities.
- Current Svelte 5 documentation and best practices.

**Outputs:**

- Updated `AGENTS.md` and Svelte‑specific sections in `ARCHITECTURE.md`.
- A versioned technical roadmap (`ROADMAP.md`) aligned with v1/v2/v3.
- Port/interface definitions and testing/observability strategy.

---

### 2.2 Product Agent (`product-agent`)

**Role:** Define what must stay the same for users, where the Svelte app can improve, and how v1/v2/v3 evolve behavior.

**Responsibilities:**

- **Non‑negotiable behavior & UX**
  - Preserve core flows:
    - Add/edit/delete bookmarks.
    - Nested category management (including cascading deletes).
    - Theme selection and status readouts.
    - Import/export as a user‑visible backup mechanism.
    - System reset.
  - Preserve keyboard shortcuts (subject to Svelte/SPA constraints):
    - `Alt+H`, `Alt+B`, `Alt+S`, `Alt+C`, `Esc`, `Enter`.
  - Preserve overall LCARS feeling:
    - Header/footer bars.
    - Sidebar categories.
    - Bookmark tiles.
    - Status/stardate displays.

- **Versioned behavior definition**
  - **v1 (Svelte guest mode)**:
    - No authentication; all users are guests.
    - Data lives entirely in the browser (localStorage backend).
    - Import/export:
      - Designed primarily for guest local data.
      - Defined by Svelte’s own `ExportBundle` type.
      - Does *not* have to match the legacy single‑file export format, but:
        - It should remain stable within v1.
        - Any breaking change must be clearly documented.
    - Goal: replicate legacy flows with Svelte 5 UX, allowing modest UX improvements.

  - **v2 (guest + signed‑in modes)**:
    - Add **sign‑in** flows (Firebase Auth).
      - Define supported auth methods (e.g. email+password, Google, Facebook).
      - Design a simple LCARS‑styled login/logout experience.
    - Define **mode semantics**:
      - Guest mode:
        - Behaves like v1; localStorage‑backed.
      - Signed‑in mode:
        - Uses Firestore‑backed persistence.
        - Data is scoped per user.
      - On login:
        - Firestore data takes precedence for signed‑in mode.
        - Guest local data is not automatically merged; Product Agent may define an explicit “Import local guest data” flow if desired.
    - Define **import/export semantics**:
      - Guest:
        - Export/import guest local data.
      - Signed‑in:
        - Export/import cloud data for the current user (for data portability).
      - Ensure this is clearly explained in `README.md`.

  - **v3+ (future options)**:
    - Offline‑first behavior or Firestore offline caching.
    - Optional “workspace” or advanced filtering features (if ever in scope).
    - Only to be defined once v1 and v2 are stable.

- **Scope boundaries**
  - Out‑of‑scope for the initial Svelte migration:
    - Full‑text search, tag systems, or complex filtering.
    - Multi‑user sharing, collaboration, or server‑side APIs.
    - Non‑LCARS visual themes that fundamentally change the aesthetic.
  - Any new feature must:
    - Preserve the simplicity of baseline flows.
    - Respect a11y and LCARS visual constraints.

- **Acceptance criteria**
  - Define acceptance for each phase in `ROADMAP.md` in terms of **user‑perceived behavior**:
    - Phase 1: LCARS shell in Svelte, visually aligned with legacy app.
    - Phase 2: Core state and persistence behaving as defined for v1.
    - Phase 3: Dialogs and flows (CRUD, import/export, reset) working end‑to‑end.
    - Phase 4: Keyboard shortcuts and accessibility parity.
    - v2 phases: clear, testable scenarios for login/logout, guest vs signed‑in distinction, and cloud persistence semantics.

**Inputs:**

- Legacy behavior from `index.html` and `README.md`.
- Visual system and UX intent from `DESIGN.md` and `ACCESSIBILITY.md`.
- Constraints and opportunities from System Agent (e.g. Cloudflare, Firebase).

**Outputs:**

- A prioritized, versioned migration backlog (`ROADMAP.md`).
- Narrative documentation of behavior for v1 and v2 in `README.md`.
- Clear acceptance criteria for each phase, expressed in user language.

---

### 2.3 Frontend Agent (`frontend-agent`)

**Role:** Implement the Svelte 5 app, respecting LCARS design, data contracts, accessibility, and the ports defined by the System Agent.

**Responsibilities:**

- **Svelte 5 component architecture**
  - Implement:
    - Root app:
      - `App.svelte` for LCARS shell and high‑level view switching.
    - LCARS primitives (under `src/lib/components/lcars/`), mapping directly to documented CSS classes and forming a reusable **LCARS Svelte design system** that can be used beyond Zander:
      - `LcarsApp.svelte`, `LcarsHeaderBar.svelte`, `LcarsFooterBar.svelte`, `LcarsSidebarBar.svelte`, `LcarsStatusDisplay.svelte`, etc.
    - Views (under `src/lib/components/views/`):
      - `BookmarksView.svelte`, `SettingsView.svelte`, `AboutView.svelte`.
    - Dialogs (under `src/lib/components/dialogs/`):
      - `BookmarkDialog.svelte`, `ColorPickerDialog.svelte`, `ConfirmDialog.svelte`.
  - Use **Svelte 5 idioms** consistently:
    - Modern reactivity patterns.
    - Svelte 5 store APIs.
    - Avoid legacy anti‑patterns from earlier Svelte versions.

- **State management and stores**
  - Implement Svelte stores (e.g. `stateStore.ts`, `themeStore.ts`, `authStore.ts`) that:
    - Encapsulate domain entities (`Bookmark`, `Category`, `State`).
    - Implement operations equivalent to legacy functionality:
      - `loadState`, `saveState`.
      - `addCategory`, `moveCategory`, `deleteCategory`.
      - `addBookmark`, `updateBookmark`, `deleteBookmark`.
      - `getCategoryPath`, etc.
    - Delegate all persistence to the **persistence port** (`PersistenceBackend`) so the UI is agnostic to localStorage vs Firestore.
  - Implement a theme store that:
    - Manages theme IDs and labels.
    - Applies themes via attributes/classes on `<body>`.
    - Persists via localStorage.

- **Behavior parity & flows**
  - Re‑create core behaviors in Svelte:
    - Category selection, nested category rendering, and breadcrumb/location path.
    - Bookmark filtering by selected category subtree.
    - Stardate calculation and display (using equivalents of `calculateStardate` / `parseStardate`).
    - Import/export/reset semantics as defined by Product and System Agents for Svelte v1.
  - Implement keyboard shortcuts:
    - `Alt+H`, `Alt+B`, `Alt+S`, `Alt+C`, `Esc`, `Enter`.
    - Ensure they do not interfere with text input fields.

- **Auth & persistence wiring (v2)**
  - Wire the Svelte app to:
    - `LocalStorageBackend` for guest mode.
    - `FirestoreBackend` + `AuthProvider` for signed‑in mode.
  - Ensure:
    - Mode switching (guest ↔ signed‑in) is explicit and predictable.
    - Import/export operate on the correct backend depending on mode.

- **Accessibility**
  - Implement semantic markup equivalent to or better than the legacy app:
    - Proper landmarks (`<header>`, `<main>`, `<aside>`, `<footer>`).
    - Headings and labels.
    - ARIA attributes where needed (e.g. for dialogs, live regions).
  - Ensure dialog behavior:
    - Focus trapping.
    - Focus restoration to triggering control.
    - Keyboard handling (`Esc` closes, `Enter` submits when appropriate).
  - Maintain or improve LCARS focus styles and keyboard navigation patterns documented in `ACCESSIBILITY.md`.

- **Testing & observability integration**
  - Implement tests as specified by System Agent:
    - Vitest tests for stores and utilities.
    - Svelte Testing Library tests for components and views.
    - Playwright E2E tests that match Product Agent’s acceptance criteria.
  - Add telemetry hooks where specified:
    - Wrap persistence operations and critical flows with telemetry events/spans.
    - Guard telemetry calls behind the configured observability port so they are no‑ops when disabled.

**Inputs:**

- Legacy DOM structure and behavior (from `index.html`, `ARCHITECTURE.md`, `DESIGN.md`, `ACCESSIBILITY.md`).
- System Agent’s architecture, ports, and data contracts.
- Product Agent’s behavior definitions and acceptance criteria.

**Outputs:**

- Svelte 5 component tree and store implementation.
- Tests for critical flows and a11y behaviors.
- Integrated telemetry hooks using the observability port.

---

## 3. Collaboration Rules (Svelte 5 Migration)

1. **Legacy app is the UX blueprint, not the data contract**  
   - When in doubt, match the legacy app’s **user‑visible behavior** and LCARS styling.
   - Data shapes, storage keys, and import/export formats for the Svelte app are defined in this repo’s Svelte architecture docs, not by the original `index.html` storage.

2. **Data contract evolution**  
   - Svelte‑specific `Bookmark`, `Category`, `State`, and `ExportBundle` types live in `ARCHITECTURE.md`.
   - Within a major Svelte version (e.g. v1), keep contracts stable whenever possible.
   - Any breaking change:
     - Requires a new versioned storage key or schema.
     - Must include a clear migration or reset story.
     - Must be covered by tests and documented in `ARCHITECTURE.md` and `README.md`.

3. **Design primitives stay canonical**  
   - CSS classes and LCARS primitives in `DESIGN.md` are the public LCARS UI API.
   - Svelte LCARS components **wrap** those primitives:
     - They must not silently diverge from documented classes or semantics.
     - Any intentional divergence must be documented.

4. **Accessibility is non‑negotiable**  
   - The Svelte app must meet the **same or better** a11y bar as the legacy app.
   - Keyboard flows, focus handling, and screen reader support are first‑class, not afterthoughts.
   - Automated a11y checks (axe, etc.) are part of the test suite; failures block release.

5. **Spec‑ and test‑driven changes**  
   - Before making significant behavioral changes:
     - Update or add specs (OpenSpec and/or `ARCHITECTURE.md`).
     - Add or update tests (Vitest, Svelte Testing Library, Playwright).
   - No major behavior changes should land without at least one corresponding test.

6. **Incremental evolution**  
   - Prefer small, reversible steps:
     - Introduce new ports and backends in parallel where feasible.
     - Migrate flows incrementally rather than big‑bang rewrites.
   - Keep legacy `index.html` and its docs as a stable historical reference.

7. **Observability & error handling**  
   - Avoid silent failures:
     - Surface user‑relevant errors via LCARS‑styled dialogs/toasts.
     - Log internal errors via the observability port when enabled.
   - Ensure that telemetry instrumentation does not break functionality if disabled.

---

## 4. Allowed Technologies (Svelte Implementation)

- **Core stack**
  - Svelte 5 + Vite.
  - TypeScript for stores, ports, and complex logic (encouraged across the codebase).
  - Svelte Testing Library + Vitest.
  - Playwright for E2E.

- **Persistence & auth**
  - v1:
    - Browser `localStorage` behind a `LocalStorageBackend`.
  - v2:
    - `LocalStorageBackend` (guest mode) + `FirestoreBackend` (signed‑in mode).
    - Firebase Auth for authentication, configured via environment variables for different environments (dev, test, prod).

- **Hosting & runtime**
  - Static SPA built artifacts (HTML + JS + CSS).
  - Hosted on **Cloudflare Pages** or equivalent static hosting.
  - No requirement to run from `file://`.

- **Observability**
  - OpenTelemetry‑compatible instrumentation for key flows.
  - Configurable exporters (e.g. OTLP for Honeycomb) via environment variables.
  - No hard dependency on any particular APM vendor.

- **External libraries**
  - Keep dependencies minimal.
  - Do not replace core domain logic (bookmarks/categories, import/export, stardates) with heavy third‑party packages.
  - Use libraries where they clearly improve:
    - Testing.
    - A11y tooling.
    - Telemetry integration.
    - Firebase integration.

---

## 5. File & Structure Conventions (Svelte App)

- `index.html` (legacy)  
  - Remains as the canonical **single‑file reference implementation**.
  - Not modified by the Svelte build.
  - Used as a behavioral and UX reference only.

- `src/` (Svelte app)  
  - `src/App.svelte` – Root LCARS shell and view switching.  
  - `src/main.ts` – Svelte bootstrap entry point.  
  - `src/lib/components/lcars/` – LCARS primitive components (`LcarsApp.svelte`, `LcarsHeaderBar.svelte`, etc.).  
  - `src/lib/components/views/` – `BookmarksView.svelte`, `SettingsView.svelte`, `AboutView.svelte`.  
  - `src/lib/components/dialogs/` – `BookmarkDialog.svelte`, `ColorPickerDialog.svelte`, `ConfirmDialog.svelte`.  
  - `src/lib/stores/` – State, theme, and auth stores (`stateStore.ts`, `themeStore.ts`, `authStore.ts`).  
  - `src/lib/persistence/` – Persistence ports and backends (`PersistenceBackend.ts`, `LocalStorageBackend.ts`, `FirestoreBackend.ts`).  
  - `src/lib/auth/` – Auth ports and Firebase Auth implementation (`AuthProvider.ts`, `FirebaseAuthProvider.ts`).  
  - `src/lib/telemetry/` – Observability ports and implementations.  

- `spec/` (once introduced)  
  - OpenSpec/contract files describing:
    - Ports (`PersistenceBackend`, `AuthProvider`, etc.).
    - Core store behaviors.
    - Key user flows (add bookmark, import/export, reset, login/logout).

- Documentation  
  - `AGENTS.md` – This file (Svelte 5 agents & rules).  
  - `AGENTS.single-file.md` – Legacy single‑file agent description (historical reference).  
  - `ARCHITECTURE.md` – Includes both legacy and Svelte 5 architecture sections.  
  - `DESIGN.md` – Canonical LCARS visual and component mapping reference.  
  - `ACCESSIBILITY.md` – Accessibility requirements (apply to both legacy and Svelte app).  
  - `ROADMAP.md` – Migration and evolution roadmap (v1, v2, v3).  

If there is a mismatch between documentation and the Svelte implementation, the **Svelte app’s behavior** is the ground truth for the Svelte version. Agents must update docs promptly to match.
