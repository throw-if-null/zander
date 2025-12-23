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

### 1. ~~Duplicate CSS Blocks~~ ✅ RESOLVED

~~The `.lcars-category-tile` and all its related selectors are defined **twice** in `index.html`.~~

**Resolution:** Removed ~100 lines of duplicate CSS in Phase 1. All `.lcars-category-tile` selectors now exist only once.

### 2. ~~Three Tile Components That Should Be One~~ ✅ RESOLVED

~~Three nearly identical tile patterns exist.~~

**Resolution:** Created unified `.lcars-tile` primitive in Phase 2 with:
- Base primitive with configurable CSS variables
- Variant modifiers: `--bookmark`, `--category`, `--settings`, `--danger`
- Shared sub-components: `.lcars-tile-label`, `.lcars-tile-meta`, `.lcars-tile-footer`
- Legacy class aliases maintained for backward compatibility

### 3. ~~Three Pin Components That Should Be One~~ ✅ RESOLVED

~~Three pin components with duplicate structure existed.~~

**Resolution:** Unified into single `.lcars-pin` primitive in Phase 3 with:
- Size modifiers: `--sm` (18px), default (20px), `--lg` (40px)
- Color variants: `--edit`, `--url`, `--delete`
- Style modifiers: `--bordered` (inset border for config buttons)
- SVG icon support with glyph-specific sizing
- Legacy aliases maintained for backward compatibility

---

## 🟡 Missing Abstractions

### 4. ~~Expandable Button Pattern Not Componentized~~ ✅ RESOLVED

~~The "Add Entry" menu uses tightly coupled CSS that was not reusable.~~

**Resolution:** Created unified `.lcars-expandable` primitive in Phase 4 with:
- `.lcars-expandable` — wrapper with configurable CSS variables
- `.lcars-expandable-menu` — popup container with direction support
- `.lcars-expandable-item` — individual menu items with focus states
- Direction modifiers: `--up` (default), `--down`
- CSS variables: `--lcars-expandable-gap`, `--lcars-expandable-offset`, `--lcars-expandable-item-width`, `--lcars-expandable-item-height`

### 5. ~~Two Breadcrumb Implementations~~ ✅ RESOLVED

~~Two nearly identical breadcrumb patterns existed.~~

**Resolution:** Unified into single `.lcars-breadcrumb` primitive in Phase 5 with:
- CSS variables for configurable styling (`--lcars-breadcrumb-margin`, `--lcars-breadcrumb-segment-bg`, etc.)
- Settings variant: `.lcars-breadcrumb--settings`
- Shared sub-components: `.lcars-breadcrumb-label`, `.lcars-breadcrumb-path`, `.lcars-breadcrumb-segment`, `.lcars-breadcrumb-separator`
- Legacy aliases maintained for backward compatibility

---

## 🟠 Inconsistent Tokenization

### 6. Magic Numbers That Should Be Tokens

| Value | Where Used | Current Token | Status |
|-------|------------|---------------|--------|
| ~~`14px`~~ | ~~`.settings-tile-meta` border-radius~~ | ~~None~~ | ✅ Now uses `var(--lcars-radius-sm)` |
| ~~`14px`~~ | ~~`.lcars-category-tile-meta` border-radius~~ | ~~None~~ | ✅ Now uses `var(--lcars-radius-sm)` |
| ~~`15px`~~ | ~~`.bookmark-description` border-radius~~ | ~~None~~ | ✅ Now uses `var(--lcars-radius-sm)` |
| ~~`12px`~~ | ~~Tile stripe column width~~ | ~~None~~ | ✅ Now uses `var(--lcars-tile-stripe-width)` |
| ~~`15px`~~ | ~~Bookmark tile stripe width~~ | ~~None~~ | ✅ Now uses `var(--lcars-tile-stripe-width-lg)` |
| ~~`110px`~~ | ~~Category/settings tile min-height~~ | ~~None~~ | ✅ Now uses `var(--lcars-tile-min-height)` |
| ~~`140px`~~ | ~~Bookmark tile min-height~~ | ~~None~~ | ✅ Now uses `var(--lcars-tile-min-height-lg)` |
| `5px` | Various gaps | Uses `--lcars-gutter` sometimes | ⏳ Audit for consistency |

**Note:** `--lcars-radius-sm` was adjusted from `16px` to `14px` in Phase 1 to match tile usage.

**Tile tokens added in Phase 2:**
- `--lcars-tile-stripe-width: 12px`
- `--lcars-tile-stripe-width-lg: 15px`
- `--lcars-tile-min-height: 110px`
- `--lcars-tile-min-height-lg: 140px`

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

### Phase 1: Clean & Deduplicate ✅
**Priority:** High  
**Effort:** Low  
**Completed:** 2025-01-20

1. ✅ Remove duplicate `.lcars-category-tile` block (L1198-1244)
2. ✅ Remove duplicate related selectors (`:hover`, `:focus-visible`, `-label`, `-meta`, etc.)
3. ✅ Consolidate hardcoded radii (`14px`, `15px`) to use tokens
4. ✅ Adjusted `--lcars-radius-sm` from 16px to 14px

**Changes made:**
- Removed ~100 lines of duplicate CSS for `.lcars-category-tile` and related selectors
- Changed `--lcars-radius-sm` token from `16px` to `14px`
- Replaced hardcoded `14px` in `.settings-tile-meta` with `var(--lcars-radius-sm)`
- Replaced hardcoded `14px` in `.lcars-category-tile-meta` with `var(--lcars-radius-sm)`
- Replaced hardcoded `15px` in `.bookmark-description` with `var(--lcars-radius-sm)`

### Phase 2: Unify Tiles ✅
**Priority:** High  
**Effort:** Medium  
**Completed:** 2025-01-20

1. ✅ Create `lcars-tile` base primitive with:
   - CSS variables for stripe width, min-height, corner radius
   - Grid layout with configurable stripe column
   - Shared `::before` stripe column
   - Shared `::after` corner cutout
   - Shared hover/focus states

2. ✅ Add variant modifiers:
   - `lcars-tile--bookmark` — larger, with URL footer area
   - `lcars-tile--category` — standard size
   - `lcars-tile--settings` — standard size, button styling
   - `lcars-tile--danger` — red background

3. ✅ Create shared sub-components:
   - `.lcars-tile-label` — top row label (+ `--bookmark` modifier)
   - `.lcars-tile-meta` — description/meta area (+ `--bookmark` modifier)
   - `.lcars-tile-meta-primary` — uppercase meta text
   - `.lcars-tile-meta-secondary` — secondary meta text
   - `.lcars-tile-footer` — footer row for bookmark actions

**Changes made:**
- Added tile tokens to `:root`: `--lcars-tile-stripe-width`, `--lcars-tile-stripe-width-lg`, `--lcars-tile-min-height`, `--lcars-tile-min-height-lg`
- Created unified `.lcars-tile` primitive with variants and sub-components (~170 lines)
- Updated `createBookmarkTile()` JS function to use new classes
- Updated `createCategoryTile()` JS function to use new classes
- Updated Settings panel HTML to use new classes
- Updated event handlers to use new class selectors
- Removed duplicate `createCategoryTile()` function (dead code)
- Kept legacy aliases (`.bookmark-tile`, `.lcars-category-tile`, `.settings-tile`) for backward compatibility
- All tiles now use `--tile-color` CSS variable consistently
- Fixed pin positioning: changed `.lcars-tile .lcars-tile-pin` to `.lcars-tile > .lcars-tile-pin` so pins in footer use flexbox flow

### Phase 3: Unify Pins ✅
**Priority:** Medium  
**Effort:** Low  
**Completed:** 2025-01-20

1. ✅ Keep `.lcars-pin` as the single base primitive
2. ✅ Add size modifiers:
   - `.lcars-pin--sm` — 18px (for tile actions)
   - `.lcars-pin--md` — 20px (default, no class needed)
   - `.lcars-pin--lg` — 40px (for config controls)

3. ✅ Add color variants:
   - `.lcars-pin--edit` — orange
   - `.lcars-pin--url` — theme-main
   - `.lcars-pin--delete` — red

4. ✅ Add style modifiers:
   - `.lcars-pin--bordered` — inset border for config buttons

5. ✅ Add SVG icon support with glyph-specific sizing

**Changes made:**
- Enhanced `.lcars-pin` primitive with size/color/style modifiers (~70 lines added)
- Updated `createBookmarkTile()` to use `.lcars-pin.lcars-pin--sm.lcars-pin--edit/--url`
- Updated `createCategoryTile()` to use `.lcars-pin.lcars-pin--sm.lcars-pin--edit`
- Updated `renderCategoryConfig()` to use `.lcars-pin.lcars-pin--lg.lcars-pin--bordered`
- Updated event handlers to use `.lcars-pin--edit` and `.lcars-pin--url` selectors
- Updated tile pin positioning rule to use `.lcars-tile > .lcars-pin`
- Kept legacy aliases (`.lcars-tile-pin`, `.category-config-btn`) for backward compatibility

### Phase 4: Create Expandable Component ✅
**Priority:** Medium  
**Effort:** Medium  
**Completed:** 2025-01-20

1. ✅ Abstract add-menu pattern into `lcars-expandable`
2. ✅ CSS variables for configuration:
   - `--lcars-expandable-gap` (gap between items)
   - `--lcars-expandable-offset` (gap between trigger and menu)
   - `--lcars-expandable-item-width`
   - `--lcars-expandable-item-height`

3. ✅ Direction modifiers:
   - `.lcars-expandable--up` (default, menu appears above)
   - `.lcars-expandable--down` (menu appears below)

4. ✅ Update add-menu HTML to use new classes
5. ✅ Focus states with directional focus bar indicator

**Changes made:**
- Created `.lcars-expandable` primitive (~90 lines)
- Created `.lcars-expandable-menu` with direction support
- Created `.lcars-expandable-item` with hover/focus states
- Updated footer "ADD ENTRY" menu HTML to use new classes
- Fixed hardcoded `font-family: 'Antonio'` to use `var(--lcars-font)` token
- Added `.footer-bar > .lcars-expandable > .lcars-footer-bar-button` to border-left rule
- Kept legacy aliases (`.add-wrapper`, `.add-menu`, `.add-menu-item`) for backward compatibility

### Phase 5: Unify Breadcrumbs ✅
**Priority:** Low  
**Effort:** Low  
**Completed:** 2025-01-20

1. ✅ Create single `lcars-breadcrumb` component with CSS variables
2. ✅ Add `.lcars-breadcrumb--settings` variant for settings-specific styling
3. ✅ Migrate settings breadcrumb HTML to use unified classes
4. ✅ Update `renderSettingsBreadcrumb()` JS to use unified classes
5. ✅ Consolidated duplicate `.lcars-breadcrumb-segment` CSS rules

**Changes made:**
- Added CSS variables: `--lcars-breadcrumb-margin`, `--lcars-breadcrumb-segment-bg`, `--lcars-breadcrumb-segment-bg-hover`, `--lcars-breadcrumb-segment-color`
- Created `.lcars-breadcrumb--settings` variant with different colors and margins
- Updated settings breadcrumb HTML from `.settings-breadcrumb` to `.lcars-breadcrumb.lcars-breadcrumb--settings`
- Updated `renderSettingsBreadcrumb()` to use `.lcars-breadcrumb-segment` and `.lcars-breadcrumb-separator`
- Consolidated duplicate `.lcars-breadcrumb-segment` rules into single definition
- Kept legacy aliases (`.settings-breadcrumb-*`) for backward compatibility

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

- **Total CSS in `<style>` block (original):** ~1,885 lines
- **After Phase 1 cleanup:** ~1,785 lines (~100 lines removed)
- **After Phase 2 tile unification:** ~1,750 lines (added unified primitive, legacy aliases kept for now)
- **After Phase 3 pin unification:** ~1,820 lines (added unified pin primitive with modifiers)
- **After Phase 4 expandable component:** ~1,910 lines (added expandable primitive)
- **After Phase 5 breadcrumb unification:** ~1,920 lines (added variant, consolidated duplicates)
- **Estimated after legacy alias removal:** ~1,400 lines
- **Estimated after full refactor:** ~1,250 lines (unified primitives reduce redundancy)