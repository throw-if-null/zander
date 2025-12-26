import type { PersistenceBackend } from "./PersistenceBackend";
import type { State, ExportBundle } from "../stores/stateTypes";

const STORAGE_KEY = "zander-svelte:v1";

function isBrowserStorageAvailable(storage: Storage | null): storage is Storage {
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

  constructor(storage: Storage | null =
    typeof window !== "undefined" ? window.localStorage : null
  ) {
    this.storage = storage;
  }

  async loadState(): Promise<State | null> {
    if (!isBrowserStorageAvailable(this.storage)) return null;

    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as State;
      return parsed;
    } catch {
      return null;
    }
  }

  async saveState(state: State): Promise<void> {
    if (!isBrowserStorageAvailable(this.storage)) return;
    const payload = JSON.stringify(state);
    this.storage.setItem(STORAGE_KEY, payload);
  }

  async exportData(): Promise<ExportBundle> {
    const state = await this.loadState();

    const effectiveState: State =
      state ?? {
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
      throw new Error(`Unsupported export bundle version: ${bundle.version}`);
    }

    await this.saveState(bundle.state);
  }
}
