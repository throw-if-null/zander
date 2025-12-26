import { describe, it, expect } from "vitest";
import { createStateStore } from "./stateStore";
import type { PersistenceBackend } from "../persistence/PersistenceBackend";
import type { State, ExportBundle } from "./stateTypes";

function createBackendMock(initialState: State | null) {
  let savedState: State | null = initialState;

  const backend: PersistenceBackend = {
    async loadState() {
      return savedState;
    },
    async saveState(state: State) {
      savedState = state;
    },
    async exportData() {
      return {
        bookmarks: savedState?.bookmarks ?? [],
        categories: savedState?.categories ?? [],
      };
    },
    async importData() {
      // not needed for these tests
    },
  };

  return { backend, getSavedState: () => savedState };
}

describe("stateStore", () => {
  it("loadInitialState uses persisted state when available", async () => {
    const persisted: State = {
      bookmarks: [],
      categories: [],
      currentCategoryId: null,
      currentView: "settings",
      currentSettingsPage: "themes",
      landingCategoryId: null,
    };

    const { backend } = createBackendMock(persisted);
    const store = createStateStore(backend);

    const state = await store.loadInitialState();

    expect(state).toEqual(persisted);
  });

  it("loadInitialState creates and saves default state when none persisted", async () => {
    const { backend, getSavedState } = createBackendMock(null);
    const store = createStateStore(backend);

    const state = await store.loadInitialState();

    expect(state.bookmarks).toEqual([]);
    expect(state.categories).toEqual([]);
    expect(state.currentView).toBe("bookmarks");
    expect(state.currentSettingsPage).toBeNull();

    const saved = getSavedState();
    expect(saved).not.toBeNull();
    expect(saved).toEqual(state);
  });

  it("setCurrentView switches views but preserves data", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "Test",
          url: "https://example.com",
          description: "desc",
          categoryId: "c1",
          createdAt: "stardate",
        },
      ],
      categories: [
        {
          id: "c1",
          name: "Cat",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const settingsState = await store.setCurrentView("settings");
    const aboutState = await store.setCurrentView("about");

    expect(settingsState.bookmarks).toEqual(initial.bookmarks);
    expect(settingsState.categories).toEqual(initial.categories);
    expect(settingsState.currentView).toBe("settings");

    expect(aboutState.bookmarks).toEqual(initial.bookmarks);
    expect(aboutState.categories).toEqual(initial.categories);
    expect(aboutState.currentView).toBe("about");

    const saved = getSavedState();
    expect(saved).toEqual(aboutState);
  });

  it("setCurrentSettingsPage updates view state only", async () => {
    const initial: State = {
      bookmarks: [],
      categories: [],
      currentCategoryId: null,
      currentView: "settings",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const themesState = await store.setCurrentSettingsPage("themes");
    const clearedState = await store.setCurrentSettingsPage(null);

    expect(themesState.bookmarks).toEqual(initial.bookmarks);
    expect(themesState.categories).toEqual(initial.categories);
    expect(themesState.currentSettingsPage).toBe("themes");

    expect(clearedState.bookmarks).toEqual(initial.bookmarks);
    expect(clearedState.categories).toEqual(initial.categories);
    expect(clearedState.currentSettingsPage).toBeNull();

    const saved = getSavedState();
    expect(saved).toEqual(clearedState);
  });

  it("setCurrentCategory updates currentCategoryId and preserves data", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "Test 1",
          url: "https://example.com/1",
          description: "desc1",
          categoryId: "root",
          createdAt: "stardate1",
        },
        {
          id: "b2",
          title: "Test 2",
          url: "https://example.com/2",
          description: "desc2",
          categoryId: "child",
          createdAt: "stardate2",
        },
      ],
      categories: [
        {
          id: "root",
          name: "Root",
          color: "#fff",
          createdAt: "stardate",
          children: [
            {
              id: "child",
              name: "Child",
              color: "#eee",
              createdAt: "stardate",
              children: [],
            },
          ],
        },
      ],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const childState = await store.setCurrentCategory("child");
    const allState = await store.setCurrentCategory(null);

    expect(childState.bookmarks).toEqual(initial.bookmarks);
    expect(childState.categories).toEqual(initial.categories);
    expect(childState.currentCategoryId).toBe("child");

    expect(allState.bookmarks).toEqual(initial.bookmarks);
    expect(allState.categories).toEqual(initial.categories);
    expect(allState.currentCategoryId).toBeNull();

    const saved = getSavedState();
    expect(saved).toEqual(allState);
  });

  it("setCurrentCategory falls back to first root when id invalid", async () => {
    const initial: State = {
      bookmarks: [],
      categories: [
        {
          id: "root1",
          name: "Root 1",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
        {
          id: "root2",
          name: "Root 2",
          color: "#eee",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const state = await store.setCurrentCategory("non-existent");

    expect(state.categories).toEqual(initial.categories);
    expect(state.bookmarks).toEqual(initial.bookmarks);
    expect(state.currentCategoryId).toBe("root1");

    const saved = getSavedState();
    expect(saved).toEqual(state);
  });

  it("addBookmark chooses category using explicit id, then current, then first root", async () => {
    const initial: State = {
      bookmarks: [],
      categories: [
        {
          id: "root",
          name: "Root",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: "root",
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const stateAfterA = await store.addBookmark({
      title: "A",
      url: "a.example",
      categoryId: null,
    });

    expect(stateAfterA.bookmarks).toHaveLength(1);
    const bookmarkA = stateAfterA.bookmarks[0];
    expect(bookmarkA.title).toBe("A");
    expect(bookmarkA.categoryId).toBe("root");
    expect(bookmarkA.url).toBe("https://a.example");

    const stateAfterB = await store.addBookmark({
      title: "B",
      url: "https://b.example",
      categoryId: "non-existent",
    });

    expect(stateAfterB.bookmarks).toHaveLength(2);
    const bookmarkB = stateAfterB.bookmarks.find((b) => b.title === "B");
    expect(bookmarkB).toBeDefined();
    expect(bookmarkB?.categoryId).toBe("root");

    const saved = getSavedState();
    expect(saved).toEqual(stateAfterB);
  });

  it("updateBookmark updates fields and preserves createdAt", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "Original",
          url: "https://original.example",
          description: "desc",
          categoryId: "root",
          createdAt: "stardate-original",
        },
      ],
      categories: [
        {
          id: "root",
          name: "Root",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: "root",
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const updatedState = await store.updateBookmark({
      id: "b1",
      title: "Updated",
      url: "updated.example",
      description: null,
      categoryId: "root",
    });

    const bookmark = updatedState.bookmarks[0];
    expect(bookmark.title).toBe("Updated");
    expect(bookmark.url).toBe("https://updated.example");
    expect(bookmark.description).toBeUndefined();
    expect(bookmark.categoryId).toBe("root");
    expect(bookmark.createdAt).toBe("stardate-original");

    const saved = getSavedState();
    expect(saved).toEqual(updatedState);
  });

  it("updateBookmark is a no-op when id is not found", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "Original",
          url: "https://original.example",
          description: "desc",
          categoryId: "root",
          createdAt: "stardate-original",
        },
      ],
      categories: [],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const state = await store.updateBookmark({ id: "missing", title: "Updated" });

    expect(state).toEqual(initial);
    const saved = getSavedState();
    expect(saved).toEqual(initial);
  });

  it("deleteBookmark removes a bookmark when id exists", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "One",
          url: "https://one.example",
          description: "",
          categoryId: "root",
          createdAt: "sd1",
        },
        {
          id: "b2",
          title: "Two",
          url: "https://two.example",
          description: "",
          categoryId: "root",
          createdAt: "sd2",
        },
      ],
      categories: [],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const state = await store.deleteBookmark("b1");

    expect(state.bookmarks).toHaveLength(1);
    expect(state.bookmarks[0].id).toBe("b2");

    const saved = getSavedState();
    expect(saved).toEqual(state);
  });

  it("deleteBookmark is a no-op when id is not found", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "One",
          url: "https://one.example",
          description: "",
          categoryId: "root",
          createdAt: "sd1",
        },
      ],
      categories: [],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };
 
    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);
 
    await store.loadInitialState();
 
    const state = await store.deleteBookmark("missing");
 
    expect(state).toEqual(initial);
 
    const saved = getSavedState();
    expect(saved).toEqual(initial);
  });
 
  it("addCategory adds root or child and falls back to root when parent missing", async () => {
    const initial: State = {
      bookmarks: [],
      categories: [
        {
          id: "root",
          name: "Root",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };
 
    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);
 
    await store.loadInitialState();
 
    const afterRoot = await store.addCategory({ parentId: null, name: "Second root" });
    expect(afterRoot.categories).toHaveLength(2);
    const secondRoot = afterRoot.categories[1];
    expect(secondRoot.name).toBe("Second root");
    expect(secondRoot.children).toEqual([]);
 
    const afterChild = await store.addCategory({ parentId: "root", name: "Child" });
    const rootCategory = afterChild.categories.find((category) => category.id === "root");
    expect(rootCategory).toBeDefined();
    expect(rootCategory?.children).toHaveLength(1);
    expect(rootCategory?.children[0].name).toBe("Child");
 
    const afterMissingParent = await store.addCategory({
      parentId: "missing",
      name: "Fallback root",
    });
 
    expect(afterMissingParent.categories).toHaveLength(3);
    const fallbackRoot = afterMissingParent.categories.find(
      (category) => category.name === "Fallback root",
    );
    expect(fallbackRoot).toBeDefined();
 
    const saved = getSavedState();
    expect(saved).toEqual(afterMissingParent);
  });
 
  it("moveCategory only reorders siblings and preserves subtree", async () => {
    const initial: State = {
      bookmarks: [],
      categories: [
        {
          id: "A",
          name: "A",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
        {
          id: "B",
          name: "B",
          color: "#fff",
          createdAt: "stardate",
          children: [
            {
              id: "D",
              name: "D",
              color: "#fff",
              createdAt: "stardate",
              children: [],
            },
          ],
        },
        {
          id: "C",
          name: "C",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };
 
    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);
 
    await store.loadInitialState();
 
    const afterMoveUp = await store.moveCategory({ categoryId: "B", direction: "up" });
    expect(afterMoveUp.categories.map((category) => category.id)).toEqual(["B", "A", "C"]);
 
    const categoryB = afterMoveUp.categories[0];
    expect(categoryB.children).toHaveLength(1);
    expect(categoryB.children[0].id).toBe("D");
 
    const afterMoveDown = await store.moveCategory({ categoryId: "B", direction: "down" });
    expect(afterMoveDown.categories.map((category) => category.id)).toEqual(["A", "B", "C"]);
 
    const movedB = afterMoveDown.categories.find((category) => category.id === "B");
    expect(movedB).toBeDefined();
    expect(movedB?.children).toHaveLength(1);
    expect(movedB?.children[0].id).toBe("D");
 
    const afterNoOp = await store.moveCategory({ categoryId: "missing", direction: "up" });
    expect(afterNoOp).toEqual(afterMoveDown);
 
    const saved = getSavedState();
    expect(saved).toEqual(afterNoOp);
  });
 
  it("deleteCategory cascades to descendants, bookmarks, and currentCategoryId", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "Root bookmark",
          url: "https://root.example",
          description: "",
          categoryId: "root",
          createdAt: "sd1",
        },
        {
          id: "b2",
          title: "Child bookmark",
          url: "https://child.example",
          description: "",
          categoryId: "child",
          createdAt: "sd2",
        },
        {
          id: "b3",
          title: "Other bookmark",
          url: "https://other.example",
          description: "",
          categoryId: "other",
          createdAt: "sd3",
        },
      ],
      categories: [
        {
          id: "root",
          name: "Root",
          color: "#fff",
          createdAt: "stardate",
          children: [
            {
              id: "child",
              name: "Child",
              color: "#eee",
              createdAt: "stardate",
              children: [],
            },
          ],
        },
        {
          id: "other",
          name: "Other",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: "child",
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };
 
    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);
 
    await store.loadInitialState();
 
    const afterDeleteChild = await store.deleteCategory({ categoryId: "child" });
 
    expect(afterDeleteChild.categories).toHaveLength(2);
    const rootCategory = afterDeleteChild.categories.find((category) => category.id === "root");
    expect(rootCategory).toBeDefined();
    expect(rootCategory?.children).toEqual([]);
 
    expect(afterDeleteChild.bookmarks.find((bookmark) => bookmark.id === "b2")).toBeUndefined();
    expect(afterDeleteChild.bookmarks.find((bookmark) => bookmark.id === "b1")).toBeDefined();
    expect(afterDeleteChild.bookmarks.find((bookmark) => bookmark.id === "b3")).toBeDefined();
 
    expect(afterDeleteChild.currentCategoryId).toBe("root");
 
    const afterDeleteRoot = await store.deleteCategory({ categoryId: "root" });
 
    expect(afterDeleteRoot.categories.map((category) => category.id)).toEqual(["other"]);
    expect(afterDeleteRoot.bookmarks.find((bookmark) => bookmark.categoryId === "root")).toBeUndefined();
    expect(afterDeleteRoot.bookmarks.find((bookmark) => bookmark.categoryId === "child")).toBeUndefined();
    expect(afterDeleteRoot.bookmarks.find((bookmark) => bookmark.id === "b3")).toBeDefined();
    expect(afterDeleteRoot.currentCategoryId).toBe("other");
 
    const afterNoOp = await store.deleteCategory({ categoryId: "missing" });
    expect(afterNoOp).toEqual(afterDeleteRoot);
 
    const saved = getSavedState();
    expect(saved).toEqual(afterNoOp);
  });

  it("resetSystem restores default state and persists it", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b1",
          title: "One",
          url: "https://one.example",
          description: "",
          categoryId: "root",
          createdAt: "sd1",
        },
      ],
      categories: [
        {
          id: "root",
          name: "Root",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: "root",
      currentView: "settings",
      currentSettingsPage: "themes",
      landingCategoryId: "root",
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const resetState = await store.resetSystem();

    expect(resetState.bookmarks).toEqual([]);
    expect(resetState.categories).toEqual([]);
    expect(resetState.currentCategoryId).toBeNull();
    expect(resetState.currentView).toBe("bookmarks");
    expect(resetState.currentSettingsPage).toBeNull();

    const saved = getSavedState();
    expect(saved).toEqual(resetState);
  });

  it("applyExportBundle overwrites bookmarks and categories and normalizes currentCategoryId", async () => {
    const initial: State = {
      bookmarks: [
        {
          id: "b-initial",
          title: "Old",
          url: "https://old.example",
          description: "",
          categoryId: "old-cat",
          createdAt: "sd-old",
        },
      ],
      categories: [
        {
          id: "old-cat",
          name: "Old Cat",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
      currentCategoryId: "old-cat",
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    const { backend, getSavedState } = createBackendMock(initial);
    const store = createStateStore(backend);

    await store.loadInitialState();

    const bundle: ExportBundle = {
      bookmarks: [
        {
          id: "b1",
          title: "New 1",
          url: "https://one.example",
          description: "",
          categoryId: "cat1",
          createdAt: "sd1",
        },
        {
          id: "b2",
          title: "Dangling",
          url: "https://dangling.example",
          description: "",
          categoryId: "missing",
          createdAt: "sd2",
        },
      ],
      categories: [
        {
          id: "cat1",
          name: "Cat 1",
          color: "#fff",
          createdAt: "stardate",
          children: [],
        },
      ],
    };

    const afterApply = await store.applyExportBundle(bundle);

    expect(afterApply.categories).toEqual(bundle.categories);
    expect(afterApply.bookmarks).toHaveLength(1);
    expect(afterApply.bookmarks[0].id).toBe("b1");
    expect(afterApply.bookmarks[0].categoryId).toBe("cat1");

    expect(afterApply.currentCategoryId).toBe("cat1");

    const saved = getSavedState();
    expect(saved).toEqual(afterApply);
  });
});

