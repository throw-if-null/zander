# LCARS Layout Update: Continuous Flow

This update refactors the main application layout to implement a continuous "elbow" or "swept" bracket shape, characteristic of the Star Trek LCARS interface (specifically the "Change Mode" flow).

## Design Goal

The previous layout treated the header, sidebar, and footer as separate, disconnected blocks. The new design unifies them into a single continuous shape that wraps around the main content area on the top, right, and bottom.

## Technical Implementation

### 1. CSS Grid Restructuring
The main grid container `.lcars-app` was updated to remove gaps and allow the sidebar to span the full height of the viewport.

```css
.lcars-app {
    display: grid;
    grid-template-columns: 1fr 160px; /* Content | Sidebar */
    grid-template-rows: 70px 1fr 70px; /* Header | Main | Footer */
    gap: 0; /* Seamless connections */
}
```

### 2. The "Elbow" Connectors
To create the curved connection between the horizontal bars (header/footer) and the vertical sidebar, we utilized CSS radial gradients. This avoids the need for complex SVG assets or extra DOM elements for corners.

**Top Elbow (`.sidebar-top-cap`):**
- Connects the Header Bar to the Sidebar Track.
- Uses a radial gradient at the `bottom left` to cut a circle out of the background color, creating an inner curve.

**Bottom Elbow (`.sidebar-bottom-cap`):**
- Connects the Footer Bar to the Sidebar Track.
- Uses a radial gradient at the `top left` to create the opposing inner curve.

### 3. Component Refactoring

#### Header & Footer
- **Header:** Now occupies only the top-left grid cell. It has a rounded left edge but a flat right edge to connect visually with the sidebar's top cap.
- **Footer:** Occupies the bottom-left grid cell. Similar to the header, it connects visually to the sidebar's bottom cap.

#### Sidebar
- **Container:** Spans `grid-row: 1 / 4` (full height).
- **Track:** A continuous vertical bar connecting the top and bottom caps.
- **Buttons:** The category buttons (`.cat-btn`) now live inside the track. Their styling was updated to be semi-transparent (`rgba(0,0,0,0.1)`) by default, lighting up to `var(--lcars-beige)` when active, preserving the continuity of the vertical bar.

### 4. Main Content
The content area (`.main-content`) floats inside the "C" shape created by the surrounding elements. Margins were added to separate it visually from the LCARS frame.

## Visual Reference

The layout now mimics the flow:
`HEADER` -> `TOP ELBOW` -> `SIDEBAR TRACK` -> `BOTTOM ELBOW` -> `FOOTER`

This creates a single, unified UI element that frames the data.