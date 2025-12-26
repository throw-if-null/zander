import type { Bookmark, Category } from "./stateTypes";

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === "") return "";

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function collectCategoryIds(categories: Category[]): Set<string> {
  const result = new Set<string>();

  const walk = (nodes: Category[]) => {
    for (const node of nodes) {
      result.add(node.id);
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(categories);
  return result;
}

function getFirstRootCategoryId(categories: Category[]): string | null {
  return categories[0]?.id ?? null;
}

export function getEffectiveCategoryIdForNewBookmark(options: {
  explicitCategoryId: string | null;
  currentCategoryId: string | null;
  categories: Category[];
}): string | null {
  const { explicitCategoryId, currentCategoryId, categories } = options;

  const allIds = collectCategoryIds(categories);

  if (explicitCategoryId && allIds.has(explicitCategoryId)) {
    return explicitCategoryId;
  }

  if (currentCategoryId && allIds.has(currentCategoryId)) {
    return currentCategoryId;
  }

  return getFirstRootCategoryId(categories);
}

export function createBookmark(params: {
  title: string;
  url: string;
  description?: string | null;
  categoryId: string;
  generateId: () => string;
  createTimestamp: () => string;
}): Bookmark {
  const { title, url, description, categoryId, generateId, createTimestamp } =
    params;

  return {
    id: generateId(),
    title,
    url: normalizeUrl(url),
    description: description ?? undefined,
    categoryId,
    createdAt: createTimestamp(),
  };
}

export type BookmarkUpdate = {
  title?: string | null;
  url?: string | null;
  description?: string | null | undefined;
  categoryId?: string | null;
};

export function applyBookmarkUpdate(
  bookmark: Bookmark,
  patch: BookmarkUpdate,
): Bookmark {
  let next: Bookmark = { ...bookmark };

  if (patch.title !== undefined) {
    if (patch.title !== null) {
      next = { ...next, title: patch.title };
    }
  }

  if (patch.url !== undefined) {
    if (patch.url !== null) {
      next = { ...next, url: normalizeUrl(patch.url) };
    }
  }

  if (patch.description !== undefined) {
    const description = patch.description ?? undefined;
    next = { ...next, description };
  }

  if (patch.categoryId !== undefined) {
    if (patch.categoryId !== null) {
      next = { ...next, categoryId: patch.categoryId };
    }
  }

  return next;
}
