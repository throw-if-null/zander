// lib/stores/state/navigation.ts
import type { State } from "./stateTypes";
import type { PersistAndSet } from "./types";

export function createNavigationActions(args: {
  persistAndSet: PersistAndSet;
  loadInitialState: () => Promise<State>;
}) {
  const { persistAndSet, loadInitialState } = args;

  const setCurrentView = async (
    viewId: "bookmarks" | "settings" | "about",
  ): Promise<State> => {
    // kept as a defensive runtime guard (even though TS already constrains viewId)
    const allowed: Array<"bookmarks" | "settings" | "about"> = [
      "bookmarks",
      "settings",
      "about",
    ];

    if (!allowed.includes(viewId)) {
      return await loadInitialState();
    }

    return persistAndSet((current) => ({
      ...current,
      currentView: viewId,
    }));
  };

  const setCurrentSettingsPage = async (
    pageId: "categories" | "home" | "themes" | "data" | "reset" | null,
  ): Promise<State> => {
    const allowedPages: Array<
      "categories" | "home" | "themes" | "data" | "reset" | null
    > = ["categories", "home", "themes", "data", "reset", null];

    const effectivePageId = allowedPages.includes(pageId) ? pageId : null;

    return persistAndSet((current) => ({
      ...current,
      currentSettingsPage: effectivePageId,
    }));
  };

  return { setCurrentView, setCurrentSettingsPage };
}
