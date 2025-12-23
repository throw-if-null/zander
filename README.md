# Zander LCARS Bookmark System

**Zander** is a single‑file, offline‑first bookmark manager with a high‑fidelity **LCARS (Library Computer Access and Retrieval System)** interface, inspired by *Star Trek: The Next Generation*.

The entire app runs in your browser as a single `index.html` file:

- No backend, no build steps, no bundlers.
- No external CSS/JS libraries or fonts.
- All data is stored locally in `localStorage`.
- Import/Export lets you move your data between browsers and machines.

---

## Features

- **Authentic LCARS UI**
  - Continuous LCARS "elbow" frame wrapping header, sidebar, and footer.
  - Pill buttons, elbow connectors, and a neon‑style focus glow.
  - System status readout, stardates, and console‑like labels.
  - Built for accessibility (WCAG 2.1 Level AA).

- **Single‑File App**
  - One `index.html` file containing HTML, CSS, and JavaScript.
  - Works directly via `file://` in any modern browser.

- **Local Privacy**
  - Bookmarks and categories live only in your browser’s `localStorage`.
  - No accounts, no tracking, no network dependencies (beyond your bookmarks’ URLs).

- **Category Management with Nesting**
  - Create, rename, reorder, and delete categories.
  - Hierarchical categories (parent/child “trees”).
  - Category colors control both sidebar buttons and bookmark accents.
  - Deleting a category can cascade‑delete its entire subtree of bookmarks.

- **Bookmark Management**
  - Add, edit, and delete bookmarks.
  - Per‑bookmark LCARS stardate and derived Earth date.
  - Smart URL normalization and protocol handling.

- **System Views**
  - **Bookmarks View** – Main grid of tiles, filtered by category.
  - **Settings View** – Category configuration, data management, system status.
  - **About View** – System overview, version, and keyboard shortcuts.

- **Stardates**
  - LCARS-style stardate string stored in `createdAt` (format `YYYYDDD.MMMM`, e.g. `2025352.1200`).
  - Human‑readable Earth date shown alongside the stardate in dialogs.

- **Themes**
  - Multiple LCARS themes (e.g. LA'AN, DATA, THE DOCTOR, CHAPEL, SPOCK, M'BENGA, SEVEN OF NINE, SHRAN).
  - Theme choice affects colors and accents only; data and layout stay the same.

- **Import/Export**
  - Export full bookmark+category state to JSON.
  - Import JSON to fully replace the current state.

- **Keyboard Shortcuts**
  - Power-user hotkeys for common actions (see below), including a dedicated **Home** shortcut (`Alt + H`) that jumps back to the main Bookmarks view.
  - Full keyboard navigation: Tab through elements, Enter/Space to activate, Escape to close dialogs.

- **Accessibility**
  - Full keyboard navigation (no mouse required).
  - High-contrast LCARS palette with neon focus indicators.
  - Semantic HTML and screen-reader support.
  - See `ACCESSIBILITY.md` for full details and testing guidelines.

- **Responsive within LCARS Constraints**
  - Layout adapts to various viewport sizes while preserving the LCARS frame and proportions as much as possible.

---

## Getting Started

1. **Download**
   - Save `index.html` from this repository to your computer.

2. **Open**
   - Double‑click `index.html`, or open it from your browser’s *File → Open* menu.
   - Any modern browser (Chrome, Firefox, Edge, Safari) should work.

3. **Use**
   - Start with the built‑in demo categories and bookmarks.
   - Add your own categories and links, then export for backup if desired.

> Note: Because Zander uses `localStorage`, your data is **per‑browser and per‑device**. Export your data if you want to move it elsewhere.

---

## Interface Overview

The layout is a continuous LCARS “C‑shaped” frame wrapping the content:

1. **Header Bar (Top‑Left)**
   - Displays the system title and decorative LCARS band.
   - The `ZANDER` title in the header acts as a **Home control**: clicking it returns to the main Bookmarks view (same behavior as `Alt + H`).
   - Connects into the sidebar via the **top elbow** (`.sidebar-top-cap`).

2. **Sidebar (Right Column)**
   - Continuous vertical LCARS bar with:
     - **Top Cap** – Curved connector linking header to sidebar (`.sidebar-top-cap`).
     - **Track** – Vertical bar containing category buttons (`.sidebar-track`).
     - **Bottom Cap** – Curved connector linking sidebar to footer (`.sidebar-bottom-cap`).
   - Category buttons (`.cat-btn`) are stacked along the sidebar track.
   - The active category visually “lights up”.

3. **Main Content Area (Left Column)**
   - Sits inside the open side of the “C” frame.
   - Contains:
     - **Location/Path Display** – Shows the current category path (e.g. `DATABANKS ▸ LCARS ▸ REFERENCE`).
     - **Main View Container** – One active panel at a time:
       - **Bookmarks View** – Grid of bookmark tiles.
       - **Settings View** – Category config + data tools.
       - **About View** – System info, stardate, and shortcuts.
     - **Status Display** – Decorative system status block with category/bookmark counts and current stardate.

4. **Footer Bar (Bottom‑Left)**
   - LCARS footer band connected to the sidebar via the **bottom elbow**.
   - Contains global action buttons:
     - `ADD ENTRY`
     - `SETTINGS`
     - `ABOUT`

All dialogs are implemented using native `<dialog>` elements with custom LCARS styling.

---

## Using the App

### 1. Managing Bookmarks

**Add Bookmark**

- Click `ADD ENTRY` in the footer, then select `BOOKMARK` from the menu, or press `Alt + B`.
- In the **Bookmark** dialog:
  - Enter a **Title**.
  - Enter a **URL**:
    - If you omit the protocol, the app can prepend `https://` when saving.
  - Select a **Category**:
    - Defaults to the current category from the sidebar.
  - Confirm to save.

**Edit Bookmark**

- Hover over a bookmark tile to reveal the edit icon.
- Click the pencil icon to open the **Edit Bookmark** dialog.
- Update title, URL, or category and save.

**Delete Bookmark**

- Open the **Edit Bookmark** dialog for the bookmark.
- Click `DELETE` and confirm in the confirmation dialog.

**Open Bookmark**

- Click anywhere on a bookmark tile (except the edit icon).
- The URL opens in a new tab/window, depending on browser settings.

---

### 2. Category Management (Including Nested Categories)

Category management lives primarily in the **Settings** view.

1. Click `SETTINGS` in the footer, or press `Alt + S`.
2. In the **Category Configuration** section you will see a list/tree of configured categories.

Each category row provides:

- **Name Field**
  - Inline editable text input.
  - Displayed as uppercase in the sidebar.

- **Color Swatch**
  - Clicking opens the **LCARS Color Picker** dialog.
  - Choose from the LCARS palette; the sidebar button and bookmark accents adopt this color.

- **Reorder Controls**
  - `▲` / `▼` controls to move a category up or down among its siblings.
  - Reordering is local to the category’s level in the tree.

- **Add Child / Add Sibling**
  - Controls to create new categories attached to the current one.
  - Newly created categories are initialized with a default LCARS color and current stardate.

- **Delete**
  - Removes the category (and, optionally, its subtree).
  - Confirm dialog describes how many bookmarks and subcategories will be affected.

#### Nested Category Behavior

- Categories are stored in a **tree** (each category can have a `children` array).
- In the sidebar, nested categories are rendered as indented buttons, with a visual hierarchy.
- The currently active category determines:
  - Which bookmarks are displayed.
  - The category path shown in the **Bookmark Location** area.
- Deleting a category:
  - Cascades over its entire subtree (all child categories and their bookmarks) according to the confirmation message.

---

### 3. Views: Bookmarks, Settings, About

The main content region has three primary views, toggled via footer buttons and internal controls.

#### Bookmarks View

- Default view when the app loads.
- Shows:
  - **Category Path** – e.g., `DATABANKS ▸ LCARS`.
  - **Bookmark Grid** – Tiles representing bookmarks for the selected category.
  - **System Status Block** – Live counts of categories and bookmarks plus current stardate.
- When there are no bookmarks in the selected category:
  - An empty state message encourages adding a new entry.

#### Settings View

- Accessible from the footer `SETTINGS` button or `Alt + S`.
- Contains:
  - **Category Configuration**
    - Tree view of categories with:
      - Name editing
      - Color selection
      - Reordering
      - Adding/removing categories
  - **Theme**
    - Theme selector buttons using LCARS button styling.
    - Status readout of the currently active theme.
  - **Data Management**
    - `EXPORT DATABASE` button
    - `IMPORT DATABASE` button (opens file picker)
  - **Danger Zone**
    - `SYSTEM RESET` button (wipe everything back to defaults), visually grouped and labeled as a destructive action.
  - **Status Panel**
    - Decorative system status, stardate, and counts.

#### About View

- Accessible via the footer `ABOUT` button.
- Displays:
  - System name and federation-style vendor line.
  - System info summary (single‑file, offline‑capable archive).
  - Version string.
  - Keyboard shortcuts summary.

---

## Import, Export & Reset

All data operations are handled through the **Settings** view.

### Export Data

1. Open **Settings**.
2. Click `EXPORT DATA`.
3. Your browser downloads a `.json` file with your current:
   - Categories (including nested structure).
   - Bookmarks.
4. Save this file somewhere safe. You can import it later on the same or another device.

The export format is a JSON object with two top‑level arrays: `bookmarks` and `categories`.

### Import Data

1. Open **Settings**.
2. Click `IMPORT DATA`.
3. Choose a previously exported `.json` file.
4. Confirm the overwrite in the confirmation dialog.

**Important:**
- Import is a **full overwrite**:
  - Existing categories and bookmarks are replaced by the contents of the file.
- The UI re‑renders immediately to reflect the imported structure.

### Reset System

1. Open **Settings**.
2. Use the `RESET SYSTEM` action.
3. Confirm the reset.

This clears the app’s `localStorage` and restores the default demo categories and bookmarks.

---

### Keyboard Shortcuts

| Shortcut   | Action                               |
|-----------|---------------------------------------|
| `Alt + H` | Go **Home** (Bookmarks view)          |
| `Alt + B` | Open **Add Bookmark** dialog          |
| `Alt + S` | Open **Settings** view                |
| `Alt + C` | Open **Add Category** dialog          |
| `Esc`     | Close the active dialog (if any)      |
| `Enter`   | Submit the active dialog form         |

Keyboard focus styles follow a consistent LCARS pattern:

- Sidebar category buttons and footer action buttons use a white focus bar rendered via `:focus-visible::after` on one edge of the control.
- The header title button (`ZANDER`) also uses a white focus line along its bottom edge when focused via keyboard.
- Add Entry menu items (BOOKMARK, CATEGORY) use a white focus bar along the top edge.
- A more generic focus outline is used for other focusable elements that do not have custom LCARS button styling.

#### Add Entry Menu Navigation

The `ADD ENTRY` button in the footer has a popup menu with `BOOKMARK` and `CATEGORY` options. Full keyboard navigation is supported:

- **Tab to Add Entry**: Focus lands on the button with a visible focus bar; the menu expands automatically so keyboard users can see the available options.
- **Tab again**: Focus moves to `BOOKMARK` (focus bar on top).
- **Tab again**: Focus moves to `CATEGORY` (focus bar on top).
- **Tab again**: Focus moves to `SETTINGS`; the menu closes.
- **Enter/Space on menu item**: Opens the corresponding dialog.
- **Click on Add Entry**: Moves focus to the first menu item (`BOOKMARK`).

Browser or OS‑level shortcuts may conflict; when they do, those take precedence.

---

## Technical Details

### Architecture

- Monolithic `index.html` file.
- Pure HTML5, CSS3, and vanilla ES6+ JavaScript.
- No build tools or transpilation.

### Data Model

**Local Storage Keys**

- Bookmark and category data is saved under:

  - `zander-lcars:v1`

- Theme selection is saved separately under:

  - `zander-lcars-theme:v1`

**Bookmark**

- Stored shape (conceptual):

```json
{
  "id": "uuid",
  "title": "Example Site",
  "url": "https://example.com",
  "categoryId": "uuid-of-category",
  "createdAt": "2025352.1200"
}
```

**Category (Tree Node)**

```json
{
  "id": "uuid",
  "name": "DATABANKS",
  "color": "#ff9900",
  "createdAt": "2025352.1200",
  "children": [
    {
      "id": "child-uuid",
      "name": "LCARS",
      "color": "#cc99cc",
      "createdAt": "2025352.1200",
      "children": []
    }
  ]
}
```

**In‑Memory State (Conceptual)**

```json
{
  "bookmarks": [ /* Bookmark[] */ ],
  "categories": [ /* Category tree roots */ ],
  "currentCategory": "uuid-of-current-category"
}
```

### Core Logic Highlights

- **Stardates**
  - `calculateStardate()`:
    - Computes a stardate string in the form `YYYYDDD.MMMM` (year + day-of-year + minutes).
  - `parseStardate()`:
    - Converts a stored stardate string back to an approximate Earth `Date`.

- **Category Tree Operations**
  - `findCategoryAndParent()`:
    - Locates a category node and its parent in the nested tree.
  - `addCategory()`, `moveCategory()`, `deleteCategory()`:
    - Mutate the tree (and handle cascading bookmark deletion).

- **Rendering**
  - `renderCategories()`:
    - Builds the sidebar category tree and updates the category selector(s) in dialogs.
  - `renderGrid()`:
    - Renders bookmark tiles for the current category.
  - `renderCategoryConfig()`:
    - Renders the nested category configuration list used in Settings.
  - `updateSystemStatus()`:
    - Updates the status display with counts and stardate.

- **Storage**
  - `loadData()`:
    - Reads and parses `localStorage`. If missing/invalid, seeds defaults.
  - `saveData()`:
    - Serializes the entire `state` (bookmarks + categories) to `localStorage` after every mutation.

- **Utilities**
  - `generateUUID()` – ID generation.
  - `escapeHtml()` – Basic XSS‑safe rendering of user input.
  - `normalizeUrl()` / `isProbablyUrl()` – URL detection and normalization.

---

## Default Data

On first load (or after a reset), Zander initializes with:

- A small set of LCARS‑themed categories.
- A few demo bookmarks to showcase the UI and layout.

You’re expected to customize or delete these entries as you go.

---

## Credits

Zander is a fan‑made tribute to the LCARS interface from *Star Trek: The Next Generation*.

This is a personal project for educational and fan purposes. Star Trek and LCARS are properties of Paramount/CBS.

For definitions of terms used in this README (e.g., “bookmark”, “category”, “LCARS frame”, “view”), see `GLOSSARY.md`. It describes the shared vocabulary used across the app, docs, and code.