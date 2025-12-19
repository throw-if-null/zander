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
    <div class="header-end-cap"></div>
    <div class="app-title">
      <!-- Title text, subtitle, and numeric callout -->
    </div>
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

The main content sits *inside* the frame, with internal padding and margins to visually float away from the LCARS shell. The active view is controlled by applying or removing the `.active` class on `.main-view` sections via JavaScript.

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
- **Buttons & Tiles**: use per-category colors from the LCARS palette; hover and active states brighten or invert.
- **Status blocks & labels**: use blue for labels, orange for numeric values.
- **Destructive actions**: use red (e.g., delete, reset).

### 2.2 Typography

- Font stack: `Antonio, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (actual stack defined in CSS).
- Case: All primary labels, buttons, and headings are uppercase.
- Alignment:
  - Category buttons and footer controls are typically right-aligned to evoke LCARS tabs.
  - Status labels use tight, high-contrast, monospace-like metrics (achieved with letter-spacing).

### 2.3 Themes

The app supports multiple visual themes that all share the same layout, typography, and LCARS structure but vary the palette and emphasis:

- **PICKARD** (`body[data-theme="pickard"]`)
  - Default, balanced LCARS look.
  - Warm oranges and beiges dominate the frame.
  - Intended as the “baseline” LCARS console.

- **DATA** (`body[data-theme="data"]`)
  - Cooler, more analytical palette.
  - Increased use of neutral grays and blues.
  - Evokes an android/operations console feel.

- **DOCTOR** (`body[data-theme="doctor"]`)
  - Slightly clinical tone with cleaner contrasts.
  - Uses cooler highlights against neutral frames.
  - Inspired by medical/EMH-style LCARS stations.

- **SPOCK** (`body[data-theme="spock"]`)
  - Cooler, more logical color balance.
  - Emphasizes blues and purples with restrained warms.
  - Aims for a calm, high-contrast science console.

- **SEVEN OF NINE** (`body[data-theme="seven"]`)
  - High-contrast, almost Borg-adjacent variation.
  - Strong highlights and accent overrides (for example, footer action buttons).
  - Feels sharper and more “augmented” than the baseline theme.

Implementation notes:

- Themes are applied via a `data-theme` attribute on `<body>` and theme-specific CSS variable overrides.
- The theme system does **not** affect layout or data; it only swaps colors and minor stylistic details.

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

Category buttons and nested submenus are placed within the `.sidebar-track` but must not break the visual continuity of the frame.

### 3.3 Category Button States

- **Base**:
  - Background: category color (via `--cat-color`) blended with the track.
  - Text: beige or light foreground.
- **Hover**:
  - Brightened background, increased opacity.
- **Active** (`.cat-btn.active`):
  - Stronger fill using the category color, with clear separation from inactive buttons.
- **Focus-visible**:
  - Neon glow outline (see Accessibility), implemented via `:focus-visible` and an `::after` halo.

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

  - **Data Management**:
    - Buttons for Export, Import, and Reset System.
    - Each button uses standard LCARS control styling (see Global Controls).

  - **System Status**:
    - Optional read-only status block with stardate and counts (`.settings-status`).

Visual notes:

- Accent column uses a strong LCARS color (e.g., orange or purple).
- Inner content uses dark panels with beige text and blue accents for labels.

### 4.4 About Panel

The About view (`.about-panel`) is an informational screen:

- Heading: system name and short descriptor.
- Paragraphs with description, credits, and environment info.
- An “about-meta” section with:

  - Current stardate display.
  - Human-readable date.
  - Version or build string if applicable.

The About panel uses the same base layout as the Settings panel but is content-focused, with minimal controls.

---

## 5. Bookmark Tiles

Bookmarks are represented as `.bookmark-tile` elements rendered inside `.bookmark-grid`. In the current implementation they are anchors (`<a>`) with an embedded edit control.

### 5.1 Structure

```/dev/null/bookmark-tile.html#L1-40
<a class="bookmark-tile" href="https://example.com" target="_blank" rel="noopener noreferrer">
  <div class="bookmark-title">EXAMPLE SITE</div>
  <div class="bookmark-url">https://example.com</div>
  <div class="bookmark-edit-icon" title="Edit">✎</div>
</a>
```

### 5.2 Visual Design

- **Shape**:
  - Rounded rectangle with LCARS signature exaggeration on one corner.
  - Example:
    - `border-radius: 10px;`
    - `border-bottom-right-radius: 30px;`
- **Color**:
  - Background: category color (via `--cat-color`) or a blend of category color and neutral LCARS orange.
  - On hover:
    - Slight scale up (e.g., `transform: translateY(-1px) scale(1.02)`).
    - Slightly brighter background.
- **Edit Icon**:
  - Positioned in the top-right corner of the tile.
  - Revealed on hover of the tile.
  - Clickable and keyboard-focusable, but rendered as a visual glyph inside the tile rather than a separate button element.

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

- `TITLE` text input.
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
  - `ADD ENTRY`
  - `SETTINGS`
  - `ABOUT`
- At the far right: compact status summary or filler block that visually joins with the sidebar bottom cap.

Buttons use `.action-btn` with variants:

- `.btn-primary`: Orange background, black text.
- `.btn-secondary`: Beige background, black text.
- `.btn-secondary.reset` or `.delete`: Red background, black text.

Design details:

- Full pill shape:
  - `border-radius: 999px`.
- Right-aligned text inside the button to evoke LCARS control tabs.
- Even padding and gap between buttons.

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

### 9.1 Focus States

All interactive elements (links, buttons, tiles, inputs) use a consistent **neon glow** focus style:

- `outline: 2px solid #ffff66` (or equivalent).
- Multiple box-shadow layers (e.g., 0 0 8px, 0 0 16px, 0 0 32px in yellow/orange).

Additional notes:

- Focus styles use `:focus-visible` so pointer users don’t see outlines on click.
- This applies to:
  - `.cat-btn`
  - `.bookmark-tile`
  - `.action-btn`
  - Dialog buttons and inputs
  - Color options

### 9.2 Keyboard Navigation

- All key actions must be reachable using only the keyboard.
- Keyboard shortcuts (documented elsewhere) tie into LCARS actions:
  - `Alt+N` → Open Add Entry (Bookmark dialog).
  - `Alt+S` → Open Settings.
  - `Alt+C` → Add new category (when Settings is active).
- `Esc` closes the currently open dialog.
- Tab order:
  - Follows visual order within each view.
  - Dialogs trap focus while open.

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