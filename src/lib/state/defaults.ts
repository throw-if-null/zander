import type { State } from "./model";

export function createDefaultState(): State {
  return {
    bookmarks: [],
    categories: [],
    currentCategoryId: null,
    currentView: "bookmarks",
    currentSettingsPage: null,
    landingCategoryId: null,
  };
}
