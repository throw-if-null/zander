# ZANDER Design System Audit

**Date:** 2025-01-20  
**Status:** In Progress  
**Purpose:** Document current state of the LCARS design system and plan for refactoring before Svelte 5 migration.

---

## Executive Summary

The ZANDER LCARS design system has grown organically and contains good foundational work (tokens, themes, some primitives), but also has duplication, inconsistent tokenization, and missing abstractions that would make it difficult to port cleanly to Svelte 5 or reuse across other LCARS-themed projects.

This audit identifies issues and proposes a phased remediation plan.

---

## 🔴 Critical Issues

### 1. Duplicate CSS Blocks

The `.lcars-category-tile` and all its related selectors are defined **twice** in `index.html`:

- First occurrence: Lines 1145–1191
- Second occurrence: Lines 1198–1244

These are nearly identical copy-paste blocks that should be consolidated.

**Related duplicates:**
- `.lcars-category-tile::before` (twice)
- `.lcars-category-tile::after` (twice)
- `.lcars-category-tile:hover` (twice)
- `.lcars-category-tile-label` (twice)
- `.lcars-category-tile-meta` (twice at L1261-1275 and L1307-1321)
- `.lcars-category-tile-meta-primary` (twice)
- `.lcars-category-tile-meta-secondary` (twice)
- `.lcars-category-tile:focus-visible` (twice)

### 2. Three Tile Components That Should Be One

Three nearly identical tile patterns exist:

| Component | Used For | Grid Columns | Min-Height | Inner Corner Radius |
|-----------|----------|--------------|------------|---------------------|
| `.bookmark-tile` | Bookmarks | `15px 1fr` | 140px | 15px |
| `.lcars-category-tile` | Categories in grid | `12px 1fr` | 110px | 14px |
| `.settings-tile` | Settings navigation | `12px 1fr` | 110px | 14px |

**Shared characteristics:**
- Grid layout with left stripe column
- Top-left corner cutout via `::before` radial-gradient
- Bottom-right rounded corner (`--lcars-radius-lg`)
- Label row spanning full width
- Meta/description area with `border-top-left-radius`
- Identical hover behavior (`filter: brightness(1.1); transform: scale(1.02)`)
- Identical focus behavior (uses focus outline system)

**Recommendation:** Create a single `lcars-tile` primitive with variants.

### 3. Three Pin Components That Should Be One

| Component | Size | Used For |
|-----------|------|----------|
| `.lcars-pin` | 20px | Generic primitive (defined but underutilized) |
| `.lcars-tile-pin` | 18px | Bookmark/category tile action buttons |
| `.category-config-btn` | 40px | Settings category configuration controls |

All are circular buttons with the same core structure but different sizes.

**Recommendation:** Consolidate into single `.lcars-pin` with size modifiers (e.g., `--sm`, `--md`, `--lg`).

---

## 🟡 Missing Abstractions

### 4. Expandable Button Pattern Not Componentized

The "Add Entry" menu uses this HTML pattern:

```html
<div class="add-wrapper">
    <button class="lcars-button ...">ADD ENTRY</button>
    <div class="add-menu" role="menu">
        <button class="add-menu-item" role="menuitem">BOOKMARK</button>
        <button class="add-menu-item" role="menuitem">CATEGORY</button>
    </div>
</div>
```

The CSS (`.add-wrapper`, `.add-menu`, `.add-menu-item`) is tightly coupled to this single use case with hardcoded positioning and styling.

**Recommendation:** Abstract into a reusable component:
- `lcars-expandable` — wrapper that handles show/hide logic
- `lcars-expandable-trigger` — the button that opens the menu
- `lcars-expandable-menu` — the popup container
- `lcars-expandable-item` — individual menu items

Configuration options:
- `--lcars-expandable-direction: up | down | left | right`
- `--lcars-expandable-gap: <spacing>`

### 5. Two Breadcrumb Implementations

Two nearly identical breadcrumb patterns exist:

1. **Bookmark location breadcrumb** (`.lcars-breadcrumb-*`)
   - Used in the main bookmark view to show current category path

2. **Settings breadcrumb** (`.settings-breadcrumb-*`)
   - Used in settings panel for navigation

Both share:
- Horizontal layout with segments and separators
- Interactive segments (clickable for navigation)
- Current segment styling (bold, different color)
- Same focus behavior

**Recommendation:** Unify into single `lcars-breadcrumb` component.

---

## 🟠 Inconsistent Tokenization

### 6. Magic Numbers That Should Be Tokens

| Value | Where Used | Current Token | Suggested Action |
|-------|------------|---------------|------------------|
| `14px` | `.settings-tile-meta` border-radius | None | Use `--lcars-radius-sm` (adjust to 14px) |
| `14px` | `.lcars-category-tile-meta` border-radius | None | Use `--lcars-radius-sm` |
| `15px` | `.bookmark-description` border-radius | None | Inconsistent with above; standardize |
| `12px` | Tile stripe column width | None | Create `--lcars-tile-stripe-width` |
| `15px` | Bookmark tile stripe width | None | Inconsistent with above |
| `110px` | Category/settings tile min-height | None | Create `--lcars-tile-min-height` |
| `140px` | Bookmark tile min-height | None | Create `--lcars-tile-min-height-lg` |
| `5px` | Various gaps | Uses `--lcars-gutter` sometimes | Audit for consistency |

### 7. Font Family Inconsistencies

Most elements inherit from `body { font-family: var(--lcars-font); }`, but some components explicitly set:
- `font-family: 'Antonio', sans-serif;` (hardcoded in `.add-menu-item`)
- `font-family: var(--lcars-font);` (explicit in buttons, pins)

**Recommendation:** Remove explicit `font-family` declarations where inheritance suffices; ensure all hardcoded values use the token.

---

## ✅ What's Working Well

### Design Tokens (`:root`)
- Color palette is well-defined (`--lcars-*` colors)
- Spacing tokens exist (`--lcars-gutter`, `--lcars-gap`)
- Radius scale is defined (`--lcars-radius-xs/sm/md/lg`)
- Focus system tokens are clean (`--lcars-focus-*`)

### Theme System
- `data-theme` attribute approach is solid
- CSS variables (`--theme-main`, `--theme-secondary`, `--shape-color`) work well
- 8 themes defined and functional

### Focus System
- `lcars-focus-outline` provides consistent outline focus
- `lcars-focus-bar` provides directional bar focus for footer elements
- Good separation of concerns

### Frame Primitives
- `lcars-frame-segment` with modifiers (`--horizontal`, `--left-rounded`)
- `lcars-elbow` with configurable position and radii
- Clean, reusable, well-documented in DESIGN.md

### Button System
- `lcars-button` base with modifiers
- `lcars-pill` for rounded variant
- Color utility classes (`lcars-color-orange`, `lcars-color-dark`, etc.)
- Context role classes (`lcars-dialog-action`, `lcars-settings-action`, `lcars-footer-action`)

### Scroll Primitives
- `lcars-scroll-container` with cross-browser scrollbar hiding
- `lcars-arrow-btn` for scroll navigation
- Well-documented in DESIGN.md section 11

---

## Proposed Component Hierarchy

For a reusable LCARS design system that can power multiple projects:

```
Level 1: Tokens
├── Colors (--lcars-black, --lcars-white, --lcars-orange, etc.)
├── Spacing (--lcars-gutter, --lcars-gap)
├── Radii (--lcars-radius-xs, --lcars-radius-sm, --lcars-radius-md, --lcars-radius-lg)
├── Typography (--lcars-font)
└── Focus (--lcars-focus-outline-width, --lcars-focus-outline-color, etc.)

Level 2: Primitives (reusable across apps)
├── lcars-button (+ lcars-pill modifier, color utilities)
├── lcars-pin (sizes: --sm, --md, --lg; color variants)
├── lcars-tile (variants: --bookmark, --category, --settings, --danger)
│   ├── lcars-tile-stripe
│   ├── lcars-tile-label
│   ├── lcars-tile-meta
│   └── lcars-tile-pin (positioned action button)
├── lcars-expandable (dropdown/popup trigger pattern)
│   ├── lcars-expandable-trigger
│   ├── lcars-expandable-menu
│   └── lcars-expandable-item
├── lcars-breadcrumb
│   ├── lcars-breadcrumb-segment
│   └── lcars-breadcrumb-separator
├── lcars-elbow
├── lcars-frame-segment (+ modifiers)
├── lcars-scroll-container
├── lcars-arrow-btn
├── lcars-focus-outline (helper class)
├── lcars-focus-bar (helper class)
└── lcars-dialog (base dialog structure)

Level 3: Composed Components (reusable patterns)
├── Form Inputs (text, select, textarea with LCARS styling)
├── Color Picker Grid
├── Status Display
└── Category Config Row

Level 4: Layout Shells (app-specific compositions)
├── header-bar
├── sidebar-container (top-cap, track, bottom-cap)
├── footer-bar
└── main-content grid
```

---

## Remediation Plan

### Phase 1: Clean & Deduplicate ⏳
**Priority:** High  
**Effort:** Low

1. Remove duplicate `.lcars-category-tile` block (L1198-1244)
2. Remove duplicate related selectors (`:hover`, `:focus-visible`, `-label`, `-meta`, etc.)
3. Consolidate hardcoded radii (`14px`, `15px`) to use tokens
4. Add `--lcars-radius-sm` adjustment if needed (currently 16px, tiles use 14px)

### Phase 2: Unify Tiles ⏳
**Priority:** High  
**Effort:** Medium

1. Create `lcars-tile` base primitive with:
   - CSS variables for stripe width, min-height, corner radius
   - Grid layout with configurable stripe column
   - Shared `::before` corner cutout
   - Shared `::after` bottom-right radius
   - Shared hover/focus states

2. Add variant modifiers:
   - `lcars-tile--bookmark` — larger, with URL footer area
   - `lcars-tile--category` — standard size
   - `lcars-tile--settings` — standard size
   - `lcars-tile--danger` — red background

3. Create shared sub-components:
   - `.lcars-tile-label` — top row label
   - `.lcars-tile-meta` — description/meta area
   - `.lcars-tile-stripe` — left stripe (if needed explicitly)

### Phase 3: Unify Pins ⏳
**Priority:** Medium  
**Effort:** Low

1. Keep `.lcars-pin` as the single base primitive
2. Add size modifiers:
   - `.lcars-pin--sm` — 18px (for tile actions)
   - `.lcars-pin--md` — 20px (default)
   - `.lcars-pin--lg` — 40px (for config controls)

3. Remove `.lcars-tile-pin` (use `.lcars-pin--sm`)
4. Refactor `.category-config-btn` to use `.lcars-pin--lg` with glyph styling

### Phase 4: Create Expandable Component ⏳
**Priority:** Medium  
**Effort:** Medium

1. Abstract add-menu pattern into `lcars-expandable`
2. CSS variables for configuration:
   - `--lcars-expandable-direction` (up/down)
   - `--lcars-expandable-gap`
   - `--lcars-expandable-item-width`

3. Update add-menu HTML to use new classes
4. Document usage pattern

### Phase 5: Unify Breadcrumbs ⏳
**Priority:** Low  
**Effort:** Low

1. Create single `lcars-breadcrumb` component
2. Migrate bookmark location breadcrumb
3. Migrate settings breadcrumb
4. Remove old `.settings-breadcrumb-*` and `.lcars-breadcrumb-*` (keep one naming pattern)

### Phase 6: Update Documentation ⏳
**Priority:** Medium  
**Effort:** Medium

1. Add new primitives to DESIGN.md section 11 (Primitive Catalog)
2. Document all CSS variables for each primitive
3. Add usage examples
4. Update ARCHITECTURE.md if any structural changes

---

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | CSS deduplication, new primitives, HTML class updates |
| `DESIGN.md` | Section 11 updates for new primitives |
| `GLOSSARY.md` | Add terms for new primitives if needed |

---

## Future Considerations

### Svelte 5 Migration
Once the design system is clean:
1. Extract CSS to separate files or Svelte component styles
2. Create Svelte components that consume the primitives
3. Build stores for state management (replacing manual `saveData()`/`render*()`)

### Firebase Integration
After Svelte migration:
1. Create storage adapter abstraction
2. Implement LocalStorage adapter (current behavior)
3. Implement Firebase adapter
4. Add sync/offline-first logic

### Design System Package
Consider packaging the LCARS primitives as:
- Standalone CSS file(s) for non-Svelte projects
- Svelte component library for Svelte projects
- Documentation site with live examples

---

## Appendix: Current CSS Size

- **Total CSS in `<style>` block:** ~1,885 lines
- **Estimated after cleanup:** ~1,600 lines (remove duplicates, consolidate tiles)
- **Estimated after full refactor:** ~1,400 lines (unified primitives reduce redundancy)