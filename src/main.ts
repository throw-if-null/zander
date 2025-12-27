import "./app.css";
import App from "./App.svelte";
import { mount } from "svelte";
import { LocalStorageBackend } from "./lib/persistence/LocalStorageBackend";
import { isStorageError } from "./lib/stores/stateTypes";

declare global {
  interface Window {
    __ZANDER_STORAGE_ERROR__?: unknown;
  }
}

const target = document.getElementById("app");
if (!target) throw new Error("Missing #app mount element");

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
const app = mount(App, { target });

export default app;
