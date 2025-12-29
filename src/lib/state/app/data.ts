// lib/stores/state/data.ts
import type { ExportBundle, State } from "../model";
import type { PersistAndSet } from "../app/appTypes";
import { collectCategoryIds } from "../domain/bookmarks";

export function createDataActions(args: { persistAndSet: PersistAndSet }) {
  const { persistAndSet } = args;

  const applyExportBundle = async (bundle: ExportBundle): Promise<State> => {
    return persistAndSet((current) => {
      const incomingState = bundle.state;

      const allowedCategoryIds = collectCategoryIds(incomingState.categories);

      const filteredBookmarks = incomingState.bookmarks.filter((bookmark) =>
        allowedCategoryIds.has(bookmark.categoryId),
      );

      let nextCurrentCategoryId = current.currentCategoryId;
      if (
        nextCurrentCategoryId &&
        !allowedCategoryIds.has(nextCurrentCategoryId)
      ) {
        const firstRoot = incomingState.categories[0];
        nextCurrentCategoryId = firstRoot ? firstRoot.id : null;
      }

      return {
        ...current,
        ...incomingState,
        bookmarks: filteredBookmarks,
        categories: incomingState.categories,
        currentCategoryId: nextCurrentCategoryId,
      };
    });
  };

  return { applyExportBundle };
}
