import type { State, ExportBundle } from "../state/model";

export interface PersistenceBackend {
  loadState(): Promise<State | null>;
  saveState(state: State): Promise<void>;
  exportData(): Promise<ExportBundle>;
  importData(bundle: ExportBundle): Promise<void>;
}
