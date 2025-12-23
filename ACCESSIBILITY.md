# ACCESSIBILITY

Target: **WCAG 2.1 Level AA** compliance while preserving LCARS authenticity.

---

## Philosophy

Accessibility is not optional—it's part of the design from the start. The Zander LCARS Bookmark System must be usable by everyone, including people with disabilities. When accessibility and LCARS aesthetics conflict, discuss tradeoffs explicitly rather than compromising on inclusion.

---

## For All Agents

- **Accessibility is a first-class concern.** It's as important as LCARS visual authenticity and the single-file constraint.
- **Inclusive design strengthens LCARS.** High contrast, keyboard navigation, and clear focus states fit the authoritative, technical feel of a starship interface.
- **Test early and often.** Don't treat a11y as a final polish step; validate during development.

---

## Frontend Agent: Implementation Checklist

### HTML & Semantic Structure

- Use semantic elements: `<main>`, `<aside>`, `<nav>`, `<button>`, `<dialog>`, `<form>`, `<label>`, etc.
- Avoid generic `<div>` and `<span>` when semantic alternatives exist.
- Use `<button>` for all clickable actions (not `<div onclick>`).
- Use `<a>` for links that navigate away from the app.
- Use `<input>` with associated `<label>` for form fields; always include `for` and `id` attributes.

### Keyboard Navigation

- **All interactive elements must be keyboard-accessible:**
  - Buttons and links: Tab to focus, Enter/Space to activate.
  - Dialogs: Focus trap (keep focus inside until closed with Escape or confirm/cancel).
  - Sidebar category buttons: Tab between them; arrow keys may enhance (optional but encouraged).
  - Text inputs: Tab to focus, type to edit, Tab to move to next field.

- **Keyboard shortcuts must respect input focus:**
  - Alt+H, Alt+B, Alt+S, Alt+C should not fire when user is typing in a text field.
  - Check `event.target.tagName` and `event.target.contentEditable` before triggering shortcuts.

- **Escape key closes dialogs** (standard modal behavior).

- **Enter key submits dialog forms:**
  - Dialog forms do not use `method="dialog"` to ensure Enter properly triggers the `submit` event.
  - Pressing Enter in any form field saves the bookmark or category.

- **Add Entry menu keyboard navigation:**
  - Tab to `ADD ENTRY` button: Focus lands on the button with visible focus bar; menu expands automatically (via CSS `:focus-within`) so keyboard users see the options.
  - Tab again: Focus moves to `BOOKMARK` menu item (focus bar on top).
  - Tab again: Focus moves to `CATEGORY` menu item (focus bar on top).
  - Tab again: Focus moves to `SETTINGS`; menu closes as focus leaves the wrapper.
  - Enter/Space on menu item: Opens the corresponding dialog.
  - Click on `ADD ENTRY`: Moves focus to the first menu item (`BOOKMARK`).

### Focus States & Visibility

- **Every interactive element must have a visible focus state** that meets contrast requirements.
- Neon glow effects and LCARS-style focus bars are welcome if they achieve sufficient contrast (4.5:1 for text, 3:1 for UI components).
- Focus indicators must be distinguishable from other visual states (hover, active, disabled).
- Do not remove default focus outlines without providing an equally visible alternative via CSS (for example, the LCARS white focus bar used on category, footer, and title buttons).

**Example:** A neon cyan glow with sufficient brightness can serve as a focus indicator without relying on a traditional outline.

### Color & Contrast

- **Text contrast:**
  - Normal text (≤18pt or ≤14pt bold): **4.5:1 minimum** (AA standard).
  - Large text (≥18pt or ≥14pt bold): **3:1 minimum** (AA standard).
  - This includes text on buttons, labels, and status displays.

- **UI component contrast (borders, active states):**
  - Non-text UI components: **3:1 minimum** (AA standard).
  - Examples: button borders, focus rings, active tab indicators, icon colors.

- **Do not rely on color alone** to convey meaning:
  - If a bookmark tile uses color to indicate status, also use text, icon, or pattern.
  - Example: "Added today" (stardate indicator) should include text, not just a color wash.

- **Test with tools:**
  - Use [axe DevTools](https://www.deque.com/axe/devtools/), [WAVE](https://wave.webaim.org/), or WebAIM's contrast checker.
  - Simulate color blindness in DevTools (DevTools → Rendering → Emulate vision deficiency).

### Screen Reader & ARIA

- **Provide meaningful labels:**
  - Use `aria-label` or `aria-labelledby` for icon-only buttons (e.g., close button: `aria-label="Close dialog"`).
  - Use `<label>` for form inputs; ensure `for` attribute matches `id`.

- **Announce dynamic changes:**
  - Use `aria-live="polite"` for status updates (e.g., "Bookmark added to Engineering").
  - Use `aria-atomic="true"` if the entire region should be announced.

- **Dialogs & modals:**
  - Use `<dialog>` element (native HTML5 focus trapping).
  - For older browser support, ensure manual focus trapping: set initial focus, trap Tab/Shift+Tab, restore focus on close.

- **ARIA roles (sparingly):**
  - Prefer semantic HTML. Use ARIA only when HTML semantics are insufficient.
  - Example: If a `<div>` must act like a button (only in edge cases), use `role="button"` **and** `tabindex="0"` **and** keyboard handlers.

### Images & Icons

- **Icon-only buttons:** Provide `aria-label` describing the action.
  - Example: `<button aria-label="Delete this bookmark">🗑️</button>`
- **Decorative icons:** Use `aria-hidden="true"` if the icon is purely visual and the action is described elsewhere.

### Truncated Text & Tooltips

- **Use `title` attribute for truncated content:**
  - When text is visually truncated (e.g., via `text-overflow: ellipsis`), provide the full content in a `title` attribute so users can access it on hover.
  - Example: Bookmark URLs are truncated on tiles but the full URL is available via `title` on `.bookmark-url-text`.
- **Note:** `title` attributes are not reliably announced by all screen readers; ensure essential information is also available via `aria-label` on the parent element where appropriate.

### Form Accessibility

- Every `<input>` and `<textarea>` must have an associated `<label>` or `aria-label`.
  - The description textarea uses `aria-label="Bookmark Description"` since it has a visible label but benefits from explicit labeling for screen readers.
- Use `aria-describedby` for hints or validation messages:
  - Example: `<input id="url" aria-describedby="url-hint">` + `<small id="url-hint">Enter a valid HTTP or HTTPS URL</small>`
- Use `maxlength` attribute to enforce character limits (e.g., `maxlength="64"` for title, `maxlength="512"` for description).
- Use `placeholder` for optional fields to indicate they are not required (e.g., "Optional description...").
- Validate on blur or submit; announce errors clearly.

### Headings & Document Structure

- Use `<h1>`, `<h2>`, etc. in hierarchical order (don't skip levels like `<h1>` → `<h3>`).
- Dialogs and panels may have their own heading hierarchy (e.g., a Settings dialog starts with `<h2>`).

---

## Testing & Validation

### Automated Tools

Before merging changes to `index.html`:

1. **axe DevTools** (Chrome/Firefox extension)
   - Scan the page; fix high-priority issues.
   - Focus on contrast, missing labels, and keyboard traps.

2. **WAVE** (WebAIM browser extension)
   - Visual feedback on errors, warnings, and features.
   - Good for learning what's missing.

3. **Lighthouse** (Chrome DevTools)
   - Run Audits → Accessibility.
   - Useful for a quick baseline.

### Manual Keyboard Testing

1. Open `index.html` in a browser.
2. Press **Tab** and **Shift+Tab** to navigate all interactive elements.
3. Press **Enter** or **Space** to activate buttons.
4. Press **Escape** to close dialogs.
5. Verify focus is always visible and logical.

### Screen Reader Testing

Choose one or more of:

- **NVDA** (Windows, free) – [Download](https://www.nvaccess.org/)
- **JAWS** (Windows, paid) – Free trial available
- **VoiceOver** (macOS/iOS, built-in) – Enable in System Preferences → Accessibility
- **TalkBack** (Android, built-in)

**Test these flows:**
- Navigate to Bookmarks view and add a new bookmark via dialog (including title, optional description, URL, and category).
- Announce the bookmark tile content and available actions:
  - Title (max 64 characters)
  - Description (if present, max 512 characters, displayed with line clamping)
  - URL (truncated visually; full URL available via `title` attribute on hover)
- Navigate to Settings and adjust category colors.
- Open and close dialogs; verify focus is restored.

---

## Design Patterns for LCARS Accessibility

### Focus Indicators

LCARS neon aesthetic + accessibility:

- **LCARS Focus Bar Pattern:** Primary LCARS controls (e.g., category buttons, footer action buttons, menu items, and the header title button) use a **white focus bar** rendered via `:focus-visible::after` instead of the default browser outline.
  - Sidebar category buttons show a vertical white bar along the **leading edge** of the button.
  - Footer action buttons show a horizontal white bar along the **top edge**.
  - Add Entry menu items (BOOKMARK, CATEGORY) show a horizontal white bar along the **top edge**.
  - The `ZANDER` title button shows a horizontal white bar along the **bottom edge** when focused via keyboard.
- **Neon Glow Focus (optional):** A bright cyan or amber glow (box-shadow) may still be used for other focusable elements that do not participate in the LCARS button system, as long as it meets 4.5:1 contrast.
- **Generic Focus Styles:** Elements without custom LCARS button styling retain a more generic but clearly visible focus outline so they remain discoverable via keyboard.
- **Ensure visibility** in both light and dark contexts (test in DevTools).

### High Contrast

- LCARS already uses high-contrast colors (black backgrounds, bright accent colors).
- Verify text-on-background meets 4.5:1; if not, lighten text or darken background.
- Avoid relying on subtle color shifts; use bold, distinct colors.

### Keyboard Shortcuts

- Display keyboard shortcuts in UI hints and dialogs (e.g., "Alt+N to create new bookmark").
- Make them optional; ensure the same action is available via mouse/touch.

### Status & Feedback

- When a bookmark is added, deleted, or moved, announce the action:
  - Visual: Briefly highlight the affected area or show a toast message.
  - Auditory (for screen reader users): Use `aria-live="polite"` region.
  - Example: `<div aria-live="polite" aria-atomic="true" id="status"></div>` + update on state change.

---

## Non-Negotiables

These are hard requirements:

1. ✅ All text meets WCAG AA contrast (4.5:1 normal, 3:1 large).
2. ✅ All interactive elements are keyboard-accessible (Tab, Enter, Escape).
3. ✅ Focus indicators are always visible.
4. ✅ Dialogs trap focus and can be closed with Escape.
5. ✅ Form inputs have associated labels.
6. ✅ Semantic HTML is used wherever possible.
7. ✅ No information is conveyed by color alone.

---

## References

- [WCAG 2.1 Overview](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM: Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN: ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: HTML5 Dialog Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [The A11Y Project Checklist](https://www.a11yproject.com/checklist/)