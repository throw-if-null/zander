import { writable, type Writable } from "svelte/store";
import type { State } from "./stateTypes";
import type { PersistenceBackend } from "../persistence/PersistenceBackend";

export type StateStore = Writable<State | null> & {
  loadInitialState: () => Promise<State>;
};

export function createStateStore(
  backend: PersistenceBackend
): StateStore {
  const store = writable<State | null>(null);

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

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    loadInitialState,
  };
}
