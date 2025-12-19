# ZANDER Glossary & Ubiquitous Language

This document defines the **ubiquitous language** for the ZANDER LCARS bookmark system.

When there is disagreement between documentation, this glossary, and the implementation in `index.html`:

- **`index.html` is the runtime source of truth.**
- This glossary must be updated to match `index.html`.
- Other docs (`AGENTS.md`, `ARCHITECTURE.md`, `DESIGN.md`, `README.md`) should use these terms consistently.

---

## 1. Core Domain Concepts

### 1.1 Bookmark

- **Meaning**: A saved URL with a title that belongs to exactly one category.
- **Implementation**: The `Bookmark` object described in `ARCHITECTURE.md`.
- **Fields (conceptual)**:
  - `id`: Unique identifier (string, UUID-like).
  - `title`: Human-readable label for the link.
  - `url`: Normalized URL including protocol (e.g., `https://example.com`).
  - `categoryId`: ID of the category that owns the bookmark.
  - `createdAt`: Stardate when the bookmark was created (numeric).
- **Notes**:
  - When any doc says **“entry”** it means **“bookmark”**, unless explicitly stated otherwise.
  - Each bookmark is associated with exactly one category via `categoryId`.

---

### 1.2 Category

- **Meaning**: A user-defined grouping that organizes bookmarks.
- **Implementation**: `Category` node in a nested tree.
- **Fields (conceptual)**:
  - `id`: Unique identifier.
  - `name`: Display name (generally uppercase) used in sidebar and labels.
  - `color`: Hex color string from the LCARS palette.
  - `createdAt`: Stardate when the category was created.
  - `children`: Array of child `Category` objects.
- **Notes**:
  - When something informally refers to a “folder”, it should be interpreted as a **category**.
  - Categories can be nested to arbitrary depth using `children`.

---

### 1.3 Category Tree / Category Hierarchy

- **Meaning**: The complete nested structure of all categories and their children.
- **Implementation**:
  - `state.categories`: Array of root `Category` nodes.
  - Each `Category` has `children: Category[]`.
- **Usage**:
  - Sidebar rendering.
  - Settings “Category Configuration” list.
  - Deleting a category subtree (cascading deletion of bookmarks).

---

### 1.4 Root Category

- **Meaning**: A category that has no parent.
- **Implementation**:
  - A category found directly in `state.categories` rather than inside a `children` array.
- **Usage**:
  - Root-level buttons in the sidebar.
  - Top-level rows in category configuration.

---

### 1.5 Child Category / Subcategory

- **Meaning**: A category whose parent is another category.
- **Implementation**:
  - Appears in a parent category’s `children` array.
- **Usage**:
  - Shown as a nested submenu in the sidebar.
  - Indented row in category configuration.

---

### 1.6 Current Category

- **Meaning**: The category the user currently has selected in the sidebar.
- **Implementation**:
  - `state.currentCategory`: ID of the selected category, or `null` for “All” (depending on implementation).
- **Behavior**:
  - Controls which bookmarks appear in the grid.
  - Controls the path shown in the **Bookmark Location** bar.
  - Used as the default category when adding a new bookmark.

---

## 2. UI Shell & Layout

### 2.1 LCARS Frame

- **Meaning**: The continuous C‑shaped LCARS structure that wraps the content area.
- **Implementation (key elements)**:
  - `.lcars-app` — Root layout container.
  - `.header-bar` — Top horizontal band.
  - `.sidebar-container` — Right vertical frame:
    - `.sidebar-top-cap`
    - `.sidebar-track`
    - `.sidebar-bottom-cap`
  - `.footer-bar` — Bottom horizontal band.
- **Visual Concept**:
  - Represents a single continuous LCARS bracket:
    - Header → Top Cap → Sidebar Track → Bottom Cap → Footer.

---

### 2.2 Sidebar / Category Strip

- **Meaning**: The right-hand vertical LCARS band that functions as the primary navigation controller for categories.
- **Implementation**:
  - `.sidebar-container` (outer column).
  - `.sidebar-top-cap`, `.sidebar-track`, `.sidebar-bottom-cap`.
  - `.cat-wrapper`, `.cat-btn`, `.cat-submenu` for categories and subcategories.
- **Behavior**:
  - Clicking a `.cat-btn` sets `state.currentCategory`.
  - The active category button has a distinct visual style (e.g., `.active` class).

---

### 2.3 Main Content / Main View

- **Meaning**: The central area inside the LCARS frame where the primary content (bookmarks, settings, about) appears.
- **Implementation**:
  - `.main-content`: Container for all main views.
  - `.main-view`: Base class for each view; only one is `.active` at a time.
    - Bookmarks view.
    - Settings view.
    - About view.
- **Usage**:
  - Toggled by footer buttons (`ADD ENTRY`, `SETTINGS`, `ABOUT`).
  - Toggled programmatically via JavaScript.

---

### 2.4 Bookmarks View

- **Meaning**: The main view showing the bookmark grid, the current location/path, and the status block.
- **Implementation (typical)**:
  - `.main-view` variant containing:
    - `.bookmark-location`
    - `.bookmark-grid`
    - `.status-display`
- **Behavior**:
  - Shown by default when the app loads.
  - Reflects `state.currentCategory` and current counts.

---

### 2.5 Settings View / Settings Panel

- **Meaning**: The view where the user configures categories, manages data (import/export/reset), and sees system-related info.
- **Implementation**:
  - `.main-view.settings-panel` (and related nested elements):
    - `.settings-accent`
    - `.settings-content`
    - `.category-config-list`
    - `.settings-status` (where present)
- **Behavior**:
  - Activated via the `SETTINGS` footer button or `Alt+S`.
  - Shows controls to mutate the category tree and data.

---

### 2.6 About View / About Panel

- **Meaning**: The view that displays system information, credits, and stardate/date information.
- **Implementation**:
  - `.main-view.about-panel`
- **Behavior**:
  - Activated via the `ABOUT` footer button.
  - Read-only; no configuration or data mutation.

---

### 2.7 Footer Bar

- **Meaning**: The bottom LCARS band containing global actions (and sometimes status UI).
- **Implementation**:
  - `.footer-bar`
  - `.action-btn` elements for:
    - `ADD ENTRY`
    - `SETTINGS`
    - `ABOUT`
- **Behavior**:
  - Footer buttons change the active view and open dialogs where appropriate.

---

## 3. Bookmark Presentation

### 3.1 Bookmark Tile

- **Meaning**: The visual card representing a single bookmark in the grid.
- **Implementation**:
  - `.bookmark-tile`
  - Contains:
    - `.bookmark-title`
    - `.bookmark-url`
    - `.bookmark-edit-icon` (edit action)
- **Behavior**:
  - Clicking the tile opens the URL in a new tab/window.
  - Clicking the edit icon opens the **Bookmark Dialog** in edit mode.

---

### 3.2 Bookmark Grid

- **Meaning**: The layout container that arranges bookmark tiles.
- **Implementation**:
  - `.bookmark-grid`
- **Behavior**:
  - Dynamically populated by JavaScript according to `state.currentCategory`.
  - May show an empty-state message when there are no bookmarks to display.

---

### 3.3 Bookmark Location / Location Path

- **Meaning**: A breadcrumb-like readout that shows the current category hierarchy for the active view.
- **Implementation**:
  - `.bookmark-location`
  - `.bookmark-location-label` (e.g., “LOCATION”).
  - `.bookmark-location-path` containing path segments and separators.
- **Behavior**:
  - Reflects the category path computed by `getCategoryPath(currentCategory)`.
  - Updates whenever the current category changes.

---

## 4. Status & Meta Information

### 4.1 Status Display / System Status

- **Meaning**: The decorative data readout that surfaces key system metrics.
- **Implementation**:
  - `.status-display`
  - `.status-text` (e.g., “STATUS:”).
  - `.status-info` containing label/value blocks (e.g., `CT`, `BM`).
- **Typical Contents**:
  - **CT** — Category count (flattened across nested tree).
  - **BM** — Bookmark count.
- **Behavior**:
  - Kept in sync with data via `updateSystemStatus()`.

---

### 4.2 Settings Status

- **Meaning**: Optional status or meta section inside the Settings view summarizing system information.
- **Implementation**:
  - `.settings-status` (and nested elements).
- **Behavior**:
  - May display stardate, last reset/import time, or counts.

---

### 4.3 About Meta

- **Meaning**: The section inside the About view that presents stardate, Earth date, and version info.
- **Implementation**:
  - `.about-meta`
- **Behavior**:
  - Updated via functions like `updateAboutStardate()`.

---

## 5. Dialogs & Forms

### 5.1 Bookmark Dialog

- **Meaning**: Modal used to add or edit a bookmark.
- **Implementation**:
  - `<dialog id="bookmarkDialog">` with `.lcars-dialog` structure.
  - Contains form elements for:
    - Title
    - Protocol selector (e.g., `https://` vs `http://`)
    - URL body
    - Category selection
    - Creation stardate and Earth date readout
- **Behavior**:
  - Opened for:
    - New bookmark (Add Entry).
    - Editing an existing bookmark.
  - On save:
    - Creates/updates a `Bookmark` and persists to `localStorage`.

---

### 5.2 Color Picker Dialog

- **Meaning**: Modal presenting a grid of LCARS colors used to choose a category color.
- **Implementation**:
  - `<dialog id="colorPickerDialog">`
  - `.color-grid` containing `.color-option` swatches.
- **Behavior**:
  - Opened when clicking a category’s color swatch in Settings.
  - On selection:
    - Updates the category’s `color`.
    - Re-renders sidebar and bookmark tiles.

---

### 5.3 Confirm Dialog

- **Meaning**: Generic confirmation modal for destructive or irreversible actions.
- **Implementation**:
  - `<dialog id="confirmDialog">`
  - Fields for:
    - Title
    - Message
    - Confirm and Cancel buttons
- **Behavior**:
  - Used by `showConfirm(...)` for:
    - Deleting categories.
    - Deleting bookmarks (if implemented here, otherwise in bookmark dialog).
    - Import overwrite confirmation.
    - System reset confirmation.

---

### 5.4 About Dialog / About Panel

- **Meaning**: Informational view (panel or dialog) presenting project information and stardate.
- **Implementation**:
  - Implemented as a **panel**: `.about-panel` under `.main-content`.
- **Behavior**:
  - Activated via footer `ABOUT`.
  - Does not modify state; read-only.

---

## 6. Time & Stardates

### 6.1 Stardate

- **Meaning**: Fictional time representation inspired by *Star Trek: The Next Generation*.
- **Implementation**:
  - Stored as a `number` (e.g., `41153.7`) in `createdAt` fields.
  - Computed via `calculateStardate()` from the current Earth date.
- **Usage**:
  - Bookmark and category creation timestamps.
  - Displayed in dialogs and status panels.
  - Sometimes shown alongside the approximate Earth date.

---

### 6.2 Earth Date

- **Meaning**: Human-readable date (e.g., `2363-01-09`) derived from a stardate or `Date` object.
- **Implementation**:
  - Derived via `parseStardate()` or equivalent helper.
- **Usage**:
  - Shown next to stardates in About and Settings panels.
  - Used in tooltips or meta lines for clarity.

---

## 7. Data & Persistence

### 7.1 Application State

- **Meaning**: In-memory object representing all current app data plus UI selection.
- **Implementation (conceptual)**:
  - `state = { bookmarks: Bookmark[], categories: Category[], currentCategory: string | null }`
- **Usage**:
  - All rendering is derived from `state`.
  - Any mutation of `state` must be followed by `saveData()` and re-rendering.

---

### 7.2 Storage Key

- **Meaning**: The `localStorage` key under which the entire app state is saved.
- **Implementation**:
  - `STORAGE_KEY = "zander-lcars:v1"`
- **Usage**:
  - Read via `localStorage.getItem(STORAGE_KEY)` in `loadData()`.
  - Written via `localStorage.setItem(STORAGE_KEY, serializedState)` in `saveData()`.

---

### 7.3 Import

- **Meaning**: Operation that loads bookmarks and categories from a JSON file, replacing current state.
- **Implementation**:
  - Triggered via `IMPORT DATA` in Settings.
  - Handled by `handleImport()` and a confirmation step via confirm dialog.
- **Behavior**:
  - Parses JSON from a user-selected `.json` file.
  - Validates presence of `bookmarks` and `categories` arrays.
  - On confirmation:
    - Replaces existing `state.bookmarks` and `state.categories`.
    - Resets `currentCategory` as appropriate.
    - Persists to `localStorage`.
- **Contract**:
  - JSON structure: `{ "bookmarks": Bookmark[], "categories": Category[] }`.

---

### 7.4 Export

- **Meaning**: Operation that downloads the current bookmarks and categories as a JSON backup file.
- **Implementation**:
  - Triggered via `EXPORT DATA` in Settings.
  - Implemented in `exportData()`.
- **Behavior**:
  - Serializes:
    - `bookmarks: state.bookmarks`
    - `categories: state.categories`
  - Initiates a download with filename similar to:
    - `lcars-bookmarks-YYYY-MM-DD.json`.
- **Contract**:
  - Output matches the import format `{ bookmarks, categories }`.

---

### 7.5 Reset System

- **Meaning**: Operation that wipes user data and restores built-in defaults.
- **Implementation**:
  - Triggered via `RESET SYSTEM` in Settings.
  - Implemented in `resetSystem()`.
- **Behavior**:
  - Confirms with the user.
  - Clears app data from `localStorage` under `STORAGE_KEY`.
  - Reinitializes state with `DEFAULT_BOOKMARKS` and `DEFAULT_CATEGORIES`.
  - Re-renders sidebar, grid, and status.

---

## 8. Colors & Palette

### 8.1 LCARS Palette

- **Meaning**: The set of predefined LCARS colors used for UI elements and category accents.
- **Implementation**:
  - `LCARS_PALETTE` constant in `index.html`.
  - Exposed through CSS custom properties (e.g., `--lcars-orange`, `--lcars-beige`).
- **Usage**:
  - Frame elements (header, sidebar, footer).
  - Category colors.
  - Color picker options.
  - Status labels and blocks.

---

### 8.2 Category Color

- **Meaning**: The specific LCARS palette color assigned to a category.
- **Implementation**:
  - `Category.color` field (hex).
- **Usage**:
  - Sidebar button background for that category.
  - Bookmark tile accent color for bookmarks in that category/tree.

---

## 9. Keyboard & Interaction

### 9.1 Keyboard Shortcuts

- **Meaning**: Global hotkeys used to trigger common actions.
- **Current shortcuts**:
  - `Alt + N` — Open **Add Bookmark** dialog.
  - `Alt + S` — Open **Settings** view.
  - `Alt + C` — Add **New Category** (while in Settings).
  - `Esc` — Close the active dialog (if any).
- **Implementation**:
  - Global `keydown` listener that respects text-input focus.

---

### 9.2 Neon Glow Focus

- **Meaning**: The LCARS-inspired visual style for focused interactive elements.
- **Implementation**:
  - CSS using `:focus-visible` pseudo-class.
  - Outline plus layered `box-shadow` in yellow/orange.
- **Usage**:
  - Buttons, tiles, sidebar categories, dialog controls, inputs.

---

## 10. Documentation & Governance

### 10.1 Ubiquitous Language

- **Meaning**: The shared, consistent vocabulary used by humans and AI across:
  - Code
  - Documentation
  - Design discussions
- **Usage**:
  - All new docs and code comments should use these terms.
  - When introducing a new concept, update this glossary.

---

### 10.2 Source of Truth

- **Meaning**: The artifact that takes precedence when definitions disagree.
- **Rules**:
  1. `index.html` (runtime behavior and structure).
  2. `ARCHITECTURE.md` (data model and system behavior).
  3. `DESIGN.md` (visual intent and interaction patterns).
  4. `GLOSSARY.md` (this document, kept in sync with the above).
  5. `AGENTS.md` / `README.md` (process and user-facing descriptions).

When changing behavior in `index.html` that affects terminology:

- Update this glossary first (or alongside).
- Then update `ARCHITECTURE.md`, `DESIGN.md`, `AGENTS.md`, and `README.md` as needed.

---