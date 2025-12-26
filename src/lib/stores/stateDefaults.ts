import type { State } from "./stateTypes";

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
