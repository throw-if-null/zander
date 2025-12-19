# ZANDER UI Design Guidelines

This document describes the visual and structural design of the **ZANDER** bookmark system (codenamed **MEMORY ALPHA**), implemented in `index.html`.

The UI follows a strict **LCARS** (Library Computer Access and Retrieval System) aesthetic, characterized by:
- High contrast (Black background with vibrant pastel colors).
- Block-based layout with rounded "pill" shapes.
- Uppercase typography (Antonio font).
- "System console" interaction model.

---

## 1. LCARS Shell Layout

The application uses a CSS Grid layout to define the "console" structure.

### 1.1 Structure

```html
<div class="lcars-app">
  <!-- Header Band -->
  <div class="top-row">...</div>

  <!-- Main Content (Scrollable) -->
  <main class="main-content">...</main>

  <!-- Right Sidebar (Navigation) -->
  <aside class="sidebar">...</aside>

  <!-- Footer Band -->
  <div class="footer-row">...</div>
</div>
```

### 1.2 Visual Design & Color System

- **Background**: `#000000` (Deep Space Black).
- **Palette**:
  - **Orange** (`#ff9900`): Primary actions, headers, active states.
  - **Beige** (`#ffcc99`): Secondary text, inactive buttons.
  - **Purple** (`#cc99cc`): Sidebar navigation, structural connectors.
  - **Red** (`#cc6666`): Destructive actions, alerts.
  - **Blue** (`#9999cc`): Inputs, system status labels.

### 1.3 Layout Behavior

- **Fixed Frame**: The header, sidebar, and footer remain fixed.
- **Scrollable Core**: Only the `.main-content` area scrolls.
- **Connectors**: The "elbow" connectors (`.top-arc-connector`, `.footer-connector`) visually link the horizontal bands to the vertical sidebar, creating the signature LCARS frame.

---

## 2. Sidebar Category Strip

The sidebar acts as the primary navigation controller.

### 2.1 Visual Design

- **Buttons**: "Half-Pill" shape.
  - **Left**: Rounded (`border-top-left-radius: 20px`, `border-bottom-left-radius: 20px`).
  - **Right**: Flat (attaches to screen edge).
- **Typography**: Right-aligned, bold, uppercase.
- **State**:
  - **Inactive**: Category color (e.g., Purple).
  - **Active**: Beige (`var(--lcars-beige)`).

### 2.2 Behavior

- Clicking a category filters the main grid.
- The active category button visually "lights up" (turns beige).

---

## 3. Bookmark Grid & Tile

The main content area displays bookmarks as a responsive grid of tiles.

### 3.1 Tile Structure

```html
<a class="bookmark-tile">
  <div class="bookmark-title">TITLE</div>
  <div class="bookmark-url">URL</div>
  <div class="bookmark-edit-icon">✎</div>
</a>
```

### 3.2 Visual Design

- **Shape**: Rectangular with a specific LCARS curve.
  - `border-radius: 10px` (standard corners).
  - `border-bottom-right-radius: 30px` (signature curve).
- **Color**: Defaults to Orange, or inherits Category color.
- **Edit Icon**: A pencil icon appears in the top-right corner on hover.

### 3.3 Behavior

- **Click**: Opens the URL in a new tab.
- **Edit Icon Click**: Opens the **Edit Entry** dialog.
- **Right Click**: Opens the **Edit Entry** dialog (context menu override).
- **Hover**: Tile scales up slightly (`scale(1.02)`) and brightens.

---

## 4. Dialogs

Dialogs are treated as "System Overlays".

### 4.1 Shared Styling

- **Container**:
  - Background: Black.
  - Border: 2px solid Orange (or Red for alerts).
  - Radius: 20px.
- **Header Bar**:
  - Full-width bar at the top (`margin: -20px -20px ...`).
  - **Inverted Colors**: Orange background, Black text.
  - **Shape**: Rounded top corners, flat bottom.
  - Contains the Dialog Title (left) and Stardate (right).

### 4.2 Content & Forms

- **Inputs**:
  - Background: Dark Gray (`#222`).
  - Border: 1px solid Blue.
  - Text: Beige.
- **Stardate Display**:
  - In the Edit Dialog header, the creation Stardate is displayed.
  - Hovering reveals the Earth date.

### 4.3 Specific Dialogs

- **Bookmark Dialog**: Add/Edit form with Protocol selector (`HTTP/HTTPS`) and Category dropdown.
- **Settings Dialog**:
  - **Category Config**: List of categories with inline color swatches (opens Color Picker), name editing, reordering arrows, and delete buttons.
  - **Data Management**: Import/Export/Reset.
- **Color Picker**: A grid of 20 large, touch-friendly LCARS color tiles.
- **About Dialog**: System information, Stardate, and Keyboard Shortcuts.

---

## 5. Global Action Buttons & Status

The footer contains the system controls and status readout.

### 5.1 Action Buttons

Buttons in the footer and dialogs follow a consistent "Control Tab" style:

- **Shape**: Full Pill (`border-radius: 20px`).
- **Size**: Large (`height: 40px`, `width: 150px`).
- **Typography**: Right-aligned text (`justify-content: flex-end`), bold, uppercase.
- **Padding**: `15px` right padding.
- **Colors**:
  - **Standard**: Beige background, Black text.
  - **Primary**: Orange background, Black text.
  - **Destructive**: Red background, Black text.

### 5.2 System Status Display

A data readout block in the footer:

`STATUS: [CT][3][BM][12]`

- **Label**: "STATUS:" text.
- **Blocks**:
  - **Labels (CT/BM)**: Blue background, Black text.
  - **Values**: Black background, Orange text.
- **Shape**:
  - Starts sharp (flat left edge).
  - Ends rounded (rounded right cap).

---

## 6. Accessibility & Interaction

### 6.1 Focus States

- **Neon Glow**: Interactive elements receive a multi-layered focus ring to simulate a soft neon light.
  - `outline: 2px solid #ffff00`
  - `box-shadow`: Layers of yellow blur (10px, 20px, 40px).

### 6.2 Keyboard Shortcuts

- `Alt + N`: New Entry.
- `Alt + S`: Settings.
- `Alt + C`: Add Category.

---

## 7. Design Goals

1.  **Immersion**: The UI should feel like a functional terminal from the 24th century.
2.  **Efficiency**: Large hit targets, clear typography, and keyboard shortcuts.
3.  **Clarity**: High contrast and strict grid alignment.
4.  **System Status**: The user should always know the state of the database (counts, dates).