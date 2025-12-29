# ZANDER Glossary & Ubiquitous Language

This document defines the **ubiquitous language** for the Zander LCARS Bookmark System.

## Source of truth for terminology

When definitions disagree:

1. **Implementation contracts**
   - Domain types and contracts in `src/lib/state/model.ts` (or `src/lib/state/stateTypes.ts` until `model.ts` is the canonical file)
   - Persistence port in `src/lib/persistence/PersistenceBackend.ts`
2. **Behavioral truth**
   - Tests (Vitest/component tests, Playwright when present)
3. **Docs**
   - `ARCHITECTURE.md`, then this glossary, then other docs

This glossary should stay aligned with the contracts and behavior above.

---

## 1. Core domain concepts

### 1.1 Bookmark

A saved URL with a title and optional description that belongs to **exactly one category**.

**Contract (`Bookmark` in the canonical state model file)**
- `id: string` — stable identifier
- `title: string`
- `description?: string`
- `url: string` — normalized URL including protocol
- `categoryId: string` — owning `Category.id`
- `createdAt: string` — creation timestamp (ISO-8601 string)

**Notes**
- “Entry” (if used informally) means “Bookmark” unless explicitly stated otherwise.

### 1.2 Category

A user-defined grouping used to organize bookmarks.

**Contract (`Category` in the canonical state model file)**
- `id: string` — stable identifier
- `name: string`
- `color: string` — LCARS palette color (stored as a hex string)
- `createdAt: string` — creation timestamp (ISO-8601 string)
- `children: Category[]` — nested subcategories

### 1.3 Category tree (Category hierarchy)

The complete nested structure of categories.

**Contract**
- Stored as `State.categories: Category[]` (root nodes)
- Nesting is represented by `Category.children`

### 1.4 Root category

A category that appears directly in `State.categories` (i.e., not inside another category’s `children`).

### 1.5 Child category (Subcategory)

A category that appears inside another category’s `children`.

### 1.6 Current category

The user’s current category selection.

**Contract**
- `State.currentCategoryId: string | null`
  - `null` means “All / no category filter”
  - a non-null value must be a valid `Category.id`

**Behavior**
- Determines which bookmarks are shown in the Bookmarks View (typically the selected category subtree).
- Used as the default category selection when creating a new bookmark (unless the UI explicitly overrides).

### 1.7 Landing category (Home category)

The user-configured “Home” destination when the user activates the Home control.

**Contract**
- `State.landingCategoryId: string | null`

**Behavior**
- When “Home” is activated, the app navigates to the Bookmarks View and selects:
  - `landingCategoryId` if set and valid, otherwise
  - the default home selection (implementation-defined)

---

## 2. Application state and navigation

### 2.1 State

The full persisted application state.

**Contract (`State` in the canonical state model file)**
- `bookmarks: Bookmark[]`
- `categories: Category[]`
- `currentCategoryId: string | null`
- `currentView: ViewId`
- `currentSettingsPage: SettingsPageId`
- `landingCategoryId: string | null`

### 2.2 View

A top-level UI mode.

**Contract**
- `ViewId = "bookmarks" | "settings" | "about"`
- `State.currentView` determines the active view.

### 2.3 Settings page

A sub-page within Settings.

**Contract**
- `SettingsPageId = "categories" | "home" | "themes" | "data" | "reset" | null`
- `State.currentSettingsPage` determines the active settings page (`null` means “Settings home/overview” if implemented).

---

## 3. UI concepts

These terms describe user-facing concepts. They intentionally avoid DOM/CSS class names.

### 3.1 LCARS shell (Frame)

The persistent LCARS chrome that wraps the app content and provides global navigation/actions.

Typical regions:
- Header bar (includes Home control)
- Sidebar bar (category navigation)
- Main content region (active view)
- Footer bar (global actions/status)

### 3.2 Home control

The primary “return to home” control in the header.

**Behavior**
- Returns to the Bookmarks View.
- Selects the Landing category if configured.

### 3.3 Bookmarks View

The primary view for browsing and opening bookmarks.

Common elements:
- Bookmark grid (tiles)
- Location/breadcrumb readout (if implemented)
- Status readout (counts, stardate, etc.)

### 3.4 Settings View

The view for configuring categories, theme, data import/export, and reset flows.

### 3.5 About View

A read-only view presenting system/project information and meta readouts.

### 3.6 Dialog

A modal UI used for focused tasks (create/edit bookmark, confirm destructive actions, pick a color, etc.).

Dialog behaviors are governed by `ACCESSIBILITY.md` (focus trap, restore focus, Escape cancels, etc.).

### 3.7 Bookmark tile

A compact visual representation of a bookmark in the grid, typically including:
- title
- optional description snippet
- URL (often visually truncated)
- affordances for edit/open actions

---

## 4. Persistence, import/export, and modes

### 4.1 Persistence backend

A concrete implementation of the persistence port.

**Contract**
- `PersistenceBackend` (`loadState`, `saveState`, `exportData`, `importData`)

### 4.2 Guest mode

Mode where persistence is local to the browser.

**Behavior**
- Uses `LocalStorageBackend`.
- State is stored under the v1 storage key (example: `"zander-svelte:v1"`).

### 4.3 User mode

Authenticated mode where persistence is scoped per user.

**Behavior**
- Uses `FirestoreBackend` (v2).
- Requires an auth provider (Firebase Auth or Logto).

### 4.4 Export bundle

A versioned exportable representation of the full state.

**Contract (`ExportBundle` in the canonical state model file)**
- `version: "zander-v1"`
- `state: State`
- `meta`:
  - `exportedAt` (string timestamp)
  - `sourceBackend` (backend identifier, e.g. `"localStorage"`)

### 4.5 Import

Loading an `ExportBundle` into the app.

**Default semantics**
- Import is a full replacement unless explicitly documented otherwise.

### 4.6 Storage error

A typed error emitted by persistence operations.

**Contract (Storage error type in the canonical state model file)**
- `code: string`
- `message: string`

Common codes used in v1 localStorage backend:
- `storage-unavailable`
- `invalid-json`
- `write-failed`
- `version-unsupported`

---

## 5. Time terminology

### 5.1 Timestamp

The app stores creation timestamps as strings.

**Contract**
- Stored in `Bookmark.createdAt` and `Category.createdAt` as `string`.

**Note**
- The formatting/meaning is implementation-defined and must remain consistent for imports/exports.
- Current implementation uses ISO-8601 strings (via `new Date().toISOString()`).

---

## 6. Documentation conventions

- Use the terms in this glossary consistently in code, specs, and docs.
- When introducing a new concept or renaming an existing one:
  - update this glossary
  - update any relevant OpenSpec specs
  - update tests that encode the expected behavior
