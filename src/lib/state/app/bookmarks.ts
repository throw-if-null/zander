// lib/stores/state/bookmarks.ts
import type { Bookmark, State } from "../model";
import type { PersistAndSet } from "../app/appTypes";
import {
  createBookmark,
  getEffectiveCategoryIdForNewBookmark,
  applyBookmarkUpdate,
  type BookmarkUpdate,
} from "../domain/bookmarks";
import { createTimestamp, generateId } from "./utils";

export function createBookmarkActions(args: { persistAndSet: PersistAndSet }) {
  const { persistAndSet } = args;

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

      return { ...current, bookmarks: [...current.bookmarks, bookmark] };
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
      const index = current.bookmarks.findIndex(
        (b: Bookmark) => b.id === params.id,
      );
      if (index === -1) return current;

      const existing = current.bookmarks[index];
      const patch: BookmarkUpdate = {};

      if (params.title !== undefined) patch.title = params.title;
      if (params.url !== undefined) patch.url = params.url;
      if (params.description !== undefined)
        patch.description = params.description;

      if (params.categoryId !== undefined && params.categoryId !== null) {
        const effectiveCategoryId = getEffectiveCategoryIdForNewBookmark({
          explicitCategoryId: params.categoryId,
          currentCategoryId: current.currentCategoryId,
          categories: current.categories,
        });
        if (effectiveCategoryId) patch.categoryId = effectiveCategoryId;
      }

      const updated = applyBookmarkUpdate(existing, patch);
      const nextBookmarks = [...current.bookmarks];
      nextBookmarks[index] = updated;

      return { ...current, bookmarks: nextBookmarks };
    });
  };

  const deleteBookmark = async (id: string): Promise<State> => {
    return persistAndSet((current) => {
      const nextBookmarks = current.bookmarks.filter(
        (b: Bookmark) => b.id !== id,
      );
      if (nextBookmarks.length === current.bookmarks.length) return current;
      return { ...current, bookmarks: nextBookmarks };
    });
  };

  return { addBookmark, updateBookmark, deleteBookmark };
}
