# Architecture & System Design

This document describes the high-level architecture, data model, and system behavior of the Zander LCARS Bookmark System. It is the technical source of truth for how the app is structured and how data flows.

---

## 1. High-Level Overview

### 1.1 Runtime Model

- **Single-file app**:
  - All HTML, CSS, and JavaScript live in one file (`index.html`).
  - No build step, bundler, or transpiler.
- **Execution environment**:
  - Runs directly in a modern browser.
  - Must work when opened via `file://` (no HTTP server assumed).
- **Persistence**:
  - All data is stored in `localStorage`.
  - No backend or external database.
- **Import/Export**:
  - Users can export bookmarks/categories as a JSON file.
  - Users can import a JSON file to restore/replace data.

### 1.2 UI Shell

The app is visually presented as a **LCARS-style interface**:

- **Header Bar**: Top structural element with the "LCARS" title and decorative elbow.
- **Sidebar (Left)**: Vertical navigation column containing category buttons and a filler block.
- **Main Content (Right)**:
  - **Bookmark Grid**: A flex/grid area displaying bookmark tiles.
  - **System Status**: A decorative data readout block at the bottom of the content area.
- **Footer Bar**: Bottom structural element containing global action buttons:
  - `ADD ENTRY`
  - `SETTINGS`
  - `ABOUT`
- **Dialogs**:
  - **Bookmark Dialog**: Add/Edit/Delete a bookmark.
  - **Settings Dialog**: Manage categories, import/export data, and reset system.
  - **Color Picker**: Custom grid-based color selection for categories.
  - **About Dialog**: System information and credits.
  - **Confirmation Dialog**: Generic modal for destructive actions.

---

## 2. Data Model

All domain data is kept in memory inside a single `state` object and persisted to `localStorage`.

### 2.1 Types

#### Bookmark

Canonical shape:

- `id: string` (UUID)
- `title: string`
- `url: string`
- `categoryId: string` (Reference to a Category ID)
- `createdAt: number` (Stardate format, e.g., 41153.7)

Rules:
- `id` is globally unique.
- `title` is required.
- `url` is required and normalized (prefixed with `https://` if missing protocol).
- `categoryId` must exist in the `categories` array.

#### Category

Canonical shape:

- `id: string` (UUID)
- `name: string` (Uppercase display label)
- `color: string` (CSS hex code)
- `createdAt: number` (Stardate format)

Rules:
- `id` is unique.
- `name` is displayed in the sidebar.
- `color` determines the sidebar button color and the accent color of bookmarks within that category.

### 2.2 Default Data

On a fresh start (no `localStorage` data), the system initializes with:

**Categories:**
- `DATABANKS` (Color: `#ff9900`)

**Bookmarks:**
- `LCARS INTERFACE` (Link to `https://www.thelcars.com`)

### 2.3 In-Memory State

The application keeps a single state object:

```js
state = {
  bookmarks: Bookmark[],
  categories: Category[],
  currentCategory: string // ID of the currently selected category
}
```

---

## 3. Storage & Persistence

### 3.1 LocalStorage Key

All data is persisted under one `localStorage` key:

```text
STORAGE_KEY = "zander-lcars:v1"
```

### 3.2 Load/Save Behavior

- **Load**: On startup, the app attempts to parse the JSON string from `localStorage`.
  - If valid, `state` is populated.
  - If missing or invalid, default data is loaded.
- **Save**: On any mutation (add/edit/delete/import), the entire `bookmarks` and `categories` arrays are serialized to JSON and written to `localStorage`.

---

## 4. Import & Export

### 4.1 Export

- Generates a JSON file containing the current `bookmarks` and `categories` arrays.
- Filename format: `lcars-bookmarks-YYYY-MM-DD.json`.
- Triggered via the Settings dialog.

### 4.2 Import

- Accepts a `.json` file.
- **Behavior**: Full overwrite.
  - The user is prompted to confirm that existing data will be replaced.
  - If confirmed, the imported `bookmarks` and `categories` replace the current state.
  - The interface immediately re-renders.

---

## 5. Application Structure & Responsibilities

### 5.1 DOM Structure

- `.lcars-app`: Root container.
- `.header-bar`: Top LCARS structure.
- `.sidebar`: Contains `.cat-btn` elements.
- `.main-content`: Contains `.bookmark-grid` and `.status-display`.
- `.footer-bar`: Contains `.action-btn` elements.

### 5.2 Key JavaScript Functions

- **Initialization**:
  - `init()`: Bootstraps the app.
  - `loadData()`: Fetches from storage.
  - `setupEventListeners()`: Binds clicks and keyboard shortcuts.

- **Rendering**:
  - `renderCategories()`: Updates the sidebar based on `state.categories`.
  - `renderGrid()`: Updates the main content based on `state.currentCategory`.
  - `updateSystemStatus()`: Updates the decorative numbers in the status block.

- **Logic**:
  - `calculateStardate()`: Generates a TNG-era stardate based on the current time.
  - `saveBookmark()`: Handles creation and updates of bookmarks.
  - `deleteBookmark()`: Removes a bookmark.
  - `addCategory()`, `deleteCategory()`, `moveCategory()`: Category management logic.

- **Utilities**:
  - `generateUUID()`: Creates unique identifiers.
  - `escapeHtml()`: XSS prevention for rendering user input.
  - `normalizeUrl()`: Ensures URLs are valid.

### 5.3 Keyboard Shortcuts

The app supports global hotkeys for efficiency:
- `Alt + N`: Add New Entry (Bookmark).
- `Alt + S`: Open Settings.
- `Alt + C`: Add New Category (when in Settings).

---

## 6. Architectural Constraints

- **Single-File**: All code must remain in `index.html`.
- **Offline-First**: No external dependencies (fonts, scripts, styles) that require an internet connection, other than the bookmarks themselves.
- **Vanilla Web Technologies**: No frameworks. Standard HTML5, CSS3, and ES6+.