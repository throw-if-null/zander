# AGENTS

This document describes the agents involved in the Zander LCARS Bookmark System, how they collaborate, and the boundaries of what they are allowed to use.

The app is intentionally **dead simple** but **visually authentic**:

- A single HTML file (`index.html`) you can open directly in a browser.
- **No build step** and no backend.
- **Data is stored in `localStorage`** in the user’s browser.
- **Import and export** features let you back up and restore your bookmarks via JSON files.
- A custom, high-fidelity LCARS UI defined in `DESIGN.md`.

---

## Related Documents

These documents are the technical and visual source of truth:

- `ARCHITECTURE.md` – System design, data model, storage, import/export behavior, and JS responsibilities.
- `DESIGN.md` – LCARS UI layout, component appearance, and visual interaction patterns.
- `README.md` – How to open and use the app.
- `GLOSSARY.md` – Ubiquitous language and canonical term definitions.

Agents should defer to these documents for implementation details. For terminology, `GLOSSARY.md` is the source of truth; if a term in any doc is ambiguous, `GLOSSARY.md` defines the intended meaning.
Agents should defer to these documents for implementation details. If there is a mismatch between documentation and `index.html`, `index.html` is the ground truth, and the docs should be updated to match it.

---

## 1. Agent Overview

### 1.1 System Agent

**Name:** `system-agent`  
**Role:** Guardian of constraints, architecture, and data model.

**Responsibilities:**

- Enforce global constraints:
  - Only HTML, CSS, and JavaScript are allowed.
  - All assets must work when opened via `file://` (no dev server required).
  - No external dependencies (fonts, scripts, styles) that break offline usage.
  - No Node/npm, bundlers, or transpilers.
  - No backend or database; data lives only in browser `localStorage`.
- Own the **data model** for bookmarks and categories:
  - Canonical shapes and rules are defined in `ARCHITECTURE.md`.
  - Ensure `createdAt` timestamps (stardates) are maintained.
  - Define rules for validating and normalizing URLs.
- Define and stabilize the **import/export contract**:
  - Import/export JSON format and behavior are specified in `ARCHITECTURE.md`.
  - Ensure the format remains as stable as possible.
- Keep structure and naming consistent:
  - Single entry point: `index.html` in the project root.
  - Keep inline `<script>` and `<style>` blocks organized.
  - Maintain clear IDs and classes for JS hooks and styling.
- Maintain meta documentation:
  - Keep this `AGENTS.md` aligned with reality.
  - Ensure `ARCHITECTURE.md`, `DESIGN.md`, `README.md`, and `GLOSSARY.md` match the actual implementation and constraints.
  - When the runtime behavior in `index.html` changes (layout, dialogs, data shape, keyboard shortcuts), drive corresponding documentation updates, including term definitions in `GLOSSARY.md` where needed.

**Inputs:**

- Requirements and priorities from the Product Agent.
- Implementation options and tradeoffs from the Frontend Agent.
- Observed behavior and structure of `index.html`.

**Outputs:**

- Documented constraints and architectural decisions in `ARCHITECTURE.md`.
- Data model and `localStorage` schema details.
- Clarifications about import/export compatibility and migration behavior.

---

### 1.2 Product Agent

**Name:** `product-agent`  
**Role:** Describe what the bookmark gallery should do for the user and what a convincing “LCARS experience” means.

**Responsibilities:**

- Define the **core purpose**:
  - Provide a highly thematic, Star Trek-inspired interface for managing bookmarks.
  - Make it fast to **add**, **open**, **edit**, **delete**, **import**, and **export** bookmarks.
- Specify **LCARS UX**:
  - **Visuals**: Authentic colors, rounded "pill" buttons, elbow connectors, and blocky layouts that match the continuous LCARS frame implemented in `index.html`.
  - **Interaction**: Soundless but responsive; focus rings should use a "neon glow" style.
  - **Data**: Display dates as Stardates (TNG era).
  - **Status**: Show a decorative system status readout that reflects live data (category count, bookmark count, current stardate).
- Define **Features**:
  - **Category Management**: Users can add, rename, reorder, delete, and color-code categories (including nested categories, where supported by the current data model).
  - **Keyboard Shortcuts**: `Alt+N` (New), `Alt+S` (Settings), `Alt+C` (New Category while in Settings).
  - **About Panel/Dialog**: Credits and system info, including stardate readout.
  - **Import/Export**: Full JSON dump and restore, overwriting current data.
  - **System Reset**: Restore defaults and clear `localStorage` for this app.
- Keep scope minimal:
  - No tags or arbitrary free-form labels beyond categories.
  - No search box.
  - No user accounts or authentication.
  - No multi-file or server dependency; the UX must remain compatible with a single `index.html`.

**Inputs:**

- Constraints from the System Agent.
- Feedback and feasibility notes from the Frontend Agent.
- Reality checks from how users interact with the current `index.html` UI.

**Outputs:**

- Feature descriptions and acceptance criteria (e.g., "Category buttons must reflect their assigned color and selection state").
- Explicit statements of what will **not** be added (to maintain simplicity and keep the single-file constraint).
- Prioritized wishlist items that can be implemented without violating constraints.

---

### 1.3 Frontend Agent

**Name:** `frontend-agent`  
**Role:** Implement the bookmark gallery in a single HTML file with inline CSS/JS, using `localStorage` for persistence and JSON import/export.

**Responsibilities:**

- HTML structure:
  - Follow the LCARS layout defined in `DESIGN.md` and realized in `index.html`:
    - Header bar with elbow connector.
    - Sidebar container with top cap, track, filler, bottom cap, and dynamic category buttons (including nested category support via submenus).
    - Main content area with:
      - Bookmark grid.
      - Current bookmark location path readout.
      - System status display.
      - Switchable views (Bookmarks, Settings, About) as panels.
    - Footer bar with global actions.
  - Use semantic elements (`<main>`, `<aside>`, `<button>`, `<dialog>`, etc.) where appropriate.
  - Use `<dialog>` for modal interactions:
    - Add/Edit Bookmark
    - Confirm destructive actions
    - Color Picker
    - (Any additional overlays that need focus trapping)
- CSS and layout:
  - Implement the LCARS look using CSS variables (palette, radii, spacing).
  - Use Flexbox and CSS Grid for layout.
  - Implement the continuous LCARS frame (header → top elbow → sidebar track → bottom elbow → footer) as described in `DESIGN.md` and `LCARS_UPDATE.md`.
  - Ensure accessibility (focus states, semantic HTML, keyboard navigation).
- JavaScript behavior:
  - **State & storage:**
    - Maintain `state` (bookmarks, categories, currentCategory).
    - Support nested categories where present in the `categories` tree.
    - Persist to `localStorage` on every change under the configured storage key.
  - **Rendering:**
    - Dynamic rendering of sidebar category tree and bookmark grid.
    - Display the current category path in the "bookmark location" readout.
    - Update system status numbers based on data counts.
    - Calculate and display Stardates in About/Settings/system status.
  - **Category Management:**
    - Implement logic to add, move, delete, and color categories.
    - Honor parent/child relationships when moving or deleting categories.
    - Ensure deleting a category handles all bookmarks under that category subtree (cascading delete).
  - **Color Picker:**
    - Implement a grid-based picker using the LCARS palette.
    - Wire color picker to category configuration controls in Settings.
  - **Keyboard Shortcuts:**
    - Listen for `Alt+Key` combinations to trigger actions (`Alt+N`, `Alt+S`, `Alt+C`).
    - Respect focus and not interfere with text input fields.
  - **Import/Export:**
    - Handle JSON file reading and writing.
    - Validate import structure before overwriting existing data.
    - On successful import, re-render categories, grid, and status.
  - **System Reset:**
    - Clear app data from `localStorage`.
    - Restore default categories and bookmarks.
    - Refresh all derived UI (status, counts, views).
- Documentation alignment:
  - When implementation changes behavior or structure, communicate updates back to the System Agent so `ARCHITECTURE.md`, `DESIGN.md`, and `README.md` stay accurate.

**Inputs:**

- Requirements from the Product Agent.
- Constraints and data model definitions from the System Agent.
- LCARS visual rules from `DESIGN.md`.

**Outputs:**

- `index.html` containing:
  - HTML structure (LCARS shell, main views, dialogs).
  - Inline `<style>` for custom LCARS styles.
  - Inline `<script>` implementing all behavior (state, rendering, event handling, import/export, reset, keyboard shortcuts).

---

## 2. Collaboration Rules

1. **Keep it single‑file and offline‑friendly**
   - System Agent ensures the app remains usable as a standalone `index.html`.
   - Frontend Agent must not introduce dependencies that require a server or build step.
   - Product Agent should avoid feature requests that conflict with this constraint.

2. **Specs before complexity**
   - Product Agent describes features in terms of user goals and LCARS authenticity.
   - System Agent verifies fit with the single-file model and current data model.
   - Frontend Agent proposes implementation details that honor both.

3. **Data model is stable**
   - Changes to `bookmarks` or `categories` shape (including nested categories, new fields, or storage key changes) must be documented in `ARCHITECTURE.md`.
   - Import/export compatibility must be considered before altering the data shape.

4. **Import/export is a contract**
   - The JSON format for import/export is a public contract.
   - Breaking changes require:
     - Explicit documentation in `ARCHITECTURE.md` and `README.md`.
     - Clear runtime messaging to users (if applicable).
   - Where possible, migrations or backward-compatible reads should be considered.

5. **`index.html` is the source of truth**
   - If there is divergence between docs and implementation, implementation wins.
   - Agents are responsible for bringing documentation back into sync rather than altering behavior to match outdated text.

---

## 3. Allowed Technologies

### 3.1 Core stack

- **HTML5**: Semantic markup, `<dialog>`, logical document structure.
- **CSS3**: Flexbox, Grid, Variables. No external frameworks (e.g., Bootstrap, Tailwind).
- **JavaScript (ES6+)**: Vanilla JS only. No component frameworks (React, Vue, etc.).

### 3.2 External Assets

- **Fonts**: Local system fonts or embedded base64 if absolutely necessary (currently using system sans-serifs like Antonio/Arial/Helvetica).
- **Libraries**: None. All logic is hand-written to ensure zero dependencies and offline operation.

---

## 4. File & Structure Conventions

- `index.html` — The entire app (UI shell, styles, and behavior).
- `AGENTS.md` — Roles and responsibilities of the agents.
- `ARCHITECTURE.md` — System design, data model, storage, import/export behavior.
- `DESIGN.md` — UI/UX guidelines and LCARS visual rules.
- `README.md` — User manual and quickstart guide.

Inside `index.html`:

- **Order:**
  1. `<head>`
  2. `<style>` (LCARS CSS)
  3. `<body>` (Shell, Views, Dialogs)
  4. `<script>` (Logic)
- **Naming:**
  - Use descriptive IDs (e.g., `#addEntryBtn`, `#settingsView`, `#aboutView`, `#bookmarkDialog`, `#colorPickerDialog`, `#confirmDialog`).
  - Use descriptive classes (e.g., `.lcars-app`, `.header-bar`, `.sidebar-container`, `.cat-btn`, `.bookmark-tile`, `.status-display`).
  - Maintain stable hooks for JavaScript and tests; avoid gratuitous renaming without updating documentation.
