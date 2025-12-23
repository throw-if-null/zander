# CSS Review for LCARS Design System

This document captures the CSS review findings for the Zander LCARS Bookmark System, with action items for preparing the CSS for extraction into a standalone LCARS design system.

---

## ✅ What's Working Well

### 1. Design Token Foundation (Lines 14-84)

The `:root` block is well-organized with clear section comments:

- Color palette is organized (core colors, dark shades)
- Spacing, radii, and tile tokens are defined
- Legacy aliases with comments pointing to preferred vars
- Component-level variables are documented in a comment block

### 2. Theme System (Lines 90-154)

- Clean `data-theme` attribute pattern
- `--theme-main` and `--theme-secondary` are well-named
- Smart `color-mix()` usage for automatic secondary calculation
- Themes are properly isolated in their own rule blocks

### 3. Focus System (Lines 160-203)

- Unified 3px outline width for strong a11y
- `--lcars-focus-*` variables for customization
- `lcars-focus-bar` helper with configurable edge positions
- Consistent application to pills, inputs, config buttons

### 4. Well-Structured Primitives

The following primitives are properly componentized with CSS variable configuration:

- `lcars-frame-segment` and modifiers
- `lcars-header-bar`, `lcars-footer-bar`, `lcars-sidebar-bar`
- `lcars-tile` with configurable variants
- `lcars-pin` with size/color modifiers
- `lcars-breadcrumb` with variant modifier pattern
- `lcars-expandable` for dropdown menus
- `lcars-arrow-btn` and `lcars-scroll-container`

---

## ❌ Issues to Address

### 1. ~500+ Lines of Legacy Duplicate Code (Critical)

This is the biggest issue. There are TODO comments marking legacy aliases, but they contain full duplicated style blocks:

| Legacy Class | Primitive Equivalent | Lines |
|--------------|---------------------|-------|
| `.settings-tile` | `.lcars-tile.lcars-tile--settings` | L1470-1569 |
| `.lcars-category-tile` | `.lcars-tile.lcars-tile--category` | L1703-1796 |
| `.bookmark-tile` | `.lcars-tile.lcars-tile--bookmark` | L1803-1891 |
| `.lcars-tile-pin` | `.lcars-pin.lcars-pin--sm` | L1898-1946 |
| `.category-config-btn` | `.lcars-pin.lcars-pin--lg.lcars-pin--bordered` | L2335-2412 |
| `.add-wrapper/.add-menu/.add-menu-item` | `.lcars-expandable` | L836-900 |
| `.settings-breadcrumb` | `.lcars-breadcrumb--settings` | L1593-1660 |
| `.status-display` | `.lcars-status-display` | L2415-2441 |

**Action:** Migrate HTML to use primitive classes, then delete legacy blocks.

---

### 2. Missing Design Tokens

Tokens are good but incomplete for a full design system:

**Missing tokens to add:**

```css
:root {
    /* Z-index scale */
    --lcars-z-index-dropdown: 1000;
    --lcars-z-index-dialog: 2000;
    --lcars-z-index-tooltip: 3000;
    
    /* Transition timing */
    --lcars-transition-fast: 0.1s ease-out;
    --lcars-transition-normal: 0.2s ease-out;
    
    /* Consistent spacing scale */
    --lcars-spacing-xs: 5px;
    --lcars-spacing-sm: 8px;
    --lcars-spacing-md: 15px;
    --lcars-spacing-lg: 20px;
    --lcars-spacing-xl: 30px;
}
```

Currently there are hardcoded values like `z-index: 1000` scattered in multiple places (L759, L852, L961).

**Action:** Add missing token categories to `:root`.

---

### 3. Redundant `--shape-color` Variable

In every theme, `--shape-color` is just set to `--theme-main`:

```css
body[data-theme="laan"] {
    --theme-main: #830025;
    --shape-color: var(--theme-main);  /* ← Always same as theme-main */
    --theme-secondary: ...
}
```

**Action:** Either remove `--shape-color` and use `--theme-main` directly, or document why the indirection exists (perhaps for future per-component overrides).

---

### 4. Inconsistent Naming Patterns

Primitives mix naming conventions:

| Pattern | Examples |
|---------|----------|
| BEM-like (correct) | `lcars-tile--bookmark`, `lcars-pin--sm` |
| Multi-hyphen compound | `lcars-header-bar-home`, `lcars-footer-bar-button` |
| Legacy non-prefixed | `action-btn--small`, `cat-btn`, `form-group` |

**Recommended naming convention:**

- `lcars-{component}` — base primitive
- `lcars-{component}--{variant}` — modifier
- `lcars-{component}-{element}` — child element
- `lcars-{component}-{element}--{variant}` — child element modifier

**Action:** Document naming convention in DESIGN.md and refactor inconsistent names.

---

### 5. Empty Extension Points

These role helpers are completely empty:

```css
.lcars-dialog-action {
    /* Extension point: dialog-specific button tweaks */
}

.lcars-settings-action {
    /* Extension point: settings panel button tweaks */
}

.lcars-footer-action {
    /* Extension point: footer bar button tweaks */
}
```

Empty classes add confusion.

**Action:** Either add actual styles that distinguish these contexts, or remove them and document the extension pattern in DESIGN.md.

---

### 6. Form Inputs Not Namespaced

Global element styling will conflict if extracted to a design system:

```css
input,
select,
textarea {
    width: 100%;
    padding: 10px;
    background-color: var(--lcars-dark-2);
    ...
}
```

**Action:** Create `lcars-input`, `lcars-select`, `lcars-textarea` classes and apply them explicitly in HTML.

---

### 7. Focus Bar Pattern Not Applied Consistently

`.lcars-focus-bar` is defined as a helper class, but many components duplicate the focus bar logic instead of using it:

```css
.lcars-footer-bar-button:focus-visible::after {
    /* Duplicates the focus bar pattern instead of using helper */
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: var(--lcars-focus-bar-top, -9px);
    ...
}
```

The same duplication exists for `.app-title`, `.lcars-header-bar-home`, `.cat-btn`, etc.

**Action:** Either:
- Apply `lcars-focus-bar` class in HTML and remove duplicate CSS, or
- Accept that focus bar is per-component (and remove the helper class)

---

### 8. Legacy Alias Comment Style Inconsistency

TODO comments use inconsistent styles:

```css
.settings-tile {
    /* Alias: use lcars-tile lcars-tile--settings instead */
```

vs

```css
/* ==============================================
   SETTINGS BREADCRUMB (Legacy Alias)
   TODO: Migrate to .lcars-breadcrumb.lcars-breadcrumb--settings
```

**Action:** Pick one style and apply consistently.

---

## 📋 Design System Readiness Checklist

| Category | Status | Action Needed |
|----------|--------|---------------|
| Design tokens | 🟢 Good | ✅ Added z-index, transition, spacing scales |
| Theme system | 🟡 Partial | Clarify `--shape-color` purpose or remove |
| Primitives | 🟢 Good | Well-defined core set |
| Legacy cleanup | 🔴 Blocking | Remove ~500 lines of duplicates |
| Naming convention | 🟡 Partial | Document and enforce BEM-like pattern |
| Form primitives | 🔴 Blocking | Namespace as `lcars-input`, etc. |
| Focus system | 🟡 Partial | Consolidate to use helper class consistently |
| Extension points | 🟡 Partial | Remove empty classes or add real styles |

---

## Recommended Action Plan

### Phase 1: Token Cleanup

1. ✅ Add missing tokens to `:root`:
   - ✅ `--lcars-z-index-*` scale (`--lcars-z-index-dropdown`, `--lcars-z-index-dialog`, `--lcars-z-index-tooltip`)
   - ✅ `--lcars-transition-*` timing (`--lcars-transition-fast`, `--lcars-transition-normal`)
   - ✅ `--lcars-spacing-*` scale (`--lcars-spacing-xs` through `--lcars-spacing-xl`)
2. ✅ Replace hardcoded values with tokens throughout CSS:
   - ✅ Replaced `z-index: 1000` with `var(--lcars-z-index-dropdown)` in `.lcars-expandable-menu`, `.add-menu`, `.cat-submenu`
   - ✅ Replaced `transition: ... 0.2s` with `var(--lcars-transition-normal)` in `.lcars-arrow-btn`, `.lcars-arrow-btn svg`, `.cat-btn`, `.lcars-tile-pin`, `.lcars-pin`
3. Decide on `--shape-color` fate (remove or document purpose)

### Phase 2: Legacy Migration

1. Update HTML to use primitive classes:
   - `lcars-category-tile` → `lcars-tile lcars-tile--category`
   - `bookmark-tile` → `lcars-tile lcars-tile--bookmark`
   - `settings-tile` → `lcars-tile lcars-tile--settings`
   - `lcars-tile-pin` → `lcars-pin lcars-pin--sm`
   - `category-config-btn` → `lcars-pin lcars-pin--lg lcars-pin--bordered`
   - `add-wrapper/add-menu/add-menu-item` → `lcars-expandable` equivalents
   - `settings-breadcrumb` → `lcars-breadcrumb lcars-breadcrumb--settings`
   - `status-display` → `lcars-status-display`
2. Delete legacy alias CSS blocks after HTML migration

### Phase 3: Form Primitives

1. Create `lcars-input`, `lcars-select`, `lcars-textarea` classes
2. Update HTML to use namespaced classes
3. Remove global `input, select, textarea` styling

### Phase 4: Focus System Consolidation

1. Decide on focus bar strategy (helper class vs per-component)
2. Consolidate duplicate focus bar implementations
3. Test keyboard navigation across all components

### Phase 5: Documentation

1. Document naming convention in DESIGN.md
2. Update LCARS Primitive Catalog with any changes
3. Remove or populate empty extension point classes

---

## Notes

- **Ground truth:** `index.html` is the source of truth per AGENTS.md
- **Constraint:** Single HTML file with inline CSS/JS, no build step
- **Priority:** Legacy cleanup is blocking for design system extraction

---

*Review conducted: See git history for date*
*Based on: `index.html` CSS block (Lines 14-2443)*