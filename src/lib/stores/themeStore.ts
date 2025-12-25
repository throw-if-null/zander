import { writable, type Writable } from "svelte/store";

export type Theme = {
  id: string;
  label: string;
};

export type ThemeState = {
  themes: Theme[];
  currentThemeId: string | null;
};

// Svelte-specific theme storage key (see ARCHITECTURE.md)
const ZANDER_SVELTE_THEME_STORAGE_KEY = "zander-svelte-theme:v1";

const THEMES: Theme[] = [
  { id: "laan", label: "LA'AN" },
  { id: "data", label: "DATA" },
  { id: "doctor", label: "THE DOCTOR" },
  { id: "chapel", label: "CHAPEL" },
  { id: "spock", label: "SPOCK" },
  { id: "mbenga", label: "M'BENGA" },
  { id: "seven", label: "SEVEN OF NINE" },
  { id: "shran", label: "SHRAN" },
];

function isBrowserStorageAvailable(storage: Storage | null): storage is Storage {
  if (!storage) return false;
  try {
    const testKey = "__zander_theme_test__";
    storage.setItem(testKey, "ok");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function getInitialThemeId(storage: Storage | null, themes: Theme[]): string | null {
  const primaryId = themes[0]?.id ?? null;

  if (!isBrowserStorageAvailable(storage)) {
    return primaryId;
  }

  const storedId = storage.getItem(ZANDER_SVELTE_THEME_STORAGE_KEY);
  if (!storedId) return primaryId;

  const exists = themes.some((theme) => theme.id === storedId);
  return exists ? storedId : primaryId;
}

function applyThemeToDocument(themeId: string | null, themes: Theme[]): void {
  if (typeof document === "undefined") return;

  const primaryId = themes[0]?.id ?? null;
  const effectiveId = themeId ?? primaryId;
  if (!effectiveId) return;

  const root = document.documentElement;
  root.setAttribute("data-theme", effectiveId);
}

export type ThemeStore = Writable<ThemeState> & {
  loadInitialTheme: () => ThemeState;
  setTheme: (themeId: string) => ThemeState;
};

export function createThemeStore(
  storage: Storage | null =
    typeof window !== "undefined" ? window.localStorage : null
): ThemeStore {
  const initialState: ThemeState = {
    themes: THEMES,
    currentThemeId: null,
  };

  const store = writable<ThemeState>(initialState);

  const loadInitialTheme = (): ThemeState => {
    const state = getInitialThemeId(storage, THEMES);
    const nextState: ThemeState = {
      themes: THEMES,
      currentThemeId: state,
    };

    if (isBrowserStorageAvailable(storage) && nextState.currentThemeId) {
      storage.setItem(ZANDER_SVELTE_THEME_STORAGE_KEY, nextState.currentThemeId);
    }

    applyThemeToDocument(nextState.currentThemeId, THEMES);
    store.set(nextState);
    return nextState;
  };

  const setTheme = (themeId: string): ThemeState => {
    let nextState: ThemeState;

    store.update((current) => {
      const exists = current.themes.some((theme) => theme.id === themeId);
      if (!exists) {
        nextState = current;
        return current;
      }

      nextState = {
        ...current,
        currentThemeId: themeId,
      };

      return nextState;
    });

    if (isBrowserStorageAvailable(storage) && nextState.currentThemeId) {
      storage.setItem(ZANDER_SVELTE_THEME_STORAGE_KEY, nextState.currentThemeId);
    }

    applyThemeToDocument(nextState.currentThemeId, THEMES);
    return nextState;
  };

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    loadInitialTheme,
    setTheme,
  };
}
