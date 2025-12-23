# ZANDER UI Design Guidelines

This document describes the visual and structural design of the **ZANDER** bookmark system (codenamed **MEMORY ALPHA**), implemented entirely in `index.html`.

The UI follows a strict **LCARS** (Library Computer Access and Retrieval System) aesthetic, characterized by:

- High contrast (black background with vibrant pastel colors).
- Block-based layout with sweeping “elbow” connectors and rounded “pill” shapes.
- Uppercase typography (Antonio / system sans-serif).
- “System console” interaction model: large hit targets, dense information, and decorative status readouts.

---

## 1. LCARS Shell Layout

The application is framed by a continuous LCARS “C‑shaped” structure that wraps around the main content on the top, right, and bottom.

At a high level, the shell consists of:

- **Header Bar** (top-left).
- **Sidebar Frame** (right side, spanning full height).
  - Top elbow cap.
  - Vertical track.
  - Bottom elbow cap.
- **Footer Bar** (bottom-left).
- **Main Content Area** (inside the “C”).

### 1.1 Structural DOM

The outer structure is organized under `.lcars-app` and uses native view and dialog elements:

```/dev/null/layout.html#L1-80
<div class="lcars-app">
  <!-- Header band and title -->
  <div class="header-bar">
    <div class="header-fill"></div>
    <button class="app-title" id="homeBtn">
      <!-- Title text, subtitle, and numeric callout; acts as a Home control -->
    </button>
    <div class="header-end-cap"></div>
  </div>

  <!-- Sidebar + Frame -->
  <aside class="sidebar-container">
    <div class="sidebar-top-cap"></div>
    <div class="sidebar-track" id="categorySidebar">
      <!-- Category buttons and filler -->
    </div>
    <div class="sidebar-bottom-cap"></div>
  </aside>

  <!-- Main content (views and grid) -->
  <main class="main-content">
    <!-- Bookmark view -->
    <section class="main-view" id="bookmarksView">
      <div class="bookmark-location">
        <span class="bookmark-location-label">LOCATION</span>
        <div class="bookmark-location-path">
          <!-- category path segments -->
        </div>
      </div>

      <div class="bookmark-grid" id="bookmarkGrid">
        <!-- bookmark tiles -->
        <div id="emptyState">NO ENTRIES IN THIS CATEGORY</div>
      </div>

      <div class="status-display">
        <div class="status-text">STATUS:</div>
        <div class="status-info" id="systemStatus">
          <!-- CT / BM readout -->
        </div>
      </div>
    </section>

    <!-- Settings panel (view) -->
    <section class="main-view settings-panel" id="settingsView">
      <!-- settings content, including category config and theme controls -->
    </section>

    <!-- About panel (view) -->
    <section class="main-view about-panel" id="aboutView">
      <!-- about content -->
    </section>
  </main>

  <!-- Footer band -->
  <div class="footer-bar">
    <!-- global action buttons and status summary -->
  </div>

  <!-- Bookmark dialog -->
  <dialog id="bookmarkDialog">
    <!-- .lcars-dialog markup (see Dialogs section) -->
  </dialog>

  <!-- Color picker dialog -->
  <dialog id="colorPickerDialog">
    <!-- LCARS color grid -->
  </dialog>

  <!-- Confirm / alert dialog -->
  <dialog id="confirmDialog">
    <!-- overwrite / delete / reset confirmations -->
  </dialog>
</div>
```

### 1.2 Grid & Frame Behavior

The LCARS shell uses CSS grid at the `.lcars-app` level to define a 2×3 frame:

- **Columns**:
  - Column 1: Main content (flexible).
  - Column 2: Sidebar frame (fixed width).
- **Rows**:
  - Row 1: Header height.
  - Row 2: Main content (flexible).
  - Row 3: Footer height.

Key properties:

- No gaps between grid cells: the header, sidebar caps, track, and footer visually join into a single continuous element.
- The sidebar container spans all rows, with top and bottom caps forming the curved “elbow” connectors.
- The sidebar track (`.sidebar-track`) hosts dynamically created category buttons and a `.sidebar-filler` that visually completes the LCARS band.
- Header, sidebar filler, and footer segments are all visual consumers of a shared LCARS frame primitive, ensuring a consistent “C-shaped” navigation frame around the content.

The main content sits *inside* the frame, with internal padding and margins to visually float away from the LCARS shell. The active view is controlled by applying or removing the `.active` class on `.main-view` sections via JavaScript.

### 1.3 LCARS Frame Segment Primitives

The continuous LCARS frame (header bar, sidebar track, footer bar) is built from a small set of reusable “frame segment” primitives. These primitives define the LCARS chrome, while structural shells like `.header-bar` and `.footer-bar` handle layout and semantics, and can themselves act as frame segments when combined with the `lcars-frame-segment` modifiers.

- `.lcars-frame-segment`
  - Base visual primitive for any LCARS frame piece.
  - Applies the core frame color: `background-color: var(--shape-color);`.
  - Used for:
    - Header bar container (when combined with `.header-bar`).
    - Sidebar filler segment between category buttons and bottom elbow.
    - Footer bar container (when combined with `.footer-bar`).
- `.lcars-frame-segment--horizontal`
  - Marks a frame segment as a horizontal bar.
  - Applies:
    - `display: flex;`
    - `align-items: center;`
  - Used for:
    - Header bar (`.header-bar` when combined with this modifier).
    - Footer bar (`.footer-bar` when combined with this modifier).
- `.lcars-frame-segment--left-rounded`
  - Adds LCARS rounding on the left side of a horizontal segment:
    - `border-top-left-radius: var(--radius);`
    - `border-bottom-left-radius: var(--radius);`
  - Used wherever the frame “wraps” around the content on the left:
    - Header bar.
    - Footer bar.

Structural shells:

- `.header-bar`
  - Grid cell for the top-left header region.
  - Provides layout: grid placement, flex alignment for the header fill, title button, and end cap.
  - Receives LCARS chrome by also using `lcars-frame-segment` modifiers on the same element.
- `.footer-bar`
  - Grid cell for the bottom-left footer region.
  - Provides layout: grid placement, flex alignment, and spacing for the system status and action buttons.
  - Receives LCARS chrome by also using `lcars-frame-segment` modifiers on the same element.

Examples:

```/dev/null/frame-segments.html#L1-24
<!-- Header: structural shell that is also a frame segment -->
<div class="header-bar lcars-frame-segment lcars-frame-segment--horizontal lcars-frame-segment--left-rounded">
  <div class="header-fill"></div>
  <button class="app-title" id="homeBtn">ZANDER</button>
  <div class="header-end-cap"></div>
</div>

<!-- Sidebar: structural track + vertical filler frame segment -->
<div class="sidebar-track">
  <!-- category buttons injected here -->
  <div class="sidebar-filler lcars-frame-segment"></div>
</div>

<!-- Footer: structural shell that is also a frame segment -->
<div class="footer-bar lcars-frame-segment lcars-frame-segment--horizontal lcars-frame-segment--left-rounded">
  <!-- system status + action buttons -->
</div>
```

These primitives allow future LCARS UIs to reuse the same frame language (horizontal bands, vertical fillers, rounded frame corners), while structural shells like `.header-bar` and `.footer-bar` remain app-specific layout containers that *opt into* LCARS visuals by composing the `lcars-frame-segment` modifiers.

---

For term definitions and ubiquitous language across the system (what “category”, “bookmark”, “frame”, “view”, etc. mean), see `GLOSSARY.md`. If this document and `GLOSSARY.md` ever disagree on a term, `GLOSSARY.md` is the source of truth for naming and meaning.

## 2. Color & Typography System

The color palette is defined via CSS variables on `:root`. The palette is shared between LCARS frame elements, category accents, and the color picker.

### 2.1 Palette

Base colors (representative, not exhaustive):

- `--lcars-bg`: `#000000` – global background (“deep space”).
- `--lcars-orange`: `#ff9900` – primary LCARS band / action color.
- `--lcars-beige`: `#ffcc99` – neutral panel / text background.
- `--lcars-pink`: `#ff66cc`
- `--lcars-purple`: `#cc99cc`
- `--lcars-blue`: `#9999cc`
- `--lcars-red`: `#cc6666`
- `--lcars-panel`: dark gray panel fills for main content.
- Additional accent colors in `LCARS_PALETTE` for category and color picker options.

Usage guidelines:

- **Frame** (header, sidebar caps, track, footer): primarily `--lcars-orange` and related warm tones.
- **Buttons & Tiles**: use per-category colors from the LCARS palette; hover and active states brighten or invert. Button focus states use a consistent LCARS pattern: a solid white bar rendered along one edge via `:focus-visible::after` (top for many primary buttons, left for sidebar categories, bottom for the header title button).
- **Status blocks & labels**: use blue for labels, orange for numeric values.
- **Destructive actions**: use red (e.g., delete, reset).

### 2.2 Typography

- Font stack: `Antonio, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (actual stack defined in CSS).
- Case: All primary labels, buttons, and headings are uppercase.
- Alignment:
  - Category buttons and footer controls are typically right-aligned to evoke LCARS tabs.
  - Status labels use tight, high-contrast, monospace-like metrics (achieved with letter-spacing).

### 2.3 Themes

The app supports multiple visual themes that all share the same layout, typography, and LCARS structure but vary the palette and emphasis. Themes primarily drive two CSS custom properties on `body`:

- `--theme-main`: feeds the LCARS frame and primary accents.
- `--theme-secondary`: feeds **footer and primary action buttons**, bookmark URL strips, and certain configuration buttons so that controls and content accents stay visually synchronized.

Current themes:

- **LA'AN** (`body[data-theme="laan"]`)
  - Default, balanced LCARS look.
  - Deep command red as the primary frame color.
  - Intended as the “baseline” LCARS console.

- **DATA** (`body[data-theme="data"]`)
  - Cooler, more analytical palette.
  - Amber/operations-inspired main tone with light secondary accents.
  - Evokes an android/operations console feel.

- **THE DOCTOR** (`body[data-theme="doctor"]`)
  - Clinical, teal-forward palette.
  - LCARS-style teal main color with a lighter secondary accent.
  - Inspired by medical/EMH-style LCARS stations.

- **CHAPEL** (`body[data-theme="chapel"]`)
  - High-contrast medical/diagnostic feel.
  - Main color: white; secondary color: neutral gray.
  - Emphasizes clarity, readability, and clean panels.

- **SPOCK** (`body[data-theme="spock"]`)
  - Cooler, more logical color balance.
  - Deep science blue main color with a lighter secondary tone.
  - Aims for a calm, high-contrast science console.

- **M'BENGA** (`body[data-theme="mbenga"]`)
  - Soft medical/science blend.
  - Main color: `#92b7dd` (muted blue); secondary color: white.
  - Feels like a calm, modern sickbay console.

- **SEVEN OF NINE** (`body[data-theme="seven"]`)
  - High-contrast, almost Borg-adjacent variation.
  - Darker silver main tone with a vivid **Borg green** secondary accent used for footer/buttons.
  - Feels sharper and more “augmented” than the baseline theme.

- **SHRAN** (`body[data-theme="shran"]`)
  - Cooler Andorian-inspired palette.
  - Main color: `#282b29` (dark, almost-black green-gray); secondary color: `#78bff5` (icy blue).
  - Designed to evoke a tactical/bridge console.

Implementation notes:

- Themes are applied via a `data-theme` attribute on `<body>` and theme-specific CSS variable overrides.
- The theme system does **not** affect layout or data; it only swaps colors and minor stylistic details.
- Controls that use `.action-btn` and category configuration buttons that reference `--theme-secondary` will update automatically when the theme changes, keeping **footer buttons**, **add/export/import** controls, and certain **category-config buttons** visually consistent with the active theme.

---

## 3. Sidebar & Category Strip

The sidebar is embedded in the right-hand frame and divided into:

- **Top cap**: `.sidebar-top-cap` – rounded LCARS “elbow” connecting header to sidebar track.
- **Track**: `.sidebar-track` – vertical orange band hosting category buttons and filler.
- **Bottom cap**: `.sidebar-bottom-cap` – mirrored “elbow” connecting sidebar track to footer.

### 3.1 Visual Design

- The sidebar track is a continuous orange band.
- Category buttons (`.cat-btn`) sit inside the track as half-pill overlays:
  - Left side of the button is rounded.
  - Right side aligns with the frame edge.
  - The background color is driven by a CSS custom property (e.g. `--cat-color`) derived from the category’s `color` field.
- Typography:
  - Right-aligned, bold, uppercase.
  - Slight tracking to mimic LCARS labels.

Example structure:

```/dev/null/sidebar.html#L1-40
<aside class="sidebar-container">
  <div class="sidebar-top-cap"></div>
  <div class="sidebar-track">
    <div class="cat-wrapper">
      <button class="cat-btn active">DATABANKS</button>
      <div class="cat-submenu">
        <!-- optional child categories -->
      </div>
    </div>

    <!-- More .cat-wrapper entries -->

    <div class="sidebar-filler"></div>
  </div>
  <div class="sidebar-bottom-cap"></div>
</aside>
```

### 3.2 Sidebar Elbows

The top and bottom caps use CSS gradients to carve internal curves out of the LCARS band, creating continuous elbow shapes without extra SVG assets:

- `.sidebar-top-cap`: uses a radial gradient at bottom-left to curve into the header.
- `.sidebar-bottom-cap`: uses a radial gradient at top-left to curve into the footer.

Visually, the flow is:

`HEADER` → `TOP CAP` → `SIDEBAR TRACK` → `BOTTOM CAP` → `FOOTER`.

Category buttons and nested submenus are placed within the `.sidebar-track` and must not break the visual continuity of this frame.

### 3.3 Category Button States

- **Base**:
  - Background: category color (via `--cat-color`) blended with the track.
  - Text: beige or light foreground.
- **Hover**:
  - Brightened background, increased opacity.
- **Active** (`.cat-btn.active`):
  - Stronger fill using the category color, with clear separation from inactive buttons.
- **Focus-visible**:
  - LCARS-style white focus bar rendered via `:focus-visible::after`:
    - For sidebar category buttons, a vertical white bar is drawn along the left edge of the button.
    - This keeps keyboard focus clearly visible without relying on the browser’s default outline.

Category buttons can have nested submenus (`.cat-submenu`) for child categories. Submenus are implemented as additional stacks of `.cat-btn` inside `.cat-wrapper` elements, shown on hover or inline depending on viewport and depth.

---

## 4. Main Views & Panels

The `main` region contains a set of mutually exclusive “views”:

- **Bookmarks View** (default).
- **Settings Panel**.
- **About Panel**.

Each view is represented as an element with class `.main-view` and is toggled via `.active`.

### 4.1 Main View Container

Common behavior:

- `.main-content` holds exactly one `.main-view.active` at a time.
- Each view shares padding, background, and layout rules so transitions feel consistent.
- The main background is a dark LCARS panel color with subtle separation from the frame.

### 4.2 Bookmark View

The bookmark view contains three major regions:

1. **Bookmark Location Bar** (`.bookmark-location`):
   - Horizontal strip at the top of the view.
   - Shows a “breadcrumb” of the active category path.
   - Structure:

     ```/dev/null/bookmark-location.html#L1-30
     <div class="bookmark-location">
       <span class="bookmark-location-label">LOCATION</span>
       <div class="bookmark-location-path">
         <span>ROOT</span>
         <span class="bookmark-location-separator">/</span>
         <span>DATABANKS</span>
         <!-- …child categories … -->
       </div>
     </div>
     ```

   - Visual intent: Minimal, utilitarian path display with LCARS-style label and color-coded segments.

2. **Bookmark Grid** (`.bookmark-grid`):
   - Responsive grid (CSS Grid or Flex) that lays out `.bookmark-tile` elements.
   - Handles both full tiles and an empty-state display if there are no bookmarks in the current category.

3. **Status Display** (`.status-display`):
   - Horizontal block at the bottom.
   - Shows computed stats like:

     - Category count (`CT`).
     - Bookmark count (`BM`).
     - Current stardate (`SD` or similar, if desired).

   - Follows LCARS status label style: a leading text label and alternating colored blocks for labels and numbers.

### 4.3 Settings Panel

The Settings view appears in-place within the main content area:

- Uses `.settings-panel` with LCARS accent block on the left (`.settings-accent`) and content area on the right (`.settings-content`).
- Sections are organized with headings and stack vertically:

  - **Category Configuration**:
    - List: `.category-config-list`.
    - Rows: `.category-config-row`.
    - Each row contains:
      - Color swatch button (`.category-color-swatch`) that opens the Color Picker.
      - Name input (text).
      - Reorder buttons (up/down).
      - Add-child button.
      - Delete button (destructive style).

  - **Theme**:
    - Theme selector controls rendered as LCARS buttons (typically using secondary accent colors).
    - A compact status readout of the currently active theme (e.g., `ACTIVE THEME: LA'AN`).

  - **Data Management**:
    - Buttons for Export and Import of the bookmark database (e.g., `EXPORT DATABASE`, `IMPORT DATABASE`).
    - Each button uses standard LCARS control styling (see Global Controls).

  - **Danger Zone**:
    - A visually separated section labeled “DANGER ZONE”.
    - Contains the `SYSTEM RESET` control, styled as a destructive action (e.g., red-toned LCARS button) to clearly communicate risk.
    - Reset behavior: wipes all local data and restores the built‑in defaults.

  - **System Status**:
    - Optional read-only status block with stardate and counts (`.settings-status`).

Visual notes:

- Accent column uses a strong LCARS color (e.g., orange or purple).
- Inner content uses dark panels with beige text and blue accents for labels.

### 4.4 About Panel

The About view (`.about-panel`) is an informational screen:

- Heading: `ABOUT ZANDER`.
- Federation-style vendor line:

  - `ZANDER BOOKMARK TECHNOLOGIES`
  - `UNITED FEDERATION OF PLANETS`

- System information section:

  - Short description of the system (single‑file, offline‑capable personal archive).
  - Version or build string (e.g., `VERSION: v1.0.0`).

- Keyboard shortcuts section:

  - List of primary Alt‑based shortcuts such as:
    - `ALT+H — HOME (BOOKMARKS VIEW)`
    - `ALT+N — NEW ENTRY`
    - `ALT+S — SETTINGS VIEW`
    - `ALT+C — NEW CATEGORY (IN SETTINGS)`

The About panel uses the same base layout as the Settings panel but is content-focused, with minimal controls and horizontal rules dividing the sections, matching the current `aboutView` markup in `index.html`.

The **header title** (`.app-title`, showing “ZANDER”) functions as a **Home control**: clicking it returns the main content to the Bookmarks view. This is mirrored by the `Alt+H` keyboard shortcut (see Keyboard & Accessibility section), giving both a prominent visual target and a power-user shortcut for returning “home”. When focused via keyboard, the header title button uses the same LCARS focus pattern as other primary controls: a single, solid white focus indicator rendered as a line along the **bottom edge** of the button, implemented via `:focus-visible::after`.

---

## 5. Bookmark Tiles

Bookmarks are represented as `.lcars-tile.lcars-tile--bookmark` elements rendered inside `.bookmark-grid`. They use the unified tile primitive (see Section 11.3) with bookmark-specific modifiers.

> **Note:** Legacy `.bookmark-tile` class is maintained as an alias for backward compatibility.

### 5.1 Structure

```/dev/null/bookmark-tile.html#L1-40
<div class="lcars-tile lcars-tile--bookmark" style="--tile-color: #99ccff">
  <div class="lcars-tile-label lcars-tile-label--bookmark">EXAMPLE SITE</div>
  <div class="lcars-tile-meta lcars-tile-meta--bookmark">Optional description text here...</div>
  <div class="lcars-tile-footer">
    <button class="lcars-pin lcars-pin--sm lcars-pin--edit" type="button" title="Edit"></button>
    <button class="lcars-pin lcars-pin--sm lcars-pin--url" type="button" title="https://example.com"></button>
  </div>
</div>
```

The tile uses a 3-row CSS grid layout:
- **Row 1 (auto)**: Title (black text on main theme-colored background).
- **Row 2 (1fr)**: Description (secondary theme-colored text on black background, with rounded top-left corner).
- **Row 3 (auto)**: Footer (black background containing circular Edit and Link buttons).

A `::before` pseudo-element creates the signature LCARS rounded notch in the top-left corner using a radial gradient.

Content breakdown:

- **`.lcars-tile-label.lcars-tile-label--bookmark`**: The bookmark's title (max 64 characters). Spans full width (`grid-column: 1 / -1`). Displayed in uppercase with black text on the tile color background.
- **`.lcars-tile-meta.lcars-tile-meta--bookmark`**: Description text (max 512 characters). Displayed in secondary theme color on a black background. Uses `border-top-left-radius: var(--lcars-radius-sm)` to create an "elbow" shape against the left strip. Truncated via CSS line-clamping (4 lines).
- **`.lcars-tile-footer`**: Compact footer strip with black background. Flex container for actions, aligned to the right.
  - **`.lcars-pin.lcars-pin--sm.lcars-pin--edit`**: Circular button in LCARS orange (`--lcars-orange`). Opens edit dialog.
  - **`.lcars-pin.lcars-pin--sm.lcars-pin--url`**: Circular button in main theme color. Opens bookmark URL. Full URL shown on hover via `title` attribute.

### 5.2 Visual Design

- **Shape**:
  - Rounded rectangle with LCARS signature exaggeration on corners.
  - Top-left: LCARS notch cutout via `::after` pseudo-element with `radial-gradient`
  - Bottom-right: `border-bottom-right-radius: var(--lcars-radius-lg)` (30px)
  - Min-height: `var(--lcars-tile-min-height-lg)` (140px) — compact height since description is truncated.
- **Color zones**:
  - **Title area (row 1)**: Tile color background (via `--tile-color` → `--lcars-tile-bg`) with black text.
  - **Description area (row 2)**: Black background with secondary theme-colored text (via `--theme-secondary`). The top-left corner is rounded (`var(--lcars-radius-sm)`) to create the inner curve of the LCARS elbow shape.
  - **URL footer (row 3)**: Black background with circular action buttons.
  - **Left stripe**: `var(--lcars-tile-stripe-width-lg)` (15px) column in tile color, visible in rows 2-3 as the "handle" of the elbow.
- **On hover**:
  - Slight scale up (`transform: scale(1.02)`).
  - Slightly brighter background (`filter: brightness(1.1)`).
- **Action Buttons** (using `.lcars-pin.lcars-pin--sm`):
  - 18px circular buttons (`border-radius: 50%`).
  - Grouped on the right side of the footer.
  - **Edit** (`.lcars-pin--edit`): LCARS Orange (`--lcars-orange`).
  - **Link** (`.lcars-pin--url`): Main theme color (`--theme-main`).
  - **Hover**: Scale up (`1.1`) and brightness increase.

### 5.3 Behavior

- **Left Click**:
  - Opens the bookmark URL in a new tab/window (`target="_blank"`, `rel="noopener noreferrer"`).
- **Edit Click**:
  - Clicking the pencil icon opens the Bookmark dialog in Edit mode.
- **Context Menu**:
  - The tile intercepts right-click (`contextmenu`) to open the Edit dialog directly.
- **Focus**:
  - Tiles receive the neon glow focus ring when tabbed to (see Accessibility).

---

## 6. Dialogs & Overlays

All modal interactions are implemented using `<dialog>` elements styled with `.lcars-dialog`.

Current dialog types:

- **Bookmark Dialog** (`#bookmarkDialog`).
- **Color Picker Dialog** (`#colorPickerDialog`).
- **Confirmation / Alert Dialog** (`#confirmDialog`).

### 6.1 Shared Dialog Structure

```/dev/null/dialog.html#L1-80
<dialog id="bookmarkDialog">
  <div class="lcars-dialog">
    <header class="lcars-dialog-header">
      <div class="lcars-dialog-title" id="dialogTitle">ADD ENTRY</div>
      <div class="lcars-dialog-meta">
        <span class="label">STARDATE</span>
        <span class="value" id="bookmarkStardateReadout">2025352.1200</span>
      </div>
    </header>

    <div class="lcars-dialog-body">
      <!-- form fields: title, protocol select, URL, category select -->
    </div>

    <footer class="lcars-dialog-footer">
      <div class="dialog-actions">
        <button class="btn-secondary" type="button">CANCEL</button>
        <button class="btn-secondary delete" type="button" id="deleteBtn">DELETE</button>
        <button class="btn-primary" type="submit">SAVE ENTRY</button>
      </div>
    </footer>
  </div>
</dialog>
```

### 6.2 Visual Design

- **Container**:
  - Black background.
  - Rounded corners (approx. `20px`).
  - Strong border or outer LCARS block top strip.
- **Header Bar**:
  - Full-width colored band (typically orange).
  - Rounded top corners, flat bottom.
  - Contains:
    - Title on the left (e.g., ADD ENTRY / EDIT ENTRY).
    - Stardate or meta info on the right.
- **Body**:
  - Dark panel with beige text.
  - Form fields stacked vertically with consistent spacing.
- **Footer**:
  - Right-aligned control buttons in LCARS pill style (see Global Controls).
- **Confirm / Alert Dialog**:
  - Shares the same `.lcars-dialog` shell but re-uses the button row for both “confirm/cancel” and single-button “ACKNOWLEDGE” alerts.

---

## 7. Forms, Inputs & Color Picker

### 7.1 Form Inputs


Inputs in dialogs and settings follow a consistent style:

- Background: dark gray (e.g., `#222`).
- Border: 1px solid blue (`--lcars-blue`).
- Text: beige.
- Focus:
  - Blue border highlight + neon glow outline.

The Bookmark dialog uses:

- `TITLE` text input (max 64 characters, `maxlength="64"`).
- `DESCRIPTION` textarea (optional, max 512 characters, `maxlength="512"`).
  - Styled with vertical resize constraints (`min-height: 60px`, `max-height: 150px`).
  - Placeholder text: "Optional description..."
- `URL` composite input:
  - Protocol selector (`#urlProtocol`) for `https://` vs `http://`.
  - Text input for the rest of the URL.
- Category dropdown mapping to existing categories.

### 7.2 Category Configuration Inputs

Each category row includes:

- Color swatch button (`.category-color-swatch`).
- Name text input.
- Up/Down reorder buttons (`.category-config-btn`).
- Add child category button.
- Delete button (destructive style, red background).

All buttons inherit the LCARS pill styling but are compact.

### 7.3 Color Picker

The Color Picker dialog presents a grid of selectable LCARS colors:

```/dev/null/color-picker.html#L1-40
<dialog id="colorPickerDialog">
  <div class="lcars-dialog">
    <header class="lcars-dialog-header">
      <div class="lcars-dialog-title">SELECT COLOR</div>
    </header>
    <div class="lcars-dialog-body">
      <div class="color-grid">
        <button class="color-option" data-color="#ff9900"></button>
        <button class="color-option" data-color="#ffcc99"></button>
        <!-- More colors from LCARS_PALETTE -->
      </div>
    </div>
    <footer class="lcars-dialog-footer">
      <button class="btn-secondary">CANCEL</button>
    </footer>
  </div>
</dialog>
```

Design notes:

- Large, touch-friendly swatches.
- Hover and focus states add outlines but preserve the color block.
- Selected color updates the associated category and re-renders the sidebar and bookmark tiles.

---

## 8. Global Action Buttons, Status, and Themes

### 8.1 Footer Bar

The footer bar (`.footer-bar`) anchors global controls:

- Left: Indicator stub aligning with the LCARS frame.
- Center/right: Action buttons:
  - `ADD ENTRY` (with popup menu)
  - `SETTINGS`
  - `ABOUT`
- At the far right: compact status summary or filler block that visually joins with the sidebar bottom cap.

Buttons use `.lcars-footer-bar-button` with color variants:

- `.lcars-color-orange`: Orange background, black text (primary actions).
- `.lcars-color-beige`: Beige background, black text (secondary actions).
- `.lcars-color-danger`: Red background, black text (destructive actions).

Design details:

- Full pill shape:
  - `border-radius: 999px`.
- Right-aligned text inside the button to evoke LCARS control tabs.
- Even padding and gap between buttons.

#### Add Entry Menu

The `ADD ENTRY` button uses the `.lcars-expandable` primitive (see Section 11.5) to create a popup menu with two options:

- **BOOKMARK** – Opens the Add Bookmark dialog.
- **CATEGORY** – Opens the Add Category dialog.

> **Note:** Legacy `.add-wrapper`, `.add-menu`, `.add-menu-item` classes are maintained as aliases for backward compatibility.

Menu structure (DOM order matters for Tab navigation):

```/dev/null/add-menu-structure.html#L1-7
<div class="lcars-expandable">
    <button id="addBtn">ADD ENTRY</button>
    <div class="lcars-expandable-menu" role="menu">
        <button class="lcars-expandable-item" role="menuitem">BOOKMARK</button>
        <button class="lcars-expandable-item" role="menuitem">CATEGORY</button>
    </div>
</div>
```

Menu visibility (CSS-only, no JavaScript required):

- **Hover**: Menu appears when hovering over `.lcars-expandable`.
- **Focus-within**: Menu appears when any element inside `.lcars-expandable` has focus (CSS `:focus-within`).
- Menu is positioned absolutely above the trigger button (`bottom: 100%`) by default.
- Direction can be changed via `.lcars-expandable--down` modifier.

Menu item styling (`.lcars-expandable-item`):

- Background: Theme secondary color (light pink/beige mix).
- Left border: 5px solid black (LCARS accent).
- Hover state: White background.
- Focus state: White focus bar on **top edge** (matching footer button focus style).

Configurable via CSS variables:
- `--lcars-expandable-gap` – gap between menu items (default: 5px).
- `--lcars-expandable-offset` – gap between trigger and menu (default: 5px).
- `--lcars-expandable-item-width` – width of menu items (default: 150px).
- `--lcars-expandable-item-height` – height of menu items (default: 40px).

### 8.2 Status Display

In the bookmark view, `.status-display` presents a more prominent LCARS readout:

- Structure:

  ```/dev/null/status-display.html#L1-30
  <div class="status-display">
    <span class="status-text">STATUS:</span>
    <div class="status-info">
      <span class="label">CT</span><span class="value">3</span>
      <span class="label">BM</span><span class="value">12</span>
    </div>
  </div>
  ```

- Design:

  - Labels (e.g., `CT`, `BM`) in blue blocks with black text.
  - Values in black blocks with orange text.
  - Rightmost edge has an exaggerated rounded cap to echo LCARS shapes.

---

## 9. Accessibility & Interaction

This section covers visual and interaction accessibility. For comprehensive a11y standards, requirements, testing procedures, and screen reader support, see `ACCESSIBILITY.md`.

### 9.1 Focus States

All interactive elements (links, buttons, tiles, inputs) use a consistent **neon glow** focus style:

- `outline: 2px solid #ffff66` (or equivalent).
- Multiple box-shadow layers (e.g., 0 0 8px, 0 0 16px, 0 0 32px in yellow/orange).

Additional notes:

- All focus styles are applied with `:focus-visible` so pointer users don’t see outlines on mouse click.
- Each interactive control chooses either the outline helper or the bar helper so the experience is consistent and visually LCARS-like:
  - Category buttons: focus bar (edge indicator).
  - Footer buttons: focus bar (top edge indicator).
  - Dialog buttons and form fields: outline (ring).
  - Color options, pins, and small controls: simple white outline tuned to their size.

### 9.2 Keyboard Navigation

- All key actions must be reachable using only the keyboard.
- Keyboard shortcuts (documented elsewhere) tie into LCARS actions:
  - `Alt+B` → Open Add Bookmark dialog.
  - `Alt+S` → Open Settings.
  - `Alt+C` → Add new category.
  - `Alt+H` → Go Home (Bookmarks view).
- `Esc` closes the currently open dialog.
- `Enter` or `Space` submits the active dialog form.
- Tab order:
  - Follows visual order within each view.
  - Dialogs trap focus while open.

#### Add Entry Menu

The footer `ADD ENTRY` button has a popup menu with `BOOKMARK` and `CATEGORY` options:

- **Tab to Add Entry**: Focus lands on the `ADD ENTRY` button with a visible focus bar; the menu expands automatically (via `:focus-within`) so keyboard users can see the available options.
- **Tab again**: Focus moves to `BOOKMARK` menu item (focus bar on top).
- **Tab again**: Focus moves to `CATEGORY` menu item (focus bar on top).
- **Tab again**: Focus moves to `SETTINGS`; the menu closes as focus leaves the wrapper.
- **Enter/Space on menu item**: Opens the corresponding dialog (Add Bookmark or Add Category).
- **Click on Add Entry**: Moves focus to the first menu item (`BOOKMARK`).

Menu items use the same white focus bar style as footer buttons, rendered on the **top edge** of each item.

---

## 10. Design Goals

1. **Immersion**
   - The layout, colors, and typography should feel like an actual LCARS terminal from the 24th century.
   - The new continuous frame (header → sidebar caps/track → footer) is the primary structural motif.

2. **Clarity**
   - Despite the themed design, core actions (add, edit, navigate) must remain obvious.
   - Status displays and labels use unambiguous abbreviations and high-contrast colors.

3. **Hierarchy**
   - The LCARS frame is always visually present and dominant.
   - Active view content is clearly separated from the frame via spacing and panel colors.
   - Within each view, headings and primary controls stand out using consistent color and size.

4. **Consistency**
   - All buttons, tiles, and dialogs share a cohesive LCARS visual language:
     - Pill shapes.
     - Neon focus.
     - Uppercase labels.
     - Reusable palette.

5. **Responsiveness**
   - Layout scales from small laptop displays up to large monitors while preserving the LCARS frame.
   - The main content scrolls independently inside the fixed shell for smaller viewports.

This document describes the intended appearance and interaction patterns. For implementation details (DOM structure, JavaScript behavior, and state model), see `ARCHITECTURE.md` and `index.html`.

---

## 11. LCARS Primitive Catalog

This section lists the **reusable LCARS primitives** that ZANDER consumes. These are the building blocks for future LCARS-based applications; app-specific shells and layouts (like `header-bar` and `footer-bar`) are expected to compose these primitives rather than redefine LCARS visuals.

### 11.1 Frame & Shell Primitives

- `lcars-app`
  - Grid container for the overall LCARS shell.
  - Defines the 2×3 layout (header, main, footer × content, sidebar).
- `lcars-frame-segment`
  - Base LCARS frame surface.
  - Applies `background-color: var(--shape-color);`.
  - Used wherever the LCARS band should appear (header, sidebar filler, footer).
- `lcars-frame-segment--horizontal`
  - Marks a frame segment as a horizontal bar.
  - Applies `display: flex; align-items: center;`.
- `lcars-frame-segment--left-rounded`
  - Adds LCARS rounding on the left side using the shared `--radius`.
  - Used for header and footer left edges.
- `lcars-elbow`
  - Generic curved elbow constructed via `radial-gradient`.
  - Configurable via:
    - `--elbow-position` (e.g., `bottom left`, `top left`).
    - `--elbow-radius-top-left`, `--elbow-radius-top-right`,
      `--elbow-radius-bottom-right`, `--elbow-radius-bottom-left`.
  - Specialized by:
    - `sidebar-top-cap` (header → sidebar connection).
    - `sidebar-bottom-cap` (sidebar → footer connection).

### 11.2 Button & Control Primitives

- `lcars-button`
  - Base LCARS button:
    - Uppercase label, bold type, inline-flex layout.
    - Background and foreground colors driven by CSS variables:
      - `--lcars-button-bg`
      - `--lcars-button-fg`
    - Supports context-specific variants via additional classes.
- `lcars-pill`
  - Modifier for rounded LCARS buttons.
  - Sets a pill radius (e.g., `--lcars-button-radius: 20px`).
- Color utility variants (for `lcars-button`):
  - `lcars-color-orange` – primary LCARS command color.
  - `lcars-color-dark` – dark panel with light text.
  - `lcars-color-danger` – destructive actions (reset, delete).
  - `lcars-color-beige` – neutral secondary controls.
- Contextual button roles:
  - `lcars-dialog-action` – buttons within dialogs.
  - `lcars-settings-action` – buttons within the Settings panel.
  - `lcars-footer-bar-button` – footer action buttons that integrate with the frame and focus bar.

### 11.3 Tiles

- `lcars-tile`
  - Base primitive for LCARS content tiles (bookmarks, categories, settings navigation).
  - Grid layout with left stripe column and rounded bottom-right corner.
  - Top-left corner cutout via `::after` radial-gradient.
  - Configurable via CSS variables:
    - `--lcars-tile-stripe-width` (default: `12px`)
    - `--lcars-tile-stripe-width-lg` (default: `15px`)
    - `--lcars-tile-min-height` (default: `110px`)
    - `--lcars-tile-min-height-lg` (default: `140px`)
    - `--lcars-tile-bg` (tile background color)
    - `--lcars-tile-fg` (tile foreground color)
    - `--lcars-tile-stripe-bg` (stripe column color)
  - Variant modifiers:
    - `lcars-tile--bookmark` – larger tile with footer row for action buttons.
    - `lcars-tile--category` – standard tile for category navigation.
    - `lcars-tile--settings` – button element styling for settings navigation.
    - `lcars-tile--danger` – red background for destructive actions.
  - Sub-components:
    - `lcars-tile-label` – top row label spanning full width.
    - `lcars-tile-label--bookmark` – larger label variant for bookmarks.
    - `lcars-tile-meta` – description/meta area with rounded top-left corner.
    - `lcars-tile-meta--bookmark` – bookmark description with line clamping.
    - `lcars-tile-meta-primary` – uppercase meta text.
    - `lcars-tile-meta-secondary` – secondary meta text (reduced opacity).
    - `lcars-tile-footer` – footer row for bookmark action buttons.
  - Behavior:
    - Hover: `filter: brightness(1.1); transform: scale(1.02)`.
    - Focus: uses `lcars-focus-outline` system.

### 11.4 Pins & Small Controls

- `lcars-pin`
  - Base primitive for small circular LCARS controls ("pins").
  - Configurable via CSS variables:
    - `--lcars-pin-size` (default: `20px`)
    - `--lcars-pin-bg` (background color)
    - `--lcars-pin-fg` (foreground/text color)
  - Size modifiers:
    - `lcars-pin--sm` – 18px (for tile action buttons).
    - `lcars-pin--lg` – 40px (for configuration controls).
  - Color variants:
    - `lcars-pin--edit` – orange background.
    - `lcars-pin--url` – theme-main background.
    - `lcars-pin--delete` – red background.
  - Style modifiers:
    - `lcars-pin--bordered` – adds inset border (`box-shadow: inset 0 0 0 2px`).
  - SVG icon support:
    - Base SVG sizing (70% width/height).
    - Glyph-specific sizing via `[data-glyph]` attributes (`up`, `down`, `plus`, `delete`).
  - Behavior:
    - Hover: `filter: brightness(1.1); transform: scale(1.1)`.
    - Focus: uses `lcars-focus-outline` system.

### 11.5 Expandable Menus

- `lcars-expandable`
  - Base primitive for dropdown/popup menu patterns.
  - Shows menu on hover or focus-within (CSS-only, no JS required).
  - Configurable via CSS variables:
    - `--lcars-expandable-gap` (default: `5px`) – gap between menu items.
    - `--lcars-expandable-offset` (default: `5px`) – gap between trigger and menu.
    - `--lcars-expandable-item-width` (default: `150px`) – width of menu items.
    - `--lcars-expandable-item-height` (default: `40px`) – height of menu items.
  - Direction modifiers:
    - `lcars-expandable--up` – menu appears above trigger (default).
    - `lcars-expandable--down` – menu appears below trigger.
  - Sub-components:
    - `lcars-expandable-menu` – popup container with absolute positioning.
    - `lcars-expandable-item` – individual menu items with LCARS styling.
  - Behavior:
    - Items use theme-secondary background with left border.
    - Hover: background lightens to white.
    - Focus: directional focus bar indicator.

### 11.6 Breadcrumbs

- `lcars-breadcrumb`
  - Base primitive for location/path readout components.
  - Horizontal layout with label, path segments, and separators.
  - Configurable via CSS variables:
    - `--lcars-breadcrumb-margin` (default: `10px`) – bottom margin.
    - `--lcars-breadcrumb-segment-bg` (default: `rgba(255, 153, 0, 0.18)`) – segment background.
    - `--lcars-breadcrumb-segment-bg-hover` (default: `rgba(255, 153, 0, 0.3)`) – hover background.
    - `--lcars-breadcrumb-segment-color` (default: `var(--lcars-orange)`) – segment text color.
  - Variant modifiers:
    - `lcars-breadcrumb--settings` – different margin and subtle backgrounds for settings panel.
  - Sub-components:
    - `lcars-breadcrumb-label` – "LOCATION" label (orange, uppercase, bold).
    - `lcars-breadcrumb-path` – container for path segments.
    - `lcars-breadcrumb-segment` – individual path segments (buttons or spans).
    - `lcars-breadcrumb-separator` – separator character between segments.
  - Segment modifiers:
    - `.is-current` – current location (bold, non-clickable).
    - `.is-root` – root segment (special styling in settings variant).
  - Behavior:
    - Non-current segments are clickable for navigation.
    - Focus: uses `lcars-focus-outline` system.

### 11.7 Arrow Buttons & Scroll Containers

- `lcars-arrow-btn`
  - Flat directional control with triangle/arrow indicator.
  - Used for scroll controls, pagination, carousels, list navigation.
  - Configurable via:
    - `--lcars-arrow-btn-height` (default: `24px`)
    - `--lcars-arrow-btn-bg` (default: `var(--shape-color)`)
    - `--lcars-arrow-btn-bg-hover` (default: `var(--lcars-beige)`)
    - `--lcars-arrow-btn-bg-focus` (default: `var(--shape-color)`)
    - `--lcars-arrow-btn-arrow-color` (default: `var(--lcars-black)`)
  - Contains an SVG with triangle polygon for directional indication.
  - States:
    - `:hover` – background lightens to `--lcars-arrow-btn-bg-hover`.
    - `:focus-visible` – inset focus outline.
    - `:disabled` – arrow SVG reduced to 30% opacity.
- `lcars-scroll-container`
  - A scrollable container with hidden scrollbar.
  - Mouse wheel and touch scrolling still functional.
  - Cross-browser scrollbar hiding:
    - `scrollbar-width: none` (Firefox)
    - `-ms-overflow-style: none` (IE/Edge)
    - `::-webkit-scrollbar { display: none }` (Chrome/Safari)
  - Typically paired with `lcars-arrow-btn` controls for accessible navigation.

### 11.8 Focus & Interaction Primitives

- `lcars-focus-outline`
  - Helper class for elements that should use a strong outline:
    - Outline: `3px solid #ffffff` with small offset.
  - Applied to:
    - Pill buttons (`lcars-button lcars-pill`).
    - Dialog actions.
    - Form inputs (text, select, textarea).
- `lcars-focus-bar`
  - Helper class that draws a directional focus bar using `:focus-visible::after`.
  - Position and size are controlled by:
    - `--lcars-focus-bar-top`
    - `--lcars-focus-bar-bottom`
    - `--lcars-focus-bar-left`
    - `--lcars-focus-bar-right`
    - `--lcars-focus-bar-width`
    - `--lcars-focus-bar-height`
    - `--lcars-focus-bar-color`
  - Typical uses:
    - Sidebar category buttons: vertical bar along the left edge.
    - Footer buttons: horizontal bar along the top edge.

### 11.9 Theme & Color System Primitives

- Global theme variables (applied on `body`):
  - `--theme-main` – primary frame/accent color.
  - `--shape-color` – derived frame color used by LCARS shell components.
  - `--theme-secondary` – secondary accent used for bookmark tiles and some buttons.
- Palette:
  - `LCARS_PALETTE` – canonical list of LCARS colors used for categories and the color picker.
- Theme data attributes:
  - `body[data-theme="laan" | "data" | "doctor" | "chapel" | "spock" | "mbenga" | "seven" | "shran"]`
    - Each theme configures `--theme-main` and `--theme-secondary` for a distinct but consistent LCARS look.

### 11.10 Layout Shell Conventions (Consumers, Not Primitives)

These classes are **not** primitives, but typical consumers that future apps can mirror:

- `header-bar`
  - App-specific shell for the top-left header region.
  - Composes:
    - `lcars-frame-segment`
    - `lcars-frame-segment--horizontal`
    - `lcars-frame-segment--left-rounded`
- `sidebar-container`, `sidebar-track`, `sidebar-top-cap`, `sidebar-bottom-cap`
  - Define the right-hand LCARS sidebar structure.
  - Use:
    - `lcars-elbow` for top and bottom caps.
    - `lcars-scroll-container` for scrollable category list.
    - `lcars-arrow-btn` for scroll navigation buttons.
- `footer-bar`
  - App-specific shell for the bottom-left footer region.
  - Composes:
    - `lcars-frame-segment`
    - `lcars-frame-segment--horizontal`
    - `lcars-frame-segment--left-rounded`

When extracting a standalone LCARS design system, the `lcars-*` primitives listed above should form the **public API**. Application shells (like those in ZANDER) are responsible for arranging these primitives into a complete console layout.