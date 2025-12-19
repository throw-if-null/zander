# Zander LCARS Bookmark System

**Zander** is a single-file, offline-first bookmark manager designed with a high-fidelity **LCARS (Library Computer Access and Retrieval System)** interface, inspired by *Star Trek: The Next Generation*.

It runs entirely in your browser with no backend, no build steps, and no external dependencies. Your data is stored locally in your browser.

---

## Features

- **Authentic LCARS UI**: Custom CSS implementation of the 24th-century interface, featuring elbow connectors, pill buttons, and a "neon glow" focus system.
- **Single File**: The entire app lives in one `index.html` file.
- **Local Privacy**: All data is stored in your browser's `localStorage`. No cloud, no tracking.
- **Category Management**: Create, rename, reorder, delete, and color-code your bookmark categories.
- **Stardates**: All entries are timestamped with a TNG-era Stardate calculator.
- **Import/Export**: Backup your data to JSON or migrate it to another device.
- **Keyboard Shortcuts**: Power-user hotkeys for common actions.
- **Responsive**: Adapts to different screen sizes (within reason for an LCARS layout).

---

## Getting Started

1. **Download**: Save the `index.html` file to your computer.
2. **Open**: Double-click the file to open it in any modern web browser (Chrome, Firefox, Edge, Safari).
3. **Enjoy**: Start adding your bookmarks!

*Note: Since Zander uses `localStorage`, your bookmarks are tied to the specific browser and computer you are using. Use the Export feature to move data between browsers.*

---

## Interface Overview

The interface is divided into four main sections:

1.  **Header Bar**: Contains the system title and the top structural arc.
2.  **Sidebar (Left)**: Your navigation hub. Click category buttons here to filter the bookmark grid.
3.  **Main Display (Right)**:
    - **Grid**: Displays your bookmarks as interactive tiles.
    - **Status Block**: A decorative data readout showing system stats (category count, bookmark count, current stardate).
4.  **Footer Bar**: Contains global action buttons (`ADD ENTRY`, `SETTINGS`, `ABOUT`).

---

## Usage Guide

### Managing Bookmarks

- **Add Bookmark**: Click `ADD ENTRY` in the footer (or press `Alt+N`). Enter a title and URL. The category defaults to the currently selected one.
- **Edit Bookmark**: Hover over a bookmark tile and click the "Edit" (pencil) icon.
- **Delete Bookmark**: Open the Edit dialog for a bookmark and click `DELETE`.
- **Open Link**: Click anywhere on the bookmark tile to open the URL in a new tab.

### Managing Categories

You can fully customize the sidebar categories via the **Settings** menu.

1.  Click `SETTINGS` in the footer (or press `Alt+S`).
2.  Look for the **CATEGORY CONFIGURATION** section.
3.  **Add**: Click `NEW CATEGORY` (or press `Alt+C` while in settings).
4.  **Edit Name**: Type directly into the text field of any category.
5.  **Change Color**: Click the colored square to open the **LCARS Color Picker**. Select a new color from the palette.
6.  **Reorder**: Use the `▲` and `▼` buttons to move categories up or down in the sidebar.
7.  **Delete**: Click the `×` button. *Warning: Deleting a category will delete all bookmarks inside it.*

### Import & Export

Protect your data or move it to another machine.

1.  Click `SETTINGS`.
2.  **Export**: Click `EXPORT DATA` to download a `.json` file containing all your categories and bookmarks.
3.  **Import**: Click `IMPORT DATA`, select a previously exported JSON file, and confirm. *Note: This will overwrite your current data.*

### System Reset

If you want to start fresh:
1.  Click `SETTINGS`.
2.  Scroll to **SYSTEM RESET**.
3.  Click `RESET SYSTEM` and confirm. This wipes all Zander data from the browser.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Alt + N` | Open **Add Bookmark** dialog |
| `Alt + S` | Open **Settings** dialog |
| `Alt + C` | Add **New Category** (only when Settings dialog is open) |
| `Esc` | Close any open dialog |

---

## Technical Details

For developers or the curious:

- **Architecture**: Monolithic HTML file containing HTML5, CSS3, and ES6 JavaScript.
- **Storage**: `window.localStorage` key `zander-lcars:v1`.
- **Icons**: SVG icons embedded directly in the code.
- **Fonts**: Uses system sans-serif fonts (Antonio, Arial, Helvetica) to avoid network requests.
- **Stardate Formula**: Based on TNG Season 1 epoch (41000.0) progressing at 1000 units per Earth year.

### Data Model

**Bookmark**:
```json
{
  "id": "uuid",
  "title": "Example Site",
  "url": "https://example.com",
  "categoryId": "uuid-of-category",
  "createdAt": 41254.2
}
```

**Category**:
```json
{
  "id": "uuid",
  "name": "MAIN",
  "color": "#ff9900",
  "createdAt": 41254.1
}
```

---

## Credits

Designed and built as a tribute to the LCARS interface from *Star Trek*.