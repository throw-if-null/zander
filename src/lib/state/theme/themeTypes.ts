// src/lib/state/theme/themeTypes.ts
export type Theme = {
  id: string;
  label: string;
};

export type ThemeState = {
  themes: Theme[];
  currentThemeId: string | null;
};

export type ThemeModel = ThemeState & {
  initDone: boolean;
  storageError: unknown | null;
};

export type ThemeController = {
  state: ThemeState;
  loadInitialTheme: () => ThemeState;
  setTheme: (themeId: string) => ThemeState;
};
