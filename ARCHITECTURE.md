# Architecture & System Design

This document describes the high-level architecture, data model, and system behavior of the Zander LCARS Bookmark System. It is the technical source of truth for how the app is structured and how data flows.

For definitions of domain and UI terms used throughout this document, see the shared terminology in `GLOSSARY.md`.

For accessibility standards, implementation requirements, and testing guidelines, see `ACCESSIBILITY.md`. The app targets **WCAG 2.1 Level AA** compliance.

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

The app is visually presented as a **LCARS-style console** built from a continuous frame. The shell uses standardized **LCARS shell bar primitives** (see `DESIGN.md` Section 11.4) that can be reused in other applications:

- **Header Bar** (primitive: `lcars-header-bar`)  
  - Top structural element with the LCARS-style title and decorative top band.
  - The `ZANDER` title in the header acts as a **Home control** (`lcars-header-bar-home`), returning to the main Bookmarks view when clicked or when the `Alt+H` keyboard shortcut is used.
  - Includes fill segment and end cap for connecting to the sidebar.
- **Sidebar (Right Frame Column)** (primitive: `lcars-sidebar-bar`)  
  - Vertical track containing:
    - Decorative caps (`lcars-sidebar-bar-top-cap`, `lcars-sidebar-bar-bottom-cap`) forming LCARS "elbows".
    - A continuous track (`lcars-sidebar-bar-track`) with category buttons rendered as `.cat-btn` elements.
  - The sidebar bar primitive supports variants:
    - `lcars-sidebar-bar--decorative` – purely visual, no interactive content.
    - `lcars-sidebar-bar--with-toggle` – includes a hamburger/menu toggle button.
- **Main Content (Left Pane)**  
  - **Bookmarks View** (default):
    - Bookmark "grid" rendered as tiles.
    - Bookmark "location" breadcrumb/path at the top showing the selected category hierarchy.
    - Status display with system metrics (categories, bookmarks, stardate).
  - **Settings View**:
    - Category configuration (nested tree, colors, ordering).
    - Theme selector and active theme readout.
    - Data management controls (export/import).
    - Danger Zone with system reset action.
    - Diagnostic status text, including last import/reset stardate.
  - **About View**:
    - System name, code name, and credits.
    - Current stardate and Earth date (displayed and/or on hover).
- **Footer Bar** (primitive: `lcars-footer-bar`)  
  - Bottom structural element with global action buttons:
    - `ADD ENTRY`
    - `SETTINGS`
    - `ABOUT`
  - System status block (`lcars-footer-bar-status` with `lcars-status-display`) integrated into the footer region.
  - Status display can be omitted if not needed; the footer bar works without it.

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
  - Internally organized into:
    - Category Configuration section.
    - Theme section.
    - Data Management section.
    - Danger Zone section containing the destructive System Reset control.
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
  id: string;          // UUID
  title: string;       // User-visible title (max 64 characters)
  description?: string; // Optional description (max 512 characters)
  url: string;         // Fully normalized URL, including protocol
  categoryId: string;  // Reference to a Category.id
  createdAt: string;   // Stardate string, e.g. "2025352.1200"
};
```

Rules:

- `id` is globally unique.
- `title` is required and trimmed. Maximum length: 64 characters.
- `description` is optional. Maximum length: 512 characters.
  - Displayed on bookmark tiles truncated to first 100 characters (with ellipsis if longer).
  - Full description is viewable and editable in the Bookmark Dialog (edit mode).
  - If empty or omitted, no description is shown on the tile.
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
  createdAt: string;   // Stardate string at creation time, e.g. "2025352.1200"
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
    id: "cat-databanks",
    name: "DATABANKS",
    color: "#ff9900",
    createdAt: "2025352.1200",
    children: [],
  },
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
    id: "bm-lcars",
    title: "LCARS INTERFACE",
    description: "Library Computer Access/Retrieval System reference.",
    url: "https://www.thelcars.com",
    categoryId: "cat-databanks",
    createdAt: "2025352.1200",
  },
];
```

Notes:
- `description` is optional; if omitted or empty, no description is shown on the tile.

---

## 4. Storage & Persistence

### 4.1 LocalStorage Keys and Themes

All bookmark and category data is persisted under a single `localStorage` key, and theme selection is persisted under a separate key:

```text
STORAGE_KEY        = "zander-lcars:v1"
THEME_STORAGE_KEY  = "zander-lcars-theme:v1"
```

Theme state is intentionally kept separate so that the JSON structure used for import/export remains `{ bookmarks, categories }` and does not need to change when theme support is added.

The available themes are defined as a simple array of `{ id, label }` pairs:

```ts
const THEMES = [
  { id: "laan", label: "LA'AN" },
  { id: "data", label: "DATA" },
  { id: "doctor", label: "THE DOCTOR" },
  { id: "chapel", label: "CHAPEL" },
  { id: "spock", label: "SPOCK" },
  { id: "mbenga", label: "M'BENGA" },
  { id: "seven", label: "SEVEN OF NINE" },
  { id: "shran", label: "SHRAN" },
];
```

Rules:

- `id` is the stable key stored under `THEME_STORAGE_KEY`.
- `label` is the user-facing label shown in theme controls and status readouts.
- The theme system is intentionally light-weight: themes swap LCARS color variables and minor styling details, but do not alter the data model or import/export format.

### 4.2 Load Behavior

At startup:

1. Read string from `localStorage.getItem(STORAGE_KEY)`.
2. If the value is:
   - **Missing**: keep in-memory defaults (`DEFAULT_BOOKMARKS`, `DEFAULT_CATEGORIES`).
   - **Present** but **invalid JSON**: log an error, show an LCARS-styled alert, and reset to defaults.
   - **Valid JSON**:
     - If `bookmarks` is an array, assign it to `state.bookmarks`.
     - If `categories` is a non-empty array, assign it to `state.categories`.
3. Run backfill utilities:
   - `backfillBookmarkCreatedAt(state.bookmarks)` to add `createdAt` to any legacy bookmarks that are missing it.
   - `backfillCategoryCreatedAt(state.categories)` to add `createdAt` to any legacy categories (recursively across `children`).
4. Ensure `state.currentCategory` refers to an existing category:
   - If the current id is missing or invalid, fall back to the first available category id, or `cat-databanks` if none are found.

### 4.3 Save Behavior

On any state mutation affecting bookmarks or categories:

1. `state.bookmarks` and `state.categories` are deeply serialized.
2. Theme is **not** included in this payload (it is stored separately).
3. The object is saved to `localStorage` in a single write operation:

```ts
{
  bookmarks: Bookmark[],
  categories: Category[],
  landingCategoryId: string | null,
  currentCategory: string | null,
  currentView: "bookmarks" | "settings" | "about",
  currentSettingsPage: "categories" | "home" | "themes" | "data" | "reset" | null,
}
```

Notes:

- **View state persistence**: The app preserves navigation state across page refreshes:
  - `currentCategory`: The currently selected category in the bookmark view.
  - `currentView`: Which main view is active (bookmarks, settings, or about).
  - `currentSettingsPage`: Which settings sub-page is active (or `null` for the main settings grid).
- On load, these values are validated; invalid ids fall back to defaults.
- Theme selection is saved independently via `localStorage.setItem(THEME_STORAGE_KEY, currentTheme)`.

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
       categories: state.categories,
     };
     ```

  3. Create a Blob and trigger a download of a `.json` file (e.g. `lcars-bookmarks-YYYY-MM-DD.json`).

Notes:

- Theme selection and any other UI-only metadata are **not** included in export.
- The exported structure is intentionally minimal to keep the contract stable:

```ts
type ExportBundle = {
  bookmarks: Bookmark[];
  categories: Category[];
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

- Triggered from the Settings panel via the `IMPORT DATA` button.
- Behavior:
  1. User selects a JSON file from disk.
  2. The file is read as text and parsed as JSON.
  3. Basic validation ensures:
     - `bookmarks` is an array.
     - `categories` is an array.
  4. A confirmation dialog (“overwrite” style) is shown summarizing counts.
  5. On confirmation, an internal helper:

     ```ts
     function applyDataBundle(bundle: ExportBundle) {
       // Bookmarks are validated one-by-one. Invalid bookmarks (missing required
       // fields or invalid URLs) are discarded; valid ones are kept.
       state.bookmarks = validateImportedBookmarks(bundle.bookmarks);
       // Categories are validated as a tree. Structurally invalid categories
       // (missing `id` or `name`) are discarded. Category colors that are not
       // part of the LCARS palette are not rejected; instead, they are
       // normalized to a theme‑appropriate default color, and the import
       // summary reports how many colors were reset.
       state.categories = normalizeImportedCategoryTree(bundle.categories);
       backfillBookmarkCreatedAt(state.bookmarks);
       backfillCategoryCreatedAt(state.categories);
       saveData();
       renderCategories();
       renderGrid();
       updateAboutStardate();
       updateSettingsStardate();
     }
     ```

  6. `applyDataBundle` is called and all primary views are re-rendered. After import,
     the UI shows a summary dialog indicating:
     - How many bookmarks and categories were successfully imported.
     - How many bookmarks and categories were discarded due to validation errors.
     - How many category colors were reset to the current theme’s default.

Notes:

- Import is a **full overwrite** of bookmarks and categories in memory, but validation
  is performed **per item**:
  - Valid bookmarks are kept; invalid bookmarks are discarded.
  - Structurally valid categories are kept; invalid categories are discarded.
  - Category colors outside the LCARS palette are overridden to a theme‑appropriate
    default rather than causing the category to be dropped.
- Existing theme selection is preserved; import does not affect `THEME_STORAGE_KEY`.

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

The app uses a simple view toggling approach rather than a routing framework. Even though the exact class names are implementation details of `index.html`, the responsibilities are stable:

- **Bookmarks View**
  - Controlled by:
    - `renderCategories()` (sidebar)
    - `renderGrid()` (bookmarks)
    - `updateBookmarkLocation()` (location path)
    - `updateSystemStatus()` (status block)
  - Visible when its `.main-view` container has the `.active` class.

- **Settings View**
  - Controlled by:
    - `renderCategoryConfig()` (category configuration list)
    - `updateSettingsStardate()` (settings header stardate)
    - `renderThemeControls()` (theme selection UI)
    - `updateThemeStatus()` (theme readout)
  - Contains:
    - Category tree editor.
    - Color picker triggers.
    - Import/export/reset buttons.
  - Also toggled via `.active` class.

- **About View**
  - Controlled by:
    - `updateAboutStardate()` (about panel stardate and Earth date).
  - Shows read-only meta information and shortcuts.

Visibility of each view is controlled by logic that adds/removes `.active` on `.main-view` elements based on the currently selected “mode” (BOOKMARKS, SETTINGS, ABOUT).

---

## 7. Key JavaScript Functions

### 7.1 Initialization & Lifecycle

- `init()`  
  - Called once on page load.
  - Responsibilities:
    - Load data from storage (`loadData()`).
    - Load theme from storage (`loadTheme()`).
    - Apply the current theme (`applyTheme()` / `setTheme()`).
    - Render sidebar, bookmark grid, and status.
    - Render settings and about views.
    - Render theme controls and theme status.
    - Setup event listeners and keyboard shortcuts.
    - Initialize stardate readouts in About and Settings.

- `loadData()`  
  - Reads from `localStorage` using `STORAGE_KEY`.
  - Parses JSON and selectively adopts `bookmarks`, `categories`, `landingCategoryId`, `currentCategory`, `currentView`, and `currentSettingsPage`.
  - Runs `backfillBookmarkCreatedAt()` and `backfillCategoryCreatedAt()` to ensure missing `createdAt` values are filled with a current stardate.
  - Validates `currentCategory` using `getCategoryPath()` to support nested categories; falls back to first root category if invalid.
  - Validates `currentView` against allowed values (`"bookmarks"`, `"settings"`, `"about"`); defaults to `"bookmarks"`.
  - Validates `currentSettingsPage` against allowed sub-page ids; defaults to `null`.

- `saveData()`  
  - Serializes `{ bookmarks, categories, landingCategoryId, currentCategory, currentView, currentSettingsPage }` to JSON.
  - Writes to `localStorage` under `STORAGE_KEY`.

- `applyViewState()`  
  - Called during `init()` after `loadData()`.
  - Switches the active main view based on `currentView`.
  - If `currentView` is `"settings"`, also calls `renderSettingsView()` to restore the correct settings sub-page.

- `loadTheme()`  
  - Reads `THEME_STORAGE_KEY` from `localStorage`.
  - If the stored id matches one of the configured `THEMES`, applies it via `setTheme()`.
  - Otherwise, defaults to the primary theme (e.g. `"pickard"`).

- `setTheme(themeId)` / `applyTheme(themeId)`  
  - Validates the requested theme against `THEMES`.
  - Sets `currentTheme`, updates the `data-theme` attribute on `<body>`.
  - Persists the selection under `THEME_STORAGE_KEY`.
  - Updates the theme status readout.

- `setupEventListeners()`  
  - Wires:
    - Footer buttons (ADD ENTRY, SETTINGS, ABOUT).
    - Dialog open/close behavior.
    - Form submissions (bookmark form).
    - Import file input change event.
    - Keyboard shortcuts (`Alt+N`, `Alt+S`, `Alt+C`, `Esc`).
    - Category sidebar clicks.
    - Category config controls (up/down/add/delete/color).
    - Theme selection buttons in Settings.

### 7.2 Rendering

- `renderCategories()`  
  - Rebuilds the sidebar from `state.categories` (tree).
  - Uses helper `createCategoryButton(cat, level)` to:
    - Create `.cat-wrapper` with:
      - `.cat-btn` for each category.
      - Optional `.cat-submenu` for children (up to a configured depth).
    - Wire category selection events:
      - Selecting a category forces the Bookmarks view active.
      - Updates `state.currentCategory`, then re-renders categories and grid.
    - Apply the category’s `color` via a CSS custom property.
  - Also updates category `<select>` elements in forms via `addOptions()` helper, which indents nested categories using non‑breaking spaces and a tree branch glyph.
  - Calls `updateSystemStatus()` and `updateBookmarkLocation()` after rendering.

- `renderGrid()`  
  - Filters `state.bookmarks` by `state.currentCategory`.
  - Creates `.bookmark-tile` elements via `createBookmarkTile(bookmark)`:
    - Uses the category’s color (if available) as the tile accent color.
    - Renders title, URL, and an edit icon.
    - Makes the tile an anchor with `target="_blank"` and `rel="noopener noreferrer"`.
    - Attaches handlers for:
      - Edit icon click (open edit dialog).
      - Context menu/right‑click (optional edit shortcut).
  - Shows or hides the empty‑state message depending on results.
  - Calls `updateSystemStatus()` and `updateBookmarkLocation()`.

- `renderCategoryConfig()`  
  - Builds the Settings “Category Configuration” list from the category tree.
  - Renders one `.category-config-row` per category via `renderConfigRow()`, including:
    - Name input field.
    - Color swatch (opens Color Picker).
    - Up/Down movement controls.
    - Add‑child button.
    - Delete button.
  - Typically uses a tree traversal helper (`walkCategories`) to visit categories in depth-first order for rendering.

- `renderThemeControls()`  
  - Renders a set of theme selection buttons in the Settings view.
  - Iterates over `THEMES` to produce one control per theme.
  - Applies a visual “selected” state to the active theme.
  - Wires click events that call `setTheme(theme.id)`.

- `updateSystemStatus()`  
  - Computes:
    - Category count (currently total of root categories; in some versions this may be flattened across the tree).
    - Bookmark count (`state.bookmarks.length`).
  - Updates `.status-display` (e.g. `CT: <catCount> · BM: <bmCount>`).

- `formatCurrentStardateDisplay()`  
  - Helper that:
    - Calls `calculateStardate()` for the current time.
    - Calls `parseStardate()` to get an approximate `Date`.
    - Returns `{ stardate, label, tooltip }` where:
      - `label` is a string like `"STARDATE 2025352.1200"`.
      - `tooltip` is a localized date string (or `""` if parsing fails).

- `updateAboutStardate()` / `updateSettingsStardate()`  
  - Use `formatCurrentStardateDisplay()` to update the stardate/tooltip fields in About and Settings.

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

- `walkCategories(rootCategories, visitor, parent = null, depth = 0)`  
  - Generic tree-walk used by multiple features.
  - Iterates categories depth‑first, calling `visitor(cat, parent, depth, index, siblings)`.
  - If `visitor` returns a non‑`undefined` value, traversal halts and that value is returned.
  - Used for:
    - Searching for a category and its parent.
    - Building flattened lists for config UI.
    - Computing paths.

- `findCategoryAndParent(id, categories)`  
  - Uses `walkCategories` internally.
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
  - Prepares the bookmark form for creating a new bookmark:
    - Clears existing form values.
    - Sets the category to `state.currentCategory` if available.
    - Sets the protocol select (e.g. `https://`).
    - Updates the stardate label using `formatCurrentStardateDisplay()`.
  - Hides the Delete button in the dialog.
  - Shows `#bookmarkDialog` as a modal.

- `openEditDialog(bookmark)`  
  - Populates form fields from an existing bookmark:
    - Fills title and URL.
    - Splits the URL into protocol and remainder for the protocol selector.
    - Selects the bookmark’s category.
  - Displays bookmark’s `createdAt` stardate and its derived Earth date (via `parseStardate()`).
  - Shows the Delete button in the dialog.
  - Opens `#bookmarkDialog` in edit mode.

- `saveBookmark(event)`  
  - Prevents default form submission.
  - Extracts values from the form:
    - Title
    - Protocol
    - URL (body)
    - Category id
  - Normalizes the URL via `normalizeUrl(protocol, rawUrl)`:
    - Ensures a protocol is always present.
  - If an existing `id` is present:
    - Updates the bookmark in `state.bookmarks` in‑place (keeping its `createdAt`).
  - Otherwise:
    - Creates a new `Bookmark`:
      - `id` from `generateUUID()`.
      - `createdAt` from `calculateStardate()`.
  - Saves data and re-renders categories, grid, status, and location.
  - Closes the dialog.

- `deleteBookmark(id)`  
  - Removes the bookmark from `state.bookmarks`.
  - Saves and re-renders.
  - Typically invoked from the bookmark dialog or a context menu action.

### 7.5 Utilities

- `calculateStardate(date = new Date())`  
  - Converts an Earth datetime to a stardate string in the form `YYYYDDD.MMMM`:
    - `YYYY`: four‑digit year.
    - `DDD`: day of year (1–365/366) zero‑padded to 3 digits.
    - `MMMM`: minutes since midnight zero‑padded to 4 digits.
  - Example: `"2025352.1200"`.

- `parseStardate(stardate)`  
  - Parses a stardate string of the form `YYYYDDD.MMMM` back into a `Date`:
    - Extracts year, day of year, and minutes.
    - Returns `null` if parsing fails.
  - Used for display in tooltips and dialogs alongside `createdAt`.

- `getCategoryPath(categoryId)`  
  - Traverses from the category to the root (using the tree structure) to produce its path.
  - Used by `updateBookmarkLocation()` to render the location/breadcrumb bar.

- `generateUUID()`  
  - Simple unique id generator for bookmarks and categories (not cryptographically strong).

- `escapeHtml(text)`  
  - Basic XSS protection when injecting user text via `innerHTML`.

- `normalizeUrl(protocol, value)`  
  - Trims the URL, removes any leading protocol/body mismatch, and re-applies the chosen `protocol`.
  - Ensures that saved URLs always include a protocol.

- `isProbablyUrl(value)`  
  - Heuristic to decide whether the user’s input looks like a URL.
  - Used to decide when to auto‑prefix `https://` for convenience.

- `showConfirm(title, message, onOk)`  
  - Abstraction over the LCARS confirmation dialog (`#confirmDialog`).
  - Wires OK/Cancel handlers and resets them after the dialog closes.

- `showAlert(title, message)`  
  - LCARS-styled alert built on top of the same confirm dialog, temporarily hiding the Cancel button and changing the OK label.

- `openColorPicker(currentColor, onSelect)`  
  - Opens the Color Picker dialog.
  - Renders one `.color-option` per entry in `LCARS_PALETTE`.
  - Highlights the currently selected color.
  - Calls `onSelect(color)` when a color is chosen, then closes the dialog.

- `exportData()`  
  - Implements the export flow described in section 5.1.

- `triggerImport()` / `handleImport(event)`  
  - Implement the import flow described in section 5.2.

- `resetSystem()`  
  - Confirms with the user, then restores the default data bundle and re-renders all views.

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

- `Alt + H`  
  - Go **Home** (Bookmarks view).
- `Alt + B`  
  - Open **Add Bookmark** dialog.
- `Alt + S`  
  - Switch to **Settings** view.
- `Alt + C`  
  - Add **New Category** (opens Add Category dialog).
- `Esc`  
  - Close any open dialog (`<dialog>`) or revert to primary view when feasible.
- `Enter`  
  - Submit the active dialog form (Add Bookmark, Add Category, etc.).

Implementation details:

- A single `keydown` listener on `document`.
- Checks `event.altKey` and `event.code` / `event.key`.
- Ensures that shortcuts do not trigger when focus is inside an `<input>`, `<select>`, or `<textarea>` unless explicitly desired.
- Dialog forms do **not** use `method="dialog"` to ensure Enter key properly triggers form submission via the `submit` event listener.

### Add Entry Menu Navigation

The footer `ADD ENTRY` button has a popup menu (BOOKMARK, CATEGORY) with full keyboard support:

- **Tab to Add Entry**: Focus lands on the button; menu expands automatically (via CSS `:focus-within`).
- **Tab through menu**: Focus moves Add Entry → BOOKMARK → CATEGORY → SETTINGS.
- **Enter/Space on menu item**: Triggers the corresponding action (opens dialog).
- **Click on Add Entry**: Moves focus to the first menu item (BOOKMARK).
- Menu items use the same white focus bar style as footer buttons (bar on top edge).

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