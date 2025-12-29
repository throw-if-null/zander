import { describe, it, expect, beforeEach } from "vitest";
import { createThemeState } from "./index.svelte";
import { ThemeState } from "./themeTypes";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const THEME_KEY = "zander-svelte-theme:v1";

describe("themeStore", () => {
  let storage: MemoryStorage;
  let originalDocument: typeof document | undefined;

  beforeEach(() => {
    storage = new MemoryStorage();
    // jsdom provides a global document; we just ensure data-theme is reset
    document.documentElement.removeAttribute("data-theme");
    originalDocument = document;
  });

  it("loadInitialTheme uses stored valid id when present", () => {
    storage.setItem(THEME_KEY, "data");

    const store = createThemeState(storage);
    const state: ThemeState = store.loadInitialTheme();

    expect(state.currentThemeId).toBe("data");
    expect(document.documentElement.getAttribute("data-theme")).toBe("data");
  });

  it("loadInitialTheme falls back to primary theme when storage empty or invalid", () => {
    const storeEmpty = createThemeState(storage);
    const stateEmpty = storeEmpty.loadInitialTheme();

    expect(stateEmpty.currentThemeId).toBe("laan");
    expect(document.documentElement.getAttribute("data-theme")).toBe("laan");

    // Now set an invalid id and verify it still falls back
    document.documentElement.removeAttribute("data-theme");
    storage.setItem(THEME_KEY, "invalid-theme-id");

    const storeInvalid = createThemeState(storage);
    const stateInvalid = storeInvalid.loadInitialTheme();

    expect(stateInvalid.currentThemeId).toBe("laan");
    expect(document.documentElement.getAttribute("data-theme")).toBe("laan");
  });

  it("setTheme updates state, persists, and applies when id valid", () => {
    const store = createThemeState(storage);

    // Seed an initial theme
    store.loadInitialTheme();

    const next = store.setTheme("doctor");

    expect(next.currentThemeId).toBe("doctor");
    expect(storage.getItem(THEME_KEY)).toBe("doctor");
    expect(document.documentElement.getAttribute("data-theme")).toBe("doctor");
  });

  it("setTheme is a no-op for invalid ids", () => {
    const store = createThemeState(storage);
    const initial = store.loadInitialTheme();

    const next = store.setTheme("nonexistent-theme");

    expect(next.currentThemeId).toBe(initial.currentThemeId);
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      initial.currentThemeId,
    );
  });
});
