// lib/stores/state/persistence.ts
import type { PersistenceBackend } from "../../persistence/PersistenceBackend";
import type { State } from "../model";
import { createDefaultState } from "../defaults";
import type { AppStateModel, PersistAndSet } from "../app/appTypes";

export function createPersistence(args: {
  model: AppStateModel;
  backend: PersistenceBackend;
}): {
  persistAndSet: PersistAndSet;
  loadInitialState: () => Promise<State>;
  resetSystem: () => Promise<State>;
} {
  const { model, backend } = args;

  // Serialize writes to avoid lost updates if actions are triggered concurrently.
  let writeQueue: Promise<unknown> = Promise.resolve();

  // Make init idempotent.
  let initPromise: Promise<State> | null = null;

  const persistAndSet: PersistAndSet = (updater) => {
    const task = writeQueue.then(async () => {
      const base: State = model.state ?? createDefaultState();
      const nextState = updater(base);

      // Optimistic update (matches your original semantics)
      model.state = nextState;

      await backend.saveState(nextState);
      return nextState;
    });

    // Keep queue alive even if a save fails
    writeQueue = task.catch(() => undefined);

    return task;
  };

  const loadInitialState = (): Promise<State> => {
    if (model.state) {
      model.isReady = true;
      return Promise.resolve(model.state);
    }
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        const persisted = await backend.loadState();
        if (persisted) {
          model.state = persisted;
          model.isReady = true;
          model.initError = null;
          return persisted;
        }

        const defaultState = createDefaultState();
        await backend.saveState(defaultState);
        model.state = defaultState;
        model.isReady = true;
        model.initError = null;
        return defaultState;
      } catch (e) {
        model.initError = e instanceof Error ? e.message : String(e);
        model.isReady = false;
        throw e;
      }
    })();

    return initPromise;
  };

  const resetSystem = async (): Promise<State> => {
    const defaultState = createDefaultState();
    model.state = defaultState;
    await backend.saveState(defaultState);
    return defaultState;
  };

  return { persistAndSet, loadInitialState, resetSystem };
}
