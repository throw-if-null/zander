// lib/stores/state/index.svelte.ts
import type { PersistenceBackend } from "../../persistence/PersistenceBackend";
import type { AppState, AppStateModel } from "./appTypes";

import { createPersistence } from "./persistence";
import { createNavigationActions } from "./navigation";
import { createCategoryActions } from "./categories";
import { createBookmarkActions } from "./bookmarks";
import { createDataActions } from "./data";

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
    ...createDataActions({ persistAndSet: persistence.persistAndSet }),
    ...createBookmarkActions({ persistAndSet: persistence.persistAndSet }),
  };
}

export type { AppState, AppStateModel } from "./appTypes";
