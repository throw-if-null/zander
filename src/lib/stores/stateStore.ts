import { writable, type Writable, get } from "svelte/store";
import type { State, Category, ExportBundle } from "./stateTypes";
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
  moveCategory: (params: { categoryId: string; direction: "up" | "down" }) => Promise<State>;
  deleteCategory: (params: { categoryId: string }) => Promise<State>;
  resetSystem: () => Promise<State>;
  applyExportBundle: (bundle: ExportBundle) => Promise<State>;
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

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function collectCategoryIds(categories: Category[]): Set<string> {
  const result = new Set<string>();

  const walk = (nodes: Category[]): void => {
    for (const node of nodes) {
      result.add(node.id);
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(categories);
  return result;
}

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
        id: generateId(),
        name: params.name ?? "New category",
        color: "#ffffff",
        createdAt: createTimestamp(),
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

  const moveCategory = async (params: { categoryId: string; direction: "up" | "down" }): Promise<State> => {
    const { categoryId, direction } = params;

    const moveInList = (categories: Category[]): { next: Category[]; moved: boolean } => {
      let moved = false;

      for (let index = 0; index < categories.length; index += 1) {
        const category = categories[index];

        if (category.id === categoryId) {
          const targetIndex = direction === "up" ? index - 1 : index + 1;

          if (targetIndex < 0 || targetIndex >= categories.length) {
            return { next: categories, moved: false };
          }

          const next = [...categories];
          const temp = next[targetIndex];
          next[targetIndex] = next[index];
          next[index] = temp;

          return { next, moved: true };
        }
      }

      const nextCategories = categories.map((category) => {
        const { next, moved: childMoved } = moveInList(category.children);

        if (childMoved) {
          moved = true;
          return { ...category, children: next };
        }

        return category;
      });

      return { next: moved ? nextCategories : categories, moved };
    };

    return persistAndSet((current) => {
      const { next, moved } = moveInList(current.categories);

      if (!moved) {
        return current;
      }

      return {
        ...current,
        categories: next,
      };
    });
  };

  const deleteCategory = async (params: { categoryId: string }): Promise<State> => {
    const { categoryId } = params;

    type DeleteResult = {
      nextCategories: Category[];
      removedIds: Set<string>;
      found: boolean;
    };

    const collectIds = (category: Category, acc: Set<string>): void => {
      acc.add(category.id);
      for (const child of category.children) {
        collectIds(child, acc);
      }
    };

    const deleteFromList = (categories: Category[]): DeleteResult => {
      const nextCategories: Category[] = [];
      const removedIds = new Set<string>();
      let found = false;

      for (const category of categories) {
        if (category.id === categoryId) {
          collectIds(category, removedIds);
          found = true;
          continue;
        }

        const childResult = deleteFromList(category.children);

        if (childResult.found) {
          found = true;
          for (const id of childResult.removedIds) {
            removedIds.add(id);
          }

          nextCategories.push({ ...category, children: childResult.nextCategories });
        } else {
          nextCategories.push(category);
        }
      }

      return { nextCategories, removedIds, found };
    };

    return persistAndSet((current) => {
      const { nextCategories, removedIds, found } = deleteFromList(current.categories);

      if (!found || removedIds.size === 0) {
        return current;
      }

      const nextBookmarks = current.bookmarks.filter(
        (bookmark) => !removedIds.has(bookmark.categoryId)
      );

      let nextCurrentCategoryId = current.currentCategoryId;
      if (nextCurrentCategoryId && removedIds.has(nextCurrentCategoryId)) {
        const firstRoot = nextCategories[0];
        nextCurrentCategoryId = firstRoot ? firstRoot.id : null;
      }

      return {
        ...current,
        categories: nextCategories,
        bookmarks: nextBookmarks,
        currentCategoryId: nextCurrentCategoryId,
      };
    });
  };

  const resetSystem = async (): Promise<State> => {
    const defaultState = createDefaultState();

    store.set(defaultState);
    await backend.saveState(defaultState);
    return defaultState;
  };

  const applyExportBundle = async (bundle: ExportBundle): Promise<State> => {
    return persistAndSet((current) => {
      const allowedCategoryIds = collectCategoryIds(bundle.categories);

      const filteredBookmarks = bundle.bookmarks.filter((bookmark) =>
        allowedCategoryIds.has(bookmark.categoryId),
      );

      let nextCurrentCategoryId = current.currentCategoryId;
      if (nextCurrentCategoryId && !allowedCategoryIds.has(nextCurrentCategoryId)) {
        const firstRoot = bundle.categories[0];
        nextCurrentCategoryId = firstRoot ? firstRoot.id : null;
      }

      return {
        ...current,
        bookmarks: filteredBookmarks,
        categories: bundle.categories,
        currentCategoryId: nextCurrentCategoryId,
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
        generateId,
        createTimestamp,
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
    moveCategory,
    deleteCategory,
    resetSystem,
    applyExportBundle,
    addBookmark,
    updateBookmark,
    deleteBookmark,
  };
}


