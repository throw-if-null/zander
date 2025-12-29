// lib/stores/state/utils.ts
import type { Category, State } from "../model";

export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function createTimestamp(): string {
  return new Date().toISOString();
}

export function categoryExists(
  categories: State["categories"],
  id: string,
): boolean {
  if (!categories || categories.length === 0) return false;

  for (const category of categories) {
    if (category.id === id) return true;
    if (categoryExists(category.children, id)) return true;
  }

  return false;
}

export function collectIdsForCategoryTree(
  root: Category,
  acc: Set<string>,
): void {
  acc.add(root.id);
  for (const child of root.children) collectIdsForCategoryTree(child, acc);
}
