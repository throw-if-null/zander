import type { State, Bookmark, Category } from "./stateTypes";

function findCategory(categories: Category[], id: string): Category | null {
  if (!categories || categories.length === 0) {
    return null;
  }

  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    const found = findCategory(category.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}

function collectCategoryIdsFrom(categories: Category[], startId: string): Set<string> {
  const root = findCategory(categories, startId);

  if (!root) {
    return new Set<string>();
  }

  const collect = (node: Category): Set<string> => {
    const result = new Set<string>();
    result.add(node.id);

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childIds = collect(child);
        for (const id of childIds) {
          result.add(id);
        }
      }
    }

    return result;
  };

  return collect(root);
}

export function getVisibleBookmarks(state: State): Bookmark[] {
  if (!state.currentCategoryId) {
    return state.bookmarks;
  }

  const ids = collectCategoryIdsFrom(state.categories, state.currentCategoryId);

  if (ids.size === 0) {
    return state.bookmarks;
  }

  return state.bookmarks.filter((bookmark) => ids.has(bookmark.categoryId));
}
