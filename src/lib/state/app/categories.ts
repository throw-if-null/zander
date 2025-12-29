// lib/stores/state/categories.ts
import type { Bookmark, Category, State } from "./stateTypes";
import type { PersistAndSet } from "./types";
import {
  categoryExists,
  collectIdsForCategoryTree,
  createTimestamp,
  generateId,
} from "./utils";

export function createCategoryActions(args: { persistAndSet: PersistAndSet }) {
  const { persistAndSet } = args;

  const setCurrentCategory = async (
    categoryId: string | null,
  ): Promise<State> => {
    return persistAndSet((current) => {
      if (categoryId === null) {
        return { ...current, currentCategoryId: null };
      }

      const exists = categoryExists(current.categories, categoryId);
      if (!exists) {
        const firstRoot = current.categories[0];
        return {
          ...current,
          currentCategoryId: firstRoot ? firstRoot.id : null,
        };
      }

      return { ...current, currentCategoryId: categoryId };
    });
  };

  const addCategory = async (params: {
    parentId: string | null;
    name?: string | null;
  }): Promise<State> => {
    return persistAndSet((current) => {
      const newCategory: Category = {
        id: generateId(),
        name: params.name ?? "New category",
        color: "#ffffff",
        createdAt: createTimestamp(),
        children: [],
      };

      if (!params.parentId) {
        return { ...current, categories: [...current.categories, newCategory] };
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
          return { ...category, children: insertInto(category.children) };
        });
      };

      const nextCategories = insertInto(current.categories);

      if (!inserted) {
        return { ...current, categories: [...current.categories, newCategory] };
      }

      return { ...current, categories: nextCategories };
    });
  };

  const moveCategory = async (params: {
    categoryId: string;
    direction: "up" | "down";
  }): Promise<State> => {
    const { categoryId, direction } = params;

    const moveInList = (
      categories: Category[],
    ): { next: Category[]; moved: boolean } => {
      let moved = false;

      for (let index = 0; index < categories.length; index += 1) {
        const category = categories[index];

        if (category.id === categoryId) {
          const targetIndex = direction === "up" ? index - 1 : index + 1;

          if (targetIndex < 0 || targetIndex >= categories.length) {
            return { next: categories, moved: false };
          }

          const next = [...categories];
          const tmp = next[targetIndex];
          next[targetIndex] = next[index];
          next[index] = tmp;

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
      if (!moved) return current;
      return { ...current, categories: next };
    });
  };

  const deleteCategory = async (params: {
    categoryId: string;
  }): Promise<State> => {
    const { categoryId } = params;

    type DeleteResult = {
      nextCategories: Category[];
      removedIds: Set<string>;
      found: boolean;
    };

    const deleteFromList = (categories: Category[]): DeleteResult => {
      const nextCategories: Category[] = [];
      const removedIds = new Set<string>();
      let found = false;

      for (const category of categories) {
        if (category.id === categoryId) {
          collectIdsForCategoryTree(category, removedIds);
          found = true;
          continue;
        }

        const childResult = deleteFromList(category.children);

        if (childResult.found) {
          found = true;
          for (const id of childResult.removedIds) removedIds.add(id);
          nextCategories.push({
            ...category,
            children: childResult.nextCategories,
          });
        } else {
          nextCategories.push(category);
        }
      }

      return { nextCategories, removedIds, found };
    };

    return persistAndSet((current) => {
      const { nextCategories, removedIds, found } = deleteFromList(
        current.categories,
      );

      if (!found || removedIds.size === 0) return current;

      const nextBookmarks = current.bookmarks.filter(
        (bookmark: Bookmark) => !removedIds.has(bookmark.categoryId),
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

  return { setCurrentCategory, addCategory, moveCategory, deleteCategory };
}
