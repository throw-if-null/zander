import { writable, type Writable, get } from "svelte/store";
import type { State, Category } from "./stateTypes";
import type { PersistenceBackend } from "../persistence/PersistenceBackend";
import { createDefaultState } from "./stateDefaults";
import {
  createBookmark,
  getEffectiveCategoryIdForNewBookmark,
  applyBookmarkUpdate,
  type BookmarkUpdate,
} from "./bookmarks";

export type StateStore = Writable<State | null> & {
  loadInitialState: () => Promise<State>;
  setCurrentCategory: (categoryId: string | null) => Promise<State>;
  setCurrentView: (viewId: "bookmarks" | "settings" | "about") => Promise<State>;
  setCurrentSettingsPage: (
    pageId:
      | "categories"
      | "home"
      | "themes"
      | "data"
      | "reset"
      | null
  ) => Promise<State>;
  addCategory: (params: { parentId: string | null; name?: string | null }) => Promise<State>;
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

export function createStateStore(backend: PersistenceBackend): StateStore {
  const store = writable<State | null>(null);

  const persistAndSet = async (updater: (current: State) => State): Promise<State> => {
    const current = get(store);
    const base: State = current ?? createDefaultState();

    const nextState = updater(base);
    store.set(nextState);
    await backend.saveState(nextState);
    return nextState;
  };

  const loadInitialState = async (): Promise<State> => {
    const persisted = await backend.loadState();

    if (persisted) {
      store.set(persisted);
      return persisted;
    }

    const defaultState = createDefaultState();

    await backend.saveState(defaultState);
    store.set(defaultState);
    return defaultState;
  };

  const categoryExists = (categories: State["categories"], id: string): boolean => {
    if (!categories || categories.length === 0) {
      return false;
    }

    for (const category of categories) {
      if (category.id === id) {
        return true;
      }

      if (categoryExists(category.children, id)) {
        return true;
      }
    }

    return false;
  };

  const setCurrentCategory = async (categoryId: string | null): Promise<State> => {
    return persistAndSet((current) => {
      if (categoryId === null) {
        return {
          ...current,
          currentCategoryId: null,
        };
      }

      const exists = categoryExists(current.categories, categoryId);

      if (!exists) {
        const firstRoot = current.categories[0];
        return {
          ...current,
          currentCategoryId: firstRoot ? firstRoot.id : null,
        };
      }

      return {
        ...current,
        currentCategoryId: categoryId,
      };
    });
  };

  const setCurrentView = async (
    viewId: "bookmarks" | "settings" | "about"
  ): Promise<State> => {
    const allowed: Array<"bookmarks" | "settings" | "about"> = [
      "bookmarks",
      "settings",
      "about",
    ];

    if (!allowed.includes(viewId)) {
      const current = await loadInitialState();
      return current;
    }

    return persistAndSet((current) => ({
      ...current,
      currentView: viewId,
    }));
  };
 
  const addCategory = async (params: { parentId: string | null; name?: string | null }): Promise<State> => {
    return persistAndSet((current) => {
      const newCategory: Category = {
        id:
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
        name: params.name ?? "New category",
        color: "#ffffff",
        createdAt: new Date().toISOString(),
        children: [],
      };
 
      if (!params.parentId) {
        return {
          ...current,
          categories: [...current.categories, newCategory],
        };
      }
 
      let inserted = false;
 
      const insertInto = (categories: Category[]): Category[] => {
        return categories.map((category) => {
          if (category.id === params.parentId) {
            inserted = true;
            return {
              ...category,
              children: [...category.children, newCategory],
            };
          }
 
          return {
            ...category,
            children: insertInto(category.children),
          };
        });
      };
 
      const nextCategories = insertInto(current.categories);
 
      if (!inserted) {
        return {
          ...current,
          categories: [...current.categories, newCategory],
        };
      }
 
      return {
        ...current,
        categories: nextCategories,
      };
    });
  };
 
   const addBookmark = async (params: {

    title: string;
    url: string;
    categoryId: string | null;
    description?: string | null;
  }): Promise<State> => {
    return persistAndSet((current) => {
      const effectiveCategoryId =
        getEffectiveCategoryIdForNewBookmark({
          explicitCategoryId: params.categoryId,
          currentCategoryId: current.currentCategoryId,
          categories: current.categories,
        }) ?? "";

      const bookmark = createBookmark({
        title: params.title,
        url: params.url,
        description: params.description ?? null,
        categoryId: effectiveCategoryId,
        generateId: () => {
          if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
          ) {
            return crypto.randomUUID();
          }
          return Math.random().toString(36).slice(2);
        },
        createTimestamp: () => new Date().toISOString(),
      });

      return {
        ...current,
        bookmarks: [...current.bookmarks, bookmark],
      };
    });
  };

  const updateBookmark = async (params: {
    id: string;
    title?: string | null;
    url?: string | null;
    description?: string | null;
    categoryId?: string | null;
  }): Promise<State> => {
    return persistAndSet((current) => {
      const index = current.bookmarks.findIndex((b) => b.id === params.id);
      if (index === -1) {
        return current;
      }

      const existing = current.bookmarks[index];
      const patch: BookmarkUpdate = {};

      if (params.title !== undefined) {
        patch.title = params.title;
      }

      if (params.url !== undefined) {
        patch.url = params.url;
      }

      if (params.description !== undefined) {
        patch.description = params.description;
      }

      if (params.categoryId !== undefined && params.categoryId !== null) {
        const effectiveCategoryId = getEffectiveCategoryIdForNewBookmark({
          explicitCategoryId: params.categoryId,
          currentCategoryId: current.currentCategoryId,
          categories: current.categories,
        });

        if (effectiveCategoryId) {
          patch.categoryId = effectiveCategoryId;
        }
      }

      const updated = applyBookmarkUpdate(existing, patch);
      const nextBookmarks = [...current.bookmarks];
      nextBookmarks[index] = updated;

      return {
        ...current,
        bookmarks: nextBookmarks,
      };
    });
  };

  const deleteBookmark = async (id: string): Promise<State> => {
    return persistAndSet((current) => {
      const nextBookmarks = current.bookmarks.filter((b) => b.id !== id);
      if (nextBookmarks.length === current.bookmarks.length) {
        return current;
      }

      return {
        ...current,
        bookmarks: nextBookmarks,
      };
    });
  };

   const setCurrentSettingsPage = async (

    pageId:
      | "categories"
      | "home"
      | "themes"
      | "data"
      | "reset"
      | null
  ): Promise<State> => {
    const allowedPages: Array<
      | "categories"
      | "home"
      | "themes"
      | "data"
      | "reset"
      | null
    > = ["categories", "home", "themes", "data", "reset", null];

    const effectivePageId = allowedPages.includes(pageId) ? pageId : null;

    return persistAndSet((current) => ({
      ...current,
      currentSettingsPage: effectivePageId,
    }));
  };

  return {
    subscribe: store.subscribe,
    set: store.set,
    update: store.update,
    loadInitialState,
    setCurrentCategory,
    setCurrentView,
    setCurrentSettingsPage,
    addCategory,
    addBookmark,
    updateBookmark,
    deleteBookmark,
  };
 
}

