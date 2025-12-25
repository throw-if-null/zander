import { describe, it, expect, vi } from "vitest";
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
      return { bookmarks: savedState?.bookmarks ?? [], categories: savedState?.categories ?? [] };
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
});
