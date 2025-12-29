# Zander LCARS Bookmark System

**Zander** is an LCARS-style bookmark manager inspired by *Star Trek: The Next Generation*.

This repository contains **two implementations**:

1. **Svelte 5 SPA (current)**

   * Source: `src/`
   * Built with Svelte 5 + Vite
   * Runs as a static SPA (e.g. Cloudflare Pages)
   * v1 is **guest mode** using local browser storage

2. **Legacy single-file app (reference)**

   * Preserved as `index.legacy.html` (or equivalent)
   * Kept as a UX/behavior reference, **not** the canonical data contract

For terminology used in this README (e.g., “Bookmark”, “Category”, “View”), see `GLOSSARY.md`.

---

## Features (Svelte 5 app)

* **Authentic LCARS UI**

  * Header / sidebar / footer LCARS shell
  * Console-like labels and status readouts
  * Keyboard-first operation with visible focus states

* **Local-first (v1)**

  * No backend required
  * Data stored locally in the browser
  * Import/Export for backup and moving data between devices

* **Category tree**

  * Nested categories (`children`)
  * Reorder among siblings
  * Cascading deletes remove a subtree and its bookmarks

* **Bookmark management**

  * Add / edit / delete
  * URL normalization (adds protocol when missing)

* **Themes**

  * Multiple LCARS themes (LA'AN, DATA, THE DOCTOR, CHAPEL, SPOCK, M'BENGA, SEVEN OF NINE, SHRAN)
  * Theme affects UI tokens/accents; data and layout remain the same

* **Accessibility**

  * Target: WCAG 2.1 AA
  * See `ACCESSIBILITY.md` for implementation rules and a testing checklist

---

## Keyboard shortcuts (Svelte 5 app)

| Shortcut  | Action                                   |
| --------- | ---------------------------------------- |
| `Alt + H` | Home (Bookmarks view)                    |
| `Alt + B` | Add Bookmark (opens Bookmark dialog)     |
| `Alt + S` | Settings view                            |
| `Alt + C` | Add Category (creation flow)             |
| `Esc`     | Close active dialog                      |
| `Enter`   | Submit dialog form (when valid/expected) |

Notes:

* Shortcuts must **not** trigger while typing in `input`, `textarea`, `select`, or `[contenteditable]`.
* Browser/OS shortcuts may override these on some platforms.

---

## Getting started (Svelte 5 app)

### Requirements

* Node.js (LTS recommended)
* pnpm (recommended) or npm

### Install

```bash
pnpm install
```

### Run dev server

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview production build

```bash
pnpm preview
```

---

## Legacy single-file app (reference)

If the repo includes the original single-file app:

* Open `index.legacy.html` in a browser.
* It exists as a reference for LCARS styling and certain flows.
* The **Svelte app** is the active implementation and may differ in storage keys and data format.

---

## Data, storage, import/export (Svelte 5 app)

### Local storage keys (v1)

Keys are versioned and may evolve. Current v1 defaults (check `ARCHITECTURE.md` for canonical values):

* App state: `zander-svelte:v1`
* Theme: `zander-svelte-theme:v1`

### Data model

The canonical contracts are defined by the Svelte app state types (see `ARCHITECTURE.md` and `src/lib/state/**`).

High-level invariants:

* Categories form a **tree** (`children: Category[]`).
* Each bookmark belongs to **exactly one** category (`categoryId`).
* Timestamps are stored as strings (current implementation uses ISO-8601 via `new Date().toISOString()`).

### Import/Export

* Export produces a versioned JSON bundle containing the full state.
* Import is a **full replace** unless explicitly documented otherwise.

---

## Accessibility

Accessibility is a first-class requirement.

* Target: **WCAG 2.1 AA**
* Rules and checklists: `ACCESSIBILITY.md`
* Design guidance and primitives: `DESIGN.md`

---

## Architecture (Svelte 5 app)

Entry points:

* `src/main.ts` — mounts the app (avoid top-level `await` if targeting older browsers)
* `src/App.svelte` — LCARS shell + view switching

State management (store-free, rune-style):

* App/theme state is managed via `.svelte.ts` modules under `src/lib/state/`.
* Pure domain logic lives in plain `.ts` modules (no runes).
* Side effects (storage writes, theme application, etc.) live at the boundaries.

Persistence:

* Port: `src/lib/persistence/PersistenceBackend.ts`
* v1: `LocalStorageBackend`
* v2+: optional Firestore backend + auth provider (see `ARCHITECTURE.md` / `AGENTS.md`)

See `ARCHITECTURE.md` for the canonical architecture description.

---

## Testing

* Unit tests: Vitest
* (Optional / when present) Component tests: Svelte Testing Library
* (Optional / when present) E2E: Playwright

Typical commands:

```bash
pnpm test --run
```

---

## Credits

Zander is a fan-made tribute to the LCARS interface from *Star Trek: The Next Generation*.

Star Trek and LCARS are properties of Paramount/CBS.
