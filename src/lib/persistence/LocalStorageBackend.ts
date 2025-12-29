import type { PersistenceBackend } from "./PersistenceBackend";
import type { State, ExportBundle, StorageError } from "../state/stateTypes";

const STORAGE_KEY = "zander-svelte:v1";

function isBrowserStorageAvailable(
  storage: Storage | null,
): storage is Storage {
  if (!storage) return false;
  try {
    const testKey = "__zander_test__";
    storage.setItem(testKey, "ok");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export class LocalStorageBackend implements PersistenceBackend {
  private readonly storage: Storage | null;

  constructor(
    storage: Storage | null = typeof window !== "undefined"
      ? window.localStorage
      : null,
  ) {
    this.storage = storage;
  }

  async loadState(): Promise<State | null> {
    if (!isBrowserStorageAvailable(this.storage)) {
      const error: StorageError = {
        code: "storage-unavailable",
        message: "localStorage is not available in this environment",
      };
      throw error;
    }

    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as State;
      return parsed;
    } catch {
      const error: StorageError = {
        code: "invalid-json",
        message: "Stored state is not valid JSON",
      };
      throw error;
    }
  }

  async saveState(state: State): Promise<void> {
    if (!isBrowserStorageAvailable(this.storage)) {
      const error: StorageError = {
        code: "storage-unavailable",
        message: "localStorage is not available in this environment",
      };
      throw error;
    }

    try {
      const payload = JSON.stringify(state);
      this.storage.setItem(STORAGE_KEY, payload);
    } catch {
      const error: StorageError = {
        code: "write-failed",
        message: "Failed to write state to localStorage",
      };
      throw error;
    }
  }

  async exportData(): Promise<ExportBundle> {
    const state = await this.loadState();

    const effectiveState: State = state ?? {
      bookmarks: [],
      categories: [],
      currentCategoryId: null,
      currentView: "bookmarks",
      currentSettingsPage: null,
      landingCategoryId: null,
    };

    return {
      version: "zander-v1",
      state: effectiveState,
      meta: {
        exportedAtStardate: new Date().toISOString(),
        sourceBackend: "localStorage",
      },
    };
  }

  async importData(bundle: ExportBundle): Promise<void> {
    if (bundle.version !== "zander-v1") {
      const error: StorageError = {
        code: "version-unsupported",
        message: `Unsupported export bundle version: ${bundle.version}`,
      };
      throw error;
    }

    await this.saveState(bundle.state);
  }
}
