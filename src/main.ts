import "./app.css";
import App from "./App.svelte";
import { LocalStorageBackend } from "./lib/persistence/LocalStorageBackend";
import { isStorageError } from "./lib/stores/stateTypes";

const target = document.getElementById("app");

if (!target) {
  throw new Error("Missing #app mount element");
}

// Probe storage at startup to detect StorageError early (UI can read window.__ZANDER_STORAGE_ERROR__)
(async () => {
  const backend = new LocalStorageBackend();
  try {
    await backend.loadState();
    // no-op
  } catch (err) {
    if (isStorageError(err)) {
      // expose for UI / tests; UI can show a dialog and offer import/reset
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__ZANDER_STORAGE_ERROR__ = err;
      // also log for diagnostics
      // eslint-disable-next-line no-console
      console.error("Zander storage error on startup:", err);
    } else {
      throw err;
    }
  }

  const app = new App({
    target,
  });

  export default app;
})();
