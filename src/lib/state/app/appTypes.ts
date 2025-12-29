// lib/stores/state/types.ts
import type { State, Category, ExportBundle } from "../model";

export type AppStateModel = {
  state: State | null;
  isReady: boolean;
  initError: string | null;
};

export type PersistAndSet = (
  updater: (current: State) => State,
) => Promise<State>;

export type AppState = {
  model: AppStateModel;

  // lifecycle
  loadInitialState: () => Promise<State>;
  resetSystem: () => Promise<State>;

  // navigation
  setCurrentCategory: (categoryId: string | null) => Promise<State>;
  setCurrentView: (
    viewId: "bookmarks" | "settings" | "about",
  ) => Promise<State>;
  setCurrentSettingsPage: (
    pageId: "categories" | "home" | "themes" | "data" | "reset" | null,
  ) => Promise<State>;

  // categories
  addCategory: (params: {
    parentId: string | null;
    name?: string | null;
  }) => Promise<State>;
  moveCategory: (params: {
    categoryId: string;
    direction: "up" | "down";
  }) => Promise<State>;
  deleteCategory: (params: { categoryId: string }) => Promise<State>;

  // data
  applyExportBundle: (bundle: ExportBundle) => Promise<State>;

  // bookmarks
  addBookmark: (params: {
    title: string;
    url: string;
    categoryId: string | null;
    description?: string | null;
  }) => Promise<State>;
  updateBookmark: (params: {
    id: string;
    title?: string | null;
    url?: string | null;
    description?: string | null;
    categoryId?: string | null;
  }) => Promise<State>;
  deleteBookmark: (id: string) => Promise<State>;
};
