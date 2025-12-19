# Architecture & System Design

This document describes the high-level architecture, data model, and system behavior of the Zander LCARS Bookmark System. It is the technical source of truth for how the app is structured and how data flows.

For definitions of domain and UI terms used throughout this document, see the shared terminology in `GLOSSARY.md`.

---

## 1. High-Level Overview

### 1.1 Runtime Model

- **Single-file app**  
  - All HTML, CSS, and JavaScript live in a single file: `index.html`.  
  - No build step, bundler, or transpiler.
- **Execution environment**  
  - Runs directly in a modern browser.  
  - Must work when opened via `file://` (no HTTP server assumed).  
  - No external network dependencies for the UI (fonts, scripts, styles).
- **Persistence**  
  - All domain data is stored in `window.localStorage`.  
  - No backend, no cookies, no external database.
- **Import/Export**  
  - Users can export the complete dataset as a JSON file.  
  - Users can import a previously exported JSON file to replace the current data.

### 1.2 UI Shell & Views

The app is visually presented as a **LCARS-style console** built from a continuous frame:

- **Header Bar**  
  - Top structural element with the LCARS-style title and decorative top band.
- **Sidebar (Right Frame Column)**  
  - Vertical track containing:
    - Decorative caps (`.sidebar-top-cap`, `.sidebar-bottom-cap`) forming LCARS “elbows”.
    - A continuous `.sidebar-track` with category buttons rendered as `.cat-btn` elements.
- **Main Content (Left Pane)**  
  - **Bookmarks View** (default):
    - Bookmark “grid” rendered as tiles.
    - Bookmark “location” breadcrumb/path at the top showing the selected category hierarchy.
    - Status display with system metrics (categories, bookmarks, stardate).
  - **Settings View**:
    - Category configuration (nested tree, colors, ordering).
    - Import / Export controls.
    - System reset.
    - Diagnostic status text, including last import/reset stardate.
  - **About View**:
    - System name, code name, and credits.
    - Current stardate and Earth date (displayed and/or on hover).
- **Footer Bar**  
  - Bottom structural element with global action buttons:
    - `ADD ENTRY`
    - `SETTINGS`
    - `ABOUT`
  - System status block integrated into the footer region.

### 1.3 Dialogs

Dialogs are implemented with semantic `<dialog>` elements:

- **Bookmark Dialog (`#bookmarkDialog`)**  
  - Add / edit / delete a bookmark.
  - Includes:
    - Title input.
    - URL protocol selector (`http://` / `https://`) and URL input.
    - Category selector (supports nested categories via indentation).
    - Stardate & Earth date display for creation time.
- **Settings Dialog**  
  - Not a separate `<dialog>`: implemented as a main-content “view” panel (`.settings-panel`) toggled by the footer buttons.
- **Color Picker Dialog (`#colorPickerDialog`)**  
  - Grid-based LCARS color picker for category colors.
- **Confirm Dialog (`#confirmDialog`)**  
  - Generic confirmation for destructive actions (e.g., delete category, reset system, overwrite from import).
- **About Dialog**  
  - Implemented as a main-content “view” panel (`.about-panel`), not a `<dialog>`.

---

## 2. Data Model

All domain data is kept in memory inside a single `state` object and persisted to `localStorage`. The model supports **nested categories** (a tree).

### 2.1 Types

#### 2.1.1 Bookmark

Canonical shape:

```ts
type Bookmark = {
  id: string;         // UUID
  title: string;      // User-visible title
  url: string;        // Fully normalized URL, including protocol
  categoryId: string; // Reference to a Category.id
  createdAt: number;  // Stardate (e.g., 41153.7)
};
```

Rules:

- `id` is globally unique.
- `title` is required and trimmed.
- `url` is required:
  - Normalized via `normalizeUrl()`:
    - If no protocol is present and the value “looks like” a URL, `https://` is prefixed.
    - Otherwise the string is left as-is.
- `categoryId`:
  - Must reference an existing category in the category tree.
  - On category deletion, all bookmarks in that category subtree are also deleted.
- `createdAt`:
  - Stored as a TNG-era stardate number.
  - Never modified after creation (edit does not change `createdAt`).

#### 2.1.2 Category (Nested Tree)

Categories are stored as a **tree** of nested objects, not as a flat array.

Canonical shape:

```ts
type Category = {
  id: string;          // UUID
  name: string;        // Display name (generally uppercase)
  color: string;       // Hex color from LCARS palette (e.g., "#ff9966")
  createdAt: number;   // Stardate at creation time
  children: Category[];// Nested child categories
};
```

Rules:

- `id` is globally unique across the entire tree.
- `name` is displayed in:
  - Sidebar buttons.
  - Category dropdowns.
  - Location/breadcrumb path.
- `color`:
  - Drives the sidebar button background.
  - Drives bookmark tile accent color for bookmarks in this category subtree.
- `createdAt`:
  - Immutable once set.
- `children`:
  - Arbitrary depth supported.
  - Used for nested category rendering in:
    - Sidebar category hierarchy (via `.cat-wrapper` + `.cat-submenu`).
    - Settings category configuration list.

#### 2.1.3 App State

```ts
type State = {
  bookmarks: Bookmark[];
  categories: Category[]; // Root-level categories; each may contain children
  currentCategory: string | null; // Currently selected Category.id, or null for “All”
};
```

Notes:

- `currentCategory` drives:
  - Which bookmarks render in the grid.
  - The location path display (breadcrumb).
  - Default category when adding a new bookmark.

---

## 3. Default Data

On a fresh start (no valid `localStorage` data), the system initializes with **default categories** and **default bookmarks**. These are defined inline in `index.html`.

### 3.1 Default Categories

Shape (non-normative example — subject to design tuning):

```ts
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "category-main",
    name: "MAIN",
    color: "#ff9966",
    createdAt: <stardate>,
    children: []
  },
  {
    id: "category-databanks",
    name: "DATABANKS",
    color: "#ffcc99",
    createdAt: <stardate>,
    children: []
  }
  // Additional built-in categories may be defined.
];
```

Key points:

- All defaults are valid `Category` objects including `children: []`.
- `createdAt` values use `calculateStardate()` at initialization time.

### 3.2 Default Bookmarks

Example:

```ts
const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: "bookmark-lcars",
    title: "LCARS INTERFACE",
    url: "https://www.thelcars.com",
    categoryId: "category-databanks",
    createdAt: <stardate>
  }
];
```

---

## 4. Storage & Persistence

### 4.1 LocalStorage Key

All data is persisted under a single `localStorage` key:

```text
STORAGE_KEY = "zander-lcars:v1"
```

### 4.2 Load Behavior

At startup:

1. Read string from `localStorage.getItem(STORAGE_KEY)`.
2. If the value is:
   - **Missing**: load default data (`DEFAULT_BOOKMARKS`, `DEFAULT_CATEGORIES`).
   - **Present** but **invalid JSON**: fall back to defaults.
   - **Valid JSON**:
     - Verify that `bookmarks` and `categories` are arrays.
     - Coerce/validate nested categories shape (ensure `children` arrays exist).
     - If critical structure is missing or invalid, fall back to defaults.
3. Set `state` to the validated data.
4. If `state.currentCategory` is not set or refers to a non-existing category, default to:
   - The first available category id, or
   - `null` for “no category filter” if none exist.

### 4.3 Save Behavior

On any state mutation:

1. `state.bookmarks` and `state.categories` are deeply serialized.
2. `currentCategory` is included in the persisted object.
3. The full object is saved to `localStorage` in a single write operation.

Key properties of the saved JSON:

```ts
{
  bookmarks: Bookmark[],
  categories: Category[],
  currentCategory: string | null
}
```

---

## 5. Import & Export

Import/export is a **contract** for backing up and restoring the full bookmark system.

### 5.1 Export

- Triggered from the Settings panel via the `EXPORT DATA` button.
- Behavior:
  1. Capture current `state.bookmarks` and `state.categories`.
  2. Serialize as JSON:
     ```ts
     const data = {
       bookmarks: state.bookmarks,
       categories: state.categories
     };
     ```
  3. Create a Blob and transient `<a>` element to download the file.
- Filename format:
  - `lcars-bookmarks-YYYY-MM-DD.json`
  - Date is derived from the current Earth date at time of export.
- Notes:
  - `currentCategory` is **not** exported to keep the file focused on domain data.
  - This format is intended to remain stable for `v1`. Any breaking change requires explicit documentation.

### 5.2 Import

- Triggered from the Settings panel via the `IMPORT DATA` button and hidden file input.
- Behavior:
  1. User chooses a `.json` file from disk.
  2. File content is read as text and parsed as JSON.
  3. Validate structure:
     - Must be an object with:
       - `bookmarks: Array`
       - `categories: Array`
     - Basic structural validation only (no deep schema enforcement).
  4. If invalid:
     - Show an alert/notification explaining that the file could not be imported.
  5. If valid:
     - Compute simple counts:
       - `bookmarks.length`
       - Flattened `categories` count (including nested children).
     - Show a confirmation dialog summarizing that **existing data will be replaced**.
  6. On confirmation:
     - Replace `state.bookmarks` and `state.categories` with the imported values.
     - Reset `state.currentCategory`:
       - Either `null` or the first root category id, depending on implementation.
     - Persist to `localStorage`.
     - Re-render sidebar, grid, settings view, and system status.
  7. On cancel:
     - Discard imported data and leave state unchanged.

Semantics:

- Import is a **full overwrite** of existing data, not a merge.
- The imported data is trusted as authoritative for bookmarks and categories, subject to basic sanity checks.

---

## 6. Application Structure & Responsibilities

### 6.1 DOM Structure (Key Containers)

- `.lcars-app`  
  Root grid container for the entire LCARS console, including header, sidebar frame, main content, and footer.
- `.header-bar`  
  Top LCARS band with title text and decorative elements.
- `.sidebar-container`  
  Column on the right forming the vertical LCARS frame:
  - `.sidebar-top-cap`
  - `.sidebar-track`
  - `.sidebar-bottom-cap`
- `.main-content`  
  Central pane for primary application views:
  - Bookmarks grid (`.bookmark-grid`)
  - Settings panel (`.settings-panel`)
  - About panel (`.about-panel`)
  - Location display (`.bookmark-location`)
  - Status display (`.status-display`)
- `.footer-bar`  
  Bottom LCARS band with:
  - Global action buttons (`.action-btn`)
  - Status / meta display.

### 6.2 Views & Rendering Responsibilities

The app uses a simple view toggling approach rather than a routing framework:

- **Bookmarks View (`.main-view.bookmarks-view`)**
  - Controlled by:
    - `renderCategories()` (sidebar)
    - `renderGrid()` (bookmarks)
    - `updateBookmarkLocation()` (location path)
    - `updateSystemStatus()` (status block)
  - Visible when it has the `.active` class.

- **Settings View (`.main-view.settings-view`)**
  - Controlled by:
    - `renderCategoryConfig()` (category configuration list)
    - `updateSettingsStardate()` (settings header stardate)
  - Contains:
    - Category tree editor.
    - Color picker triggers.
    - Import/export/reset buttons.
  - Also toggled via `.active` class.

- **About View (`.main-view.about-view`)**
  - Controlled by:
    - `updateAboutStardate()` (about panel stardate and Earth date).
  - Shows read-only meta information and shortcuts.

Visibility of each view is controlled by an internal helper that adds/removes `.active` on `.main-view` elements based on the currently selected “mode” (BOOKMARKS, SETTINGS, ABOUT).

---

## 7. Key JavaScript Functions

### 7.1 Initialization & Lifecycle

- `init()`  
  - Called once on page load.
  - Responsibilities:
    - Load data from storage (`loadData()`).
    - Initialize state if storage is empty/invalid.
    - Render sidebar, bookmark grid, system status, and location.
    - Render settings and about views.
    - Setup event listeners and keyboard shortcuts.

- `loadData()`  
  - Reads from `localStorage` using `STORAGE_KEY`.
  - Parses and validates JSON.
  - Initializes `state`.

- `saveData()`  
  - Serializes `state` (bookmarks, categories, currentCategory) to JSON.
  - Writes to `localStorage`.

- `setupEventListeners()`  
  - Wires:
    - Footer buttons (ADD ENTRY, SETTINGS, ABOUT).
    - Dialog open/close behavior.
    - Form submissions (bookmark form).
    - Import file input change event.
    - Keyboard shortcuts (`Alt+N`, `Alt+S`, `Alt+C`, `Esc`).
    - Category sidebar clicks.
    - Category config controls (up/down/add/delete/color).

### 7.2 Rendering

- `renderCategories()`  
  - Rebuilds the sidebar from `state.categories` (tree).
  - Uses helper `createCategoryButton()` to:
    - Create `.cat-wrapper` with:
      - `.cat-btn` for each category.
      - Optional `.cat-submenu` for children.
    - Wire category selection events.
  - Also updates category `<select>` elements in forms via `addOptions()` helper.

- `renderGrid()`  
  - Filters `state.bookmarks` by `state.currentCategory`:
    - If `currentCategory` is `null`, show all bookmarks.
    - Else show bookmarks whose `categoryId` lies within the selected category subtree.
  - Creates `.bookmark-tile` elements:
    - Uses category color for tile background/accent.
    - Attaches click handler to open URL in a new tab.
    - Attaches edit icon handler to open edit dialog.

- `renderCategoryConfig()`  
  - Builds the settings category configuration list.
  - Traverses the nested `categories` tree via `processCategories()` helper.
  - For each category, `renderConfigRow()`:
    - Name input field.
    - Color swatch button (opens color picker).
    - Up/down movement controls.
    - Add child category button.
    - Delete category button.

- `updateSystemStatus()`  
  - Calculates:
    - Total category count (flattened across nested children).
    - Total bookmark count.
  - Writes values into the status display blocks.

- `updateBookmarkLocation()`  
  - Uses `getCategoryPath()` to compute the category path from root to `currentCategory`.
  - Renders it as a breadcrumb-like label at the top of the main content.

- `updateAboutStardate()` / `updateSettingsStardate()`  
  - Calculate the current stardate and corresponding Earth date.
  - Update readouts in the About and Settings panels.

### 7.3 Category Tree Operations

- `findCategoryAndParent(id, categories)`  
  - Recursively searches the category tree.
  - Returns:
    - `category`: found `Category`
    - `parent`: parent `Category` or `null` if root
    - `siblings`: array containing `category` and its siblings
    - `index`: index of `category` within `siblings`

- `addCategory(parentId | null)`  
  - Creates a new `Category`:
    - `id` via `generateUUID()`
    - `name` with a default template (e.g., `NEW CATEGORY`)
    - `color` from a default or parent’s color
    - `createdAt` from `calculateStardate()`
    - `children: []`
  - If `parentId` is `null`:
    - Adds to `state.categories` (root level).
  - Else:
    - Inserts into `children` of the specified parent.
  - Calls `saveData()` and rerenders sidebar + config.

- `moveCategory(id, direction)`  
  - Uses `findCategoryAndParent()` to obtain `siblings` and `index`.
  - Swaps positions with adjacent sibling based on `direction` (`up` / `down`).
  - Respects bounds (no movement past first/last).
  - Saves and rerenders.

- `deleteCategory(id)`  
  - Uses `findCategoryAndParent()` to identify the subtree to delete.
  - Computes:
    - `count` of bookmarks directly in that category.
    - `subCount` of bookmarks in its descendant categories.
  - Assembles a confirmation message summarizing effect.
  - If confirmed:
    - Deletes all bookmarks in the subtree via `deleteBookmarksInTree()`.
    - Removes category from `siblings`.
    - Adjusts `currentCategory` if it pointed into the removed subtree.
    - Saves and rerenders.

### 7.4 Bookmarks

- `openAddDialog()`  
  - Prepares empty bookmark form with defaults:
    - Category set to `currentCategory` if available.
    - Protocol defaulted to `https://`.
    - Stardate label for creation.
  - Shows `#bookmarkDialog`.

- `openEditDialog(bookmark)`  
  - Populates form fields from existing bookmark.
  - Splits URL into protocol + remainder for the protocol selector.
  - Displays bookmark’s `createdAt` stardate and Earth date.

- `saveBookmark(event)`  
  - Prevents default form submission.
  - Extracts values from form:
    - Title
    - Protocol
    - URL
    - Category id
  - Constructs normalized URL via `normalizeUrl(protocol, rawUrl)`.
  - If editing:
    - Updates existing bookmark in `state.bookmarks`.
  - If adding:
    - Creates new `Bookmark` with:
      - New `id`
      - `createdAt` from `calculateStardate()`
  - Saves and rerenders categories/grid/status/location.
  - Closes dialog.

- `deleteBookmark(id)`  
  - Removes the bookmark from `state.bookmarks`.
  - Saves and rerenders.

### 7.5 Utilities

- `calculateStardate(date = new Date())`  
  - Converts an Earth datetime to a TNG-era stardate:
    - Uses a base epoch (e.g., 41000.0).
    - Advances by ~1000 units per Earth year.
    - Returns a numeric stardate, typically with one decimal.
- `parseStardate(stardate)`  
  - Inverse helper to approximate Earth date from stardate.
  - Used for display in tooltips / dialogs alongside the numeric stardate.

- `getCategoryPath(categoryId)`  
  - Traverses up from the category to the root, producing:
    - `[{ id, name }, ...]` from root to leaf.
  - Used for location breadcrumb and for certain settings labels.

- `generateUUID()`  
  - Simple UUID/unique id generator (not cryptographically strong).
  - Used for `Bookmark.id` and `Category.id`.

- `escapeHtml(text)`  
  - Basic XSS protection when injecting text into innerHTML contexts.

- `normalizeUrl(protocol, value)`  
  - Strips leading protocol from input, then re-applies selected `protocol`.
  - If value does not look like a URL but starts with a protocol-like sequence, it is preserved.
  - Ensures saved URLs always include a protocol.

- `isProbablyUrl(value)`  
  - Heuristic to decide whether user input “looks like” a URL (contains dots, no spaces, etc.).
  - Used to decide when to prepend `https://`.

- `showConfirm(options)`  
  - Abstraction over the confirm dialog to accept callbacks for OK/Cancel.
  - Used by delete category, reset system, and import overwrite confirmation.

- `showAlert(message)`  
  - Simple alert abstraction, typically implemented as `window.alert()` or a styled LCARS overlay.

- `openColorPicker(categoryId)`  
  - Opens the color picker dialog positioned for a given category.
  - On selection:
    - Updates category color.
    - Saves and rerenders sidebar + settings.

- `exportData()`  
  - See section 5.1.

- `triggerImport()` / `handleImport(event)`  
  - See section 5.2.

- `resetSystem()`  
  - Confirms with the user.
  - Clears `localStorage` key for the app.
  - Restores defaults.
  - Reinitializes state and rerenders all views.

---

## 8. Keyboard Shortcuts

Global hotkeys (active when no text input has focus):

- `Alt + N`  
  - Open **Add Bookmark** dialog.
- `Alt + S`  
  - Switch to **Settings** view.
- `Alt + C`  
  - Add **New Category** in the Settings view (typically at root or selected context).
- `Esc`  
  - Close any open dialog (`<dialog>`) or revert to primary view when feasible.

Implementation details:

- A single `keydown` listener on `window`.
- Checks `event.altKey` and `event.code` / `event.key`.
- Ensures that shortcuts do not trigger when focus is inside an `<input>`, `<select>`, or `<textarea>` unless explicitly desired.

---

## 9. Architectural Constraints

- **Single-File**  
  - All application logic, styling, and markup are contained within `index.html`.
  - No separate JS or CSS bundles.

- **Offline-First**  
  - The UI must function fully without a network connection (other than external bookmark targets).
  - No external fonts, CDNs, or JavaScript libraries.

- **Vanilla Web Technologies**  
  - HTML5, CSS3 (Flexbox, Grid, Variables).
  - ES6+ JavaScript (no frameworks like React/Vue/Svelte).

- **Data Contract Stability**  
  - `Bookmark` and `Category` shapes as described above are considered stable for `v1`.
  - Import/export JSON format:
    - `{ bookmarks: Bookmark[], categories: Category[] }`
    - Backwards-compatible changes require care; breaking changes must be documented and versioned.

This document should be kept in sync with `index.html` whenever the data model, import/export behavior, or fundamental UI structure changes.