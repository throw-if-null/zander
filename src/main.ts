import "./app.css";
import App from "./App.svelte";
import { mount } from "svelte";
import { LocalStorageBackend } from "./lib/persistence/LocalStorageBackend";
import { isStorageError } from "./lib/state/model";

declare global {
  interface Window {
    __ZANDER_STORAGE_ERROR__?: unknown;
  }
}

const target = document.getElementById("app");
if (!target) throw new Error("Missing #app mount element");

(async () => {
  // Probe storage at startup to detect StorageError early
  const backend = new LocalStorageBackend();
  try {
    await backend.loadState();
  } catch (err) {
    if (isStorageError(err)) {
      window.__ZANDER_STORAGE_ERROR__ = err;
      console.error("Zander storage error on startup:", err);
    } else {
      throw err;
    }
  }

  // Svelte 5: use mount (not `new App`)
  mount(App, { target });
})().catch((err) => {
  // Ensure unexpected errors still surface clearly
  console.error(err);
  throw err;
});
