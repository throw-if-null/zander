import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageBackend } from "./LocalStorageBackend";

// Helper to mock global localStorage
function mockLocalStorage(mock: Record<string, string> | null) {
  // @ts-ignore
  Object.defineProperty(globalThis, "localStorage", {
    value:
      mock === null
        ? null
        : {
            getItem: (k: string) => mock[k] ?? null,
            setItem: (k: string, v: string) => {
              mock[k] = v;
            },
            removeItem: (k: string) => {
              delete mock[k];
            },
          },
    configurable: true,
  });
}

describe("LocalStorageBackend StorageError cases", () => {
  beforeEach(() => {
    // Reset to empty localStorage by default
    mockLocalStorage({});
  });

  it("throws StorageError when localStorage is unavailable on load", async () => {
    mockLocalStorage(null);
    const backend = new LocalStorageBackend();
    await expect(backend.loadState()).rejects.toMatchObject({
      code: "storage-unavailable",
    });
  });

  it("throws StorageError for invalid JSON in storage", async () => {
    mockLocalStorage({ "zander-svelte:v1": "{not: json" });
    const backend = new LocalStorageBackend();
    await expect(backend.loadState()).rejects.toMatchObject({
      code: "invalid-json",
    });
  });

  it("throws StorageError on import with version mismatch", async () => {
    const backend = new LocalStorageBackend();
    const bundle = { version: "zander-v2", meta: {}, state: {} } as any;
    await expect(backend.importData(bundle)).rejects.toMatchObject({
      code: "version-unsupported",
    });
  });
});
