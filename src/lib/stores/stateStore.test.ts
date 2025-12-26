import { describe, it, expect } from "vitest";
import { createStateStore } from "./stateStore";
import type { PersistenceBackend } from "../persistence/PersistenceBackend";
import type { State } from "./stateTypes";

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
});
