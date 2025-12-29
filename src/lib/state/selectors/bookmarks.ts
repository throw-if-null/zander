import type { State, Bookmark, Category } from "../model";

function findCategory(categories: Category[], id: string): Category | null {
  for (const category of categories) {
    if (category.id === id) return category;
    const found = findCategory(category.children, id);
    if (found) return found;
  }
  return null;
}

function collectCategoryIdsFrom(
  categories: Category[],
  startId: string,
): Set<string> {
  const root = findCategory(categories, startId);
  const ids = new Set<string>();
  if (!root) return ids;

  const walk = (node: Category) => {
    ids.add(node.id);
    for (const child of node.children) walk(child);
  };

  walk(root);
  return ids;
}

export function getVisibleBookmarks(state: State): Bookmark[] {
  const currentId = state.currentCategoryId;
  if (!currentId) return state.bookmarks;

  const ids = collectCategoryIdsFrom(state.categories, currentId);
  if (ids.size === 0) return state.bookmarks;

  return state.bookmarks.filter((bookmark: Bookmark) =>
    ids.has(bookmark.categoryId),
  );
}
