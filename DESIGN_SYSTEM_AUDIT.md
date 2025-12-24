# Design System Readiness Audit

**Date:** 2023-10-27
**Target:** `index.html` Component
**Status:** Needs Refactoring

## Executive Summary

While the visual design and basic structure of the Zander component are solid and authentic to the LCARS aesthetic, there are several architectural and accessibility issues that should be addressed before moving this into a reusable design system.

## 1. Accessibility (A11Y) Compliance

### ARIA State Mismatch (`aria-expanded`)
*   **Issue:** The "ADD ENTRY" button has `aria-expanded="false"`, but the menu visibility is controlled entirely by CSS (`:hover` / `:focus-within`).
*   **Impact:** Screen readers will announce the menu as collapsed even when it is visually open.
*   **Fix:** Use JavaScript to toggle the `aria-expanded` attribute on the button when the menu is opened/closed, or switch to a JS-controlled disclosure pattern.

### Dialog Labeling
*   **Issue:** Dialogs (e.g., `#bookmarkDialog`) use `aria-label="Bookmark Entry Dialog"` while also containing a visible `<h2>` with the title "NEW ENTRY".
*   **Impact:** This is redundant and can be inconsistent if the text changes.
*   **Fix:** Use `aria-labelledby="dialogTitle"` on the `<dialog>` element to point to the visible heading ID.

### Focus Management
*   **Issue:** The "Add Entry" button logic forces focus to the first menu item (`#addBookmarkBtn`) immediately upon clicking.
*   **Impact:** This is non-standard behavior for a menu button if it relies on hover for other users. It bypasses the user's expectation of opening a menu first.
*   **Fix:** Ensure standard keyboard interaction: Enter/Space on the button should open the menu and *then* place focus on the first item.

### Missing Interactive Elements
*   **Issue:** The CSS defines `.lcars-sidebar-bar-toggle`, but this button is missing from the HTML structure.
*   **Impact:** While mobile support is not currently planned (see Notes), having CSS for elements that don't exist in the DOM creates confusion for maintainers.
*   **Fix:** Remove the unused CSS or implement the element if it serves a purpose on desktop (e.g., collapsing the sidebar).

## 2. Design System Architecture

### Hardcoded IDs
*   **Issue:** The component relies heavily on global IDs (e.g., `#bookmarksView`, `#settingsView`, `#homeBtn`).
*   **Impact:** You cannot have two instances of this component on the same page (e.g., a "User Bookmarks" and "System Bookmarks" widget side-by-side).
*   **Fix:** Refactor to use classes (e.g., `.js-bookmarks-view`) or scoped data attributes, and query elements within the component's root.

### Inline SVGs
*   **Issue:** SVGs are hardcoded directly in the HTML.
*   **Impact:** This makes maintenance difficult and bloats the HTML.
*   **Fix:** Extract these into an Icon component or an SVG sprite system.

### Global CSS Scope
*   **Issue:** Styles are defined globally (e.g., `body[data-theme]`, `.lcars-button`).
*   **Impact:** These styles will leak into other parts of an application consuming this design system.
*   **Fix:** Ensure all styles are strictly scoped (e.g., using BEM strictly or CSS Modules/Shadow DOM if moving to a framework).

## 3. Code Quality & Semantics

*   **Semantic HTML:** The use of `<aside>`, `<main>`, `<nav>`, and `<dialog>` is excellent.
*   **CSS Variables:** The extensive use of `:root` variables for theming is a strong foundation for a design system.

## 4. Recommended Action Plan

1.  **Refactor IDs to Classes:** Remove reliance on `document.getElementById` and use `container.querySelector` instead.
2.  **Fix ARIA States:** Implement a small JS utility to sync `aria-expanded` with the menu's visual state.
3.  **Extract Icons:** Move inline SVGs to a reusable definition.
4.  **Standardize Dialogs:** Update dialogs to use `aria-labelledby`.

## 5. Notes

*   **Mobile Support:** There is no planned mobile support for this iteration. The UI is designed specifically for desktop environments. Any refactoring regarding responsive design (like the missing sidebar toggle) should be considered low priority or removed if it complicates the desktop code.