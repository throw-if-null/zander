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

Agents should defer to these documents for implementation details.

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
  - Ensure `ARCHITECTURE.md`, `DESIGN.md`, and `README.md` match constraints and usage.

**Inputs:**

- Requirements and priorities from the Product Agent.
- Implementation options and tradeoffs from the Frontend Agent.

**Outputs:**

- Documented constraints and architectural decisions in `ARCHITECTURE.md`.
- Data model and `localStorage` schema details.

---

### 1.2 Product Agent

**Name:** `product-agent`
**Role:** Describe what the bookmark gallery should do for the user and what “LCARS experience” means.

**Responsibilities:**

- Define the **core purpose**:
  - Provide a highly thematic, Star Trek-inspired interface for managing bookmarks.
  - Make it fast to **add**, **open**, **edit**, **delete**, **import**, and **export** bookmarks.
- Specify **LCARS UX**:
  - **Visuals**: Authentic colors, rounded "pill" buttons, elbow connectors, and blocky layouts.
  - **Interaction**: Soundless but responsive; focus rings should use a "neon glow" style.
  - **Data**: Display dates as Stardates (TNG era).
  - **Status**: Show a decorative system status readout.
- Define **Features**:
  - **Category Management**: Users can add, rename, reorder, delete, and color-code categories.
  - **Keyboard Shortcuts**: `Alt+N` (New), `Alt+S` (Settings), `Alt+C` (New Category).
  - **About Dialog**: Credits and system info.
  - **Import/Export**: Full JSON dump and restore.
- Keep scope minimal:
  - No tags, folders (beyond categories), or search.
  - No user accounts or authentication.

**Inputs:**

- Constraints from the System Agent.
- Feedback and feasibility notes from the Frontend Agent.

**Outputs:**

- Feature descriptions and acceptance criteria (e.g., "Category buttons must reflect their assigned color").
- Explicit statements of what will **not** be added (to maintain simplicity).

---

### 1.3 Frontend Agent

**Name:** `frontend-agent`
**Role:** Implement the bookmark gallery in a single HTML file with inline CSS/JS, using `localStorage` for persistence and JSON import/export.

**Responsibilities:**

- HTML structure:
  - Follow the LCARS layout defined in `DESIGN.md`:
    - Header bar with elbow connector.
    - Sidebar with dynamic category buttons.
    - Main content area with grid and status display.
    - Footer bar with global actions.
  - Use `<dialog>` for all modals (Add/Edit, Settings, Color Picker, About, Confirm).
- CSS and layout:
  - Implement the LCARS look using CSS variables (palette, radii, spacing).
  - Use Flexbox and CSS Grid for layout.
  - Ensure accessibility (focus states, semantic HTML).
- JavaScript behavior:
  - **State & storage:**
    - Maintain `state` (bookmarks, categories, currentCategory).
    - Persist to `localStorage` on every change.
  - **Rendering:**
    - Dynamic rendering of sidebar categories and bookmark grid.
    - Update system status numbers based on data counts.
    - Calculate and display Stardates.
  - **Category Management:**
    - Implement logic to add, move, delete, and color categories.
    - Ensure deleting a category handles orphaned bookmarks (cascading delete).
  - **Color Picker:**
    - Implement a grid-based picker using the LCARS palette.
  - **Keyboard Shortcuts:**
    - Listen for `Alt+Key` combinations to trigger actions.
  - **Import/Export:**
    - Handle JSON file reading and writing.
    - Validate import structure before overwriting.

**Inputs:**

- Requirements from the Product Agent.
- Constraints and data model definitions from the System Agent.

**Outputs:**

- `index.html` containing:
  - HTML structure.
  - Inline `<style>` for custom LCARS styles.
  - Inline `<script>` implementing all behavior.

---

## 2. Collaboration Rules

1. **Keep it single‑file and offline‑friendly**
   - System Agent ensures the app remains usable as a standalone `index.html`.

2. **Specs before complexity**
   - Product Agent describes features in terms of user goals and LCARS authenticity.
   - System Agent verifies fit with the single-file model.

3. **Data model is stable**
   - Changes to `bookmarks` or `categories` shape must be documented in `ARCHITECTURE.md`.

4. **Import/export is a contract**
   - The JSON format is a public contract. Changes require migration consideration (or explicit breaking changes).

---

## 3. Allowed Technologies

### 3.1 Core stack

- **HTML5**: Semantic markup, `<dialog>`.
- **CSS3**: Flexbox, Grid, Variables. No external frameworks (Bootstrap, Tailwind, etc.).
- **JavaScript (ES6+)**: Vanilla JS. No frameworks (React, Vue, etc.).

### 3.2 External Assets

- **Fonts**: Local system fonts or embedded base64 if absolutely necessary (currently using system sans-serifs like Antonio/Arial).
- **Libraries**: None. All logic is hand-written to ensure zero dependencies.

---

## 4. File & Structure Conventions

- `index.html` — The entire app.
- `AGENTS.md` — Roles and responsibilities.
- `ARCHITECTURE.md` — System design and data model.
- `DESIGN.md` — UI/UX guidelines.
- `README.md` — User manual.

Inside `index.html`:

- **Order:**
  1. `<head>`
  2. `<style>` (LCARS CSS)
  3. `<body>` (Shell, Dialogs)
  4. `<script>` (Logic)
- **Naming:**
  - Use descriptive IDs (`#addBtn`, `#settingsDialog`) and classes (`.lcars-app`, `.bookmark-tile`).