import { writable, type Writable } from "svelte/store";
import type { State } from "./stateTypes";
import type { PersistenceBackend } from "../persistence/PersistenceBackend";

export type StateStore = Writable<State | null> & {
  loadInitialState: () => Promise<State>;
  setCurrentView: (viewId: "bookmarks" | "settings" | "about") => Promise<State>;
  setCurrentSettingsPage: (
    pageId:
      | "categories"
      | "home"
      | "themes"
      | "data"
      | "reset"
      | null
  ) => Promise<State>;
};

export function createStateStore(backend: PersistenceBackend): StateStore {
  const store = writable<State | null>(null);

  const persistAndSet = async (updater: (current: State) => State): Promise<State> => {
    let nextState: State;

    store.update((current) => {
      if (!current) {
        const fallback: State = {
          bookmarks: [],
          categories: [],
          currentCategoryId: null,
          currentView: "bookmarks",
          currentSettingsPage: null,
          landingCategoryId: null,
        };
        nextState = updater(fallback);
        return nextState;
      }

      nextState = updater(current);
      return nextState;
    });

    await backend.saveState(nextState);
    return nextState;
  };

  const loadInitialState = async (): Promise<State> => {
    const persisted = await backend.loadState();

    if (persisted) {
      store.set(persisted);
      return persisted;
    }

    const defaultState: State = {
      bookmarks: [],
      categories: [],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    await backend.saveState(defaultState);
    store.set(defaultState);
    return defaultState;
  };

  const setCurrentView = async (
    viewId: "bookmarks" | "settings" | "about"
  ): Promise<State> => {
    const allowed: Array<"bookmarks" | "settings" | "about"> = [
      "bookmarks",
      "settings",
      "about",
    ];

    if (!allowed.includes(viewId)) {
      // No change; ensure we still have a concrete State
      const current = await loadInitialState();
      return current;
    }

    return persistAndSet((current) => ({
      ...current,
      currentView: viewId,
    }));
  };

  const setCurrentSettingsPage = async (
    pageId:
      | "categories"
      | "home"
      | "themes"
      | "data"
      | "reset"
      | null
  ): Promise<State> => {
    const allowedPages: Array<
      | "categories"
      | "home"
      | "themes"
      | "data"
      | "reset"
      | null
    > = ["categories", "home", "themes", "data", "reset", null];

    const effectivePageId = allowedPages.includes(pageId) ? pageId : null;

    return persistAndSet((current) => ({
      ...current,
      currentSettingsPage: effectivePageId,
    }));
  };

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    loadInitialState,
    setCurrentView,
    setCurrentSettingsPage,
  };
}
