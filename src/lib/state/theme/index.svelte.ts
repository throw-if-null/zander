// src/lib/state/theme/index.svelte.ts
import { Theme, ThemeController, ThemeState } from "./themeTypes";
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

function isBrowserStorageAvailable(
  storage: Storage | null,
): storage is Storage {
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

function getInitialThemeId(
  storage: Storage | null,
  themes: Theme[],
): string | null {
  const primaryId = themes[0]?.id ?? null;

  if (!isBrowserStorageAvailable(storage)) return primaryId;

  const storedId = storage.getItem(ZANDER_SVELTE_THEME_STORAGE_KEY);
  if (!storedId) return primaryId;

  return themes.some((t) => t.id === storedId) ? storedId : primaryId;
}

function applyThemeToDocument(themeId: string | null, themes: Theme[]): void {
  if (typeof document === "undefined") return;

  const primaryId = themes[0]?.id ?? null;
  const effectiveId = themeId ?? primaryId;
  if (!effectiveId) return;

  document.documentElement.setAttribute("data-theme", effectiveId);
}

export function createThemeState(
  storage: Storage | null = typeof window !== "undefined"
    ? window.localStorage
    : null,
): ThemeController {
  // Reactive shared state (runes)
  const state = $state<ThemeState>({
    themes: THEMES,
    currentThemeId: null,
  });

  // Not reactive; just prevents repeated re-init
  let initDone = false;

  const loadInitialTheme = (): ThemeState => {
    if (initDone) return state;

    const id = getInitialThemeId(storage, THEMES);
    state.currentThemeId = id;

    if (isBrowserStorageAvailable(storage) && id) {
      try {
        storage.setItem(ZANDER_SVELTE_THEME_STORAGE_KEY, id);
      } catch {
        // ignore; still apply theme to document
      }
    }

    applyThemeToDocument(state.currentThemeId, THEMES);
    initDone = true;
    return state;
  };

  const setTheme = (themeId: string): ThemeState => {
    const exists = state.themes.some((t) => t.id === themeId);
    if (!exists) return state;

    state.currentThemeId = themeId;

    if (isBrowserStorageAvailable(storage)) {
      try {
        storage.setItem(ZANDER_SVELTE_THEME_STORAGE_KEY, themeId);
      } catch {
        // ignore
      }
    }

    applyThemeToDocument(state.currentThemeId, THEMES);
    return state;
  };

  return { state, loadInitialTheme, setTheme };
}
