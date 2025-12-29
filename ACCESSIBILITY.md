# ACCESSIBILITY

Target: **WCAG 2.1 Level AA** compliance while preserving LCARS authenticity.

---

## Philosophy

Accessibility is not optional—it's part of the design from the start. The Zander LCARS Bookmark System must be usable by everyone, including people with disabilities. When accessibility and LCARS aesthetics conflict, discuss tradeoffs explicitly rather than compromising on inclusion.

---

## For contributors

- **Accessibility is a first-class concern.** It's as important as LCARS visual authenticity and the core user flows.
- **Inclusive design strengthens LCARS.** High contrast, keyboard navigation, and clear focus states fit the authoritative, technical feel of a starship interface.
- **Test early and often.** Don't treat a11y as a final polish step; validate during development.

---

## Svelte 5 implementation notes

- Prefer **semantic elements** over ARIA wherever possible.
- Prefer DOM-style event attributes (`onclick={...}` etc.) rather than legacy `on:click` directives.
- Do not create “fake buttons” with `<div onclick>`. Use `<button>` or `<a>`.
- If you must implement custom keyboard interaction:
  - handle `keydown` for **Enter** and **Space** (Space should call `preventDefault()` to avoid page scroll)
  - ensure focusability (`tabindex="0"`) and role only when semantics truly cannot be used
- When shifting focus programmatically after state changes (view switches, dialog open):
  - do it after the DOM updates (e.g. `queueMicrotask`, `requestAnimationFrame`, or a `$effect` that runs after the relevant element exists)

---

## Frontend implementation checklist

### HTML & semantic structure

- Use semantic elements: `<main>`, `<aside>`, `<nav>`, `<button>`, `<form>`, `<label>`, etc.
- Avoid generic `<div>` and `<span>` when semantic alternatives exist.
- Use `<button>` for actions (not `<div onclick>`).
- Use `<a>` for links that navigate (including “open in new tab” destinations).
- Every form control must have an accessible name:
  - Prefer `<label for="…">` + `id`
  - Otherwise use `aria-label` / `aria-labelledby`

### Skip link and focus targets

- Provide a **Skip to main content** link as the first focusable element in the app.
- Ensure the main region can receive programmatic focus: `<main id="main" tabindex="-1">`.
- On view changes, move focus to a predictable target (main region or view heading) to keep keyboard users oriented.

### Keyboard navigation

- **All interactive elements must be keyboard-accessible**
  - Tab / Shift+Tab to move focus
  - Enter activates links
  - Enter/Space activates buttons (Space must not scroll the page)

- **Keyboard shortcuts must respect input focus**
  - Shortcuts must not fire when the user is typing in an `<input>`, `<textarea>`, `<select>`, or `[contenteditable="true"]`.
  - Check `event.target` and `closest('input, textarea, select, [contenteditable="true"]')` before triggering shortcuts.

- **Shortcut policy**
  - Shortcuts are optional enhancements and must never be required for core use.
  - Shortcuts may conflict with browser/OS defaults (especially `Alt+…`). Document expected behavior and accept that some shortcuts may not work on all platforms/browsers.
  - Always provide equivalent UI controls.

- **Escape closes dialogs** (cancel).

- **Enter behavior in dialogs**
  - Enter should submit when focus is on the primary action button or when submitting from a single-line field is expected.
  - Enter must **not** submit when focus is inside a `<textarea>`.
  - Do not rely on `method="dialog"` for form submission behavior; treat submit as an explicit app action.

- **Add Entry menu keyboard navigation** (if present)
  - Tab to `ADD ENTRY`: focus lands on the button with visible focus indicator.
  - Menu expansion must be keyboard-accessible (via explicit state or `:focus-within`).
  - Tab moves through menu items in a logical order; menu closes when focus leaves.
  - Enter/Space on a menu item triggers its action.
  - Activating `ADD ENTRY` should move focus to the first menu item.

### Dialogs and modals

- Dialogs must implement:
  - **Initial focus on open** (first invalid field, otherwise the primary action).
  - **Tab/Shift+Tab focus trapping** within the dialog.
  - **Focus restoration on close** back to the triggering control.
- `<dialog>` may be used as a container element, but focus management is still required and must be tested.
- Dialog content must be labeled:
  - Provide a visible title and connect it via `aria-labelledby`, or use `aria-label` when necessary.
- For destructive/high-impact confirms, `role="alertdialog"` may be used **only** if the component follows the WAI-ARIA Authoring Practices pattern (labeling + focus management).

### Focus states and visibility

- **Every interactive element must have a visible focus state** that meets contrast requirements.
- LCARS-style focus bars and glow effects are welcome if they achieve sufficient contrast:
  - **3:1 minimum** contrast for focus indicators and UI component boundaries.
- Focus indicators must be distinguishable from hover/active/selected states.
- Do not remove default focus outlines without providing an equally visible alternative.

#### `:focus-visible` fallback

Some older browsers may not fully support `:focus-visible`.

- Prefer using `:focus-visible` when available.
- Provide a fallback so keyboard users still get a visible focus indicator:
  - Either a conservative `:focus` style (acceptable if it doesn’t harm the UI), or
  - A `focus-visible` polyfill strategy if you decide it’s necessary later
- Never ship “no focus style” on older targets.

### Color & contrast

- **Text contrast**
  - Normal text: **4.5:1 minimum**
  - Large text: **3:1 minimum**

- **UI component contrast**
  - Non-text UI components (borders, focus indicators, icons): **3:1 minimum**

- **Do not rely on color alone**
  - If color communicates state/meaning, also use text, icon, or pattern.

- **Test with tools**
  - axe DevTools, WAVE, Lighthouse
  - Contrast checker (WebAIM)
  - Vision deficiency simulation (DevTools → Rendering → Emulate vision deficiency)

### Target sizes and pointer accessibility

- Interactive controls must be comfortably clickable:
  - Prefer **44×44 CSS px** for primary actions.
  - Icon-only buttons should be at least **24×24 CSS px**, preferably larger.
- Ensure sufficient spacing so adjacent controls are not easily mis-clicked.

### Screen reader & ARIA

- **Provide meaningful labels**
  - Icon-only buttons must have `aria-label` describing the action (e.g., “Close dialog”, “Delete bookmark”).
  - Use `<label>` for form inputs whenever possible.

- **Announce dynamic changes**
  - Use an `aria-live="polite"` region for non-critical updates (e.g., “Bookmark added to ENGINEERING”).
  - Use `aria-atomic="true"` if the whole region should be announced as a unit.

- **ARIA roles (sparingly)**
  - Prefer semantic HTML. Use ARIA only when semantics are insufficient.
  - If an element must act like a button (edge cases only), it must include:
    - `role="button"`
    - `tabindex="0"`
    - Enter/Space keyboard activation handlers

### Truncated text and tooltips

- `title` may be used as a **mouse hover convenience** for truncated text, but must not be the only way to access essential information.
- Essential truncated content must be accessible via:
  - visible text, or
  - `aria-label`, or
  - `aria-describedby` referencing a visually-hidden full-text element.

### Forms and validation

- Every `<input>` and `<textarea>` must have an associated `<label>` or `aria-label`.
- Use `aria-describedby` for hints and validation messages.
- Enforce limits with `maxlength` where applicable (e.g., title and description).
- Errors must be:
  - clearly described in text,
  - associated to inputs via `aria-describedby` (or similar),
  - announced in a screen-reader-friendly way (e.g., focus first invalid field + error text near it).

### Headings & document structure

- Use headings in a logical hierarchy (`<h1>` → `<h2>` → `<h3>`; don’t skip levels).
- Views should have a clear heading at the top of the main region.
- Dialogs should have their own title heading and labeling.

### Motion and visual effects

- Respect `prefers-reduced-motion: reduce`:
  - disable or significantly reduce non-essential animations
  - avoid large parallax/scroll-linked effects
- Avoid flashing effects above **3 flashes per second**.

---

## Testing & validation

### Automated tools

Before merging UI changes:

1. **axe DevTools**
   - Fix high-priority issues first (missing labels, contrast, keyboard traps).

2. **WAVE**
   - Useful for quick visual feedback and catching common omissions.

3. **Lighthouse**
   - Provides a baseline accessibility score; not sufficient on its own.

### Manual keyboard testing

1. Run the SPA (dev server or built preview).
2. Use **Tab** and **Shift+Tab** to navigate all interactive elements.
3. Use **Enter** to activate links; use **Enter/Space** to activate buttons.
4. Use **Escape** to close dialogs.
5. Verify focus is always visible, logical, and restored correctly after dialogs close.
6. Verify the Skip link works and focus moves to main content.

### Screen reader testing

Choose one or more:

- **NVDA** (Windows) – https://www.nvaccess.org/
- **JAWS** (Windows) – trial available
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)

Test these flows:
- Navigate to Bookmarks view and add a bookmark via dialog (including optional description).
- Verify bookmark tile content and actions are announced meaningfully.
- Navigate to Settings and adjust category colors (if supported).
- Open/close dialogs; confirm labeling, focus trapping, and focus restoration.
- Verify dynamic status announcements via `aria-live` when relevant.

---

## Design patterns for LCARS accessibility

### Focus indicators

LCARS neon aesthetic + accessibility:

- **LCARS focus bar pattern**
  - Primary LCARS controls (category buttons, footer actions, menu items, header title/home) use a high-contrast focus bar via `:focus-visible`.
  - Focus bars must meet **3:1** contrast and be visually distinct from hover/selected styles.

- **Neon glow focus (optional)**
  - Glows are allowed if they remain clearly visible and do not become the only focus signal.

- **Fallback focus**
  - Controls that do not participate in LCARS primitives must still have a strong, visible focus outline.

### High contrast

- LCARS tends toward high-contrast colors (dark backgrounds, bright accents).
- Verify text-on-background meets AA requirements; adjust text/background rather than reducing legibility.
- Avoid relying on subtle color shifts; use bold and distinct states.

### Status and feedback

- Provide both visual and screen-reader-friendly feedback for important actions.
- For screen readers, update a dedicated live region:
  - Example: `<div aria-live="polite" aria-atomic="true" id="status"></div>`

---

## Non-negotiables

1. ✅ All text meets WCAG AA contrast (4.5:1 normal, 3:1 large).
2. ✅ All interactive elements are keyboard-accessible.
3. ✅ Focus indicators are always visible.
4. ✅ Dialogs trap focus and restore focus on close.
5. ✅ Form inputs have associated labels.
6. ✅ Semantic HTML is used wherever possible.
7. ✅ No essential information is conveyed by color alone.
8. ✅ Reduced motion is respected.

---

## References

- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- MDN: `<dialog>` element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
- The A11Y Project Checklist: https://www.a11yproject.com/checklist/
