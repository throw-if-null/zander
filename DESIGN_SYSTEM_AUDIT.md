# Design System Readiness Audit

**Date:** 2023-10-27
**Target:** `index.html` Component
**Status:** Complete

## Executive Summary

While the visual design and basic structure of the Zander component are solid and authentic to the LCARS aesthetic, there are several architectural and accessibility issues that should be addressed before moving this into a reusable design system.

## 1. Accessibility (A11Y) Compliance ✅ COMPLETED

### ARIA State Mismatch (`aria-expanded`) ✅ FIXED
*   **Issue:** The "ADD ENTRY" button has `aria-expanded="false"`, but the menu visibility is controlled entirely by CSS (`:hover` / `:focus-within`).
*   **Impact:** Screen readers will announce the menu as collapsed even when it is visually open.
*   **Fix:** ~~Use JavaScript to toggle the `aria-expanded` attribute on the button when the menu is opened/closed, or switch to a JS-controlled disclosure pattern.~~
*   **Resolution:** Implemented JS-controlled disclosure pattern with `.is-open` class. The `aria-expanded` attribute now dynamically updates based on menu visibility for both hover and keyboard interactions.

### Dialog Labeling ✅ FIXED
*   **Issue:** Dialogs (e.g., `#bookmarkDialog`) use `aria-label="Bookmark Entry Dialog"` while also containing a visible `<h2>` with the title "NEW ENTRY".
*   **Impact:** This is redundant and can be inconsistent if the text changes.
*   **Fix:** ~~Use `aria-labelledby="dialogTitle"` on the `<dialog>` element to point to the visible heading ID.~~
*   **Resolution:** All dialogs now use `aria-labelledby` pointing to their visible heading IDs (`#dialogTitle`, `#categoryDialogTitle`, `#confirmTitle`, `#colorPickerDialogTitle`).

### Focus Management ✅ FIXED
*   **Issue:** The "Add Entry" button logic forces focus to the first menu item (`#addBookmarkBtn`) immediately upon clicking.
*   **Impact:** This is non-standard behavior for a menu button if it relies on hover for other users. It bypasses the user's expectation of opening a menu first.
*   **Fix:** ~~Ensure standard keyboard interaction: Enter/Space on the button should open the menu and *then* place focus on the first item.~~
*   **Resolution:** Implemented standard menu button behavior: Tab to button keeps menu closed, Enter/Space opens menu and moves focus to first item, Escape closes menu and returns focus to trigger button.

### Missing Interactive Elements ✅ FIXED
*   **Issue:** The CSS defines `.lcars-sidebar-bar-toggle`, but this button is missing from the HTML structure.
*   **Impact:** While mobile support is not currently planned (see Notes), having CSS for elements that don't exist in the DOM creates confusion for maintainers.
*   **Fix:** ~~Remove the unused CSS or implement the element if it serves a purpose on desktop (e.g., collapsing the sidebar).~~
*   **Resolution:** Removed the unused `.lcars-sidebar-bar-toggle` CSS rules (21 lines of dead code).

## 2. Design System Architecture

### Hardcoded IDs ✅ FIXED
*   **Issue:** The component relied heavily on global IDs (e.g., `#bookmarksView`, `#settingsView`, `#homeBtn`).
*   **Impact:** You could not have two instances of this component on the same page (e.g., a "User Bookmarks" and "System Bookmarks" widget side-by-side).
*   **Fix:** ~~Refactor to use classes (e.g., `.js-bookmarks-view`) or scoped data attributes, and query elements within the component's root.~~
*   **Resolution:** Refactored all element references to use `js-` prefixed classes:
    - Created root container pattern with `appRoot = document.querySelector(".js-lcars-app")` and scoped `$()` helper
    - Replaced all `getElementById()` calls with `$(".js-*")` queries
    - Added `js-` prefixed classes to all elements needing JavaScript hooks (views, buttons, dialogs, form elements)
    - Dialogs use `$dialog()` helper that queries from `document` (required for `<dialog>` elements)
    - Updated `onClick()` and `onChange()` helpers to accept class selectors

### Inline SVGs ✅ FIXED
*   **Issue:** SVGs are hardcoded directly in the HTML.
*   **Impact:** This makes maintenance difficult and bloats the HTML.
*   **Fix:** ~~Extract these into an Icon component or an SVG sprite system.~~
*   **Resolution:** Extracted all inline SVGs to a central `<svg><defs>` block with `<symbol>` elements. Icons are now referenced via `<use href="#icon-name">`. Icons defined: `icon-arrow-up-wide`, `icon-arrow-down-wide`, `icon-arrow-up`, `icon-arrow-down`, `icon-delete`.

### Global CSS Scope ✅ FIXED
*   **Issue:** Styles are defined globally (e.g., `body[data-theme]`, `.lcars-button`).
*   **Impact:** These styles will leak into other parts of an application consuming this design system.
*   **Fix:** ~~Ensure all styles are strictly scoped (e.g., using BEM strictly or CSS Modules/Shadow DOM if moving to a framework).~~
*   **Resolution:** Scoped styles to `.lcars-app` container:
    - Universal `box-sizing` reset now scoped to `.lcars-app *` and `.lcars-dialog-container *`
    - Global `:focus-visible` now scoped to `.lcars-app :focus-visible` and `.lcars-dialog-container :focus-visible`
    - Visual styles (`background-color`, `color`, `font-family`) moved from `body` to `.lcars-app`
    - Added `.lcars-app--fullpage` modifier for standalone full-viewport usage
    - Dialog styles now use `.lcars-dialog-container` class instead of `dialog` element selector
    - Theme variables remain on `body` (required for `data-theme` overrides) but inherit into scoped containers

## 3. Code Quality & Semantics

*   **Semantic HTML:** The use of `<aside>`, `<main>`, `<nav>`, and `<dialog>` is excellent.
*   **CSS Variables:** The extensive use of `:root` variables for theming is a strong foundation for a design system.

## 4. Recommended Action Plan

1.  ~~**Refactor IDs to Classes:** Remove reliance on `document.getElementById` and use `container.querySelector` instead.~~ ✅ DONE
2.  ~~**Fix ARIA States:** Implement a small JS utility to sync `aria-expanded` with the menu's visual state.~~ ✅ DONE
3.  ~~**Extract Icons:** Move inline SVGs to a reusable definition.~~ ✅ DONE
4.  ~~**Standardize Dialogs:** Update dialogs to use `aria-labelledby`.~~ ✅ DONE

## 5. Notes

*   **Mobile Support:** There is no planned mobile support for this iteration. The UI is designed specifically for desktop environments. Any refactoring regarding responsive design (like the missing sidebar toggle) should be considered low priority or removed if it complicates the desktop code.