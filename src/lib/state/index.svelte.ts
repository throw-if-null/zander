// src/lib/state/index.svelte.ts
import type { PersistenceBackend } from "../persistence/PersistenceBackend";
import type { AppState, AppStateModel } from "./app/appTypes";

import { createPersistence } from "./app/persistence";
import { createNavigationActions } from "./app/navigation";
import { createCategoryActions } from "./app/categories";
import { createBookmarkActions } from "./app/bookmarks";
import { createDataActions } from "./app/data";

export function createAppState(backend: PersistenceBackend): AppState {
  const model = $state<AppStateModel>({
    state: null,
    isReady: false,
    initError: null,
  });

  const persistence = createPersistence({ model, backend });

  return {
    model,
    loadInitialState: persistence.loadInitialState,
    resetSystem: persistence.resetSystem,
    ...createNavigationActions({
      persistAndSet: persistence.persistAndSet,
      loadInitialState: persistence.loadInitialState,
    }),
    ...createCategoryActions({ persistAndSet: persistence.persistAndSet }),
    ...createBookmarkActions({ persistAndSet: persistence.persistAndSet }),
    ...createDataActions({ persistAndSet: persistence.persistAndSet }),
  };
}

export { createThemeState } from "./theme/index.svelte.ts";
export type { ThemeState, Theme } from "./theme/themeTypes";
export type { AppState, AppStateModel } from "./app/appTypes";
