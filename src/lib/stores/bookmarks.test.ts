import { describe, it, expect } from "vitest";
import type { Category, Bookmark } from "./stateTypes";
import {
  normalizeUrl,
  getEffectiveCategoryIdForNewBookmark,
  createBookmark,
  applyBookmarkUpdate,
} from "./bookmarks";

function createCategories(): Category[] {
  return [
    {
      id: "root",
      name: "Root",
      color: "#fff",
      createdAt: "sd-root",
      children: [
        {
          id: "child",
          name: "Child",
          color: "#eee",
          createdAt: "sd-child",
          children: [],
        },
      ],
    },
  ];
}

describe("normalizeUrl", () => {
  it("adds https:// when scheme is missing", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("  example.com  ")).toBe("https://example.com");
  });

  it("leaves existing schemes unchanged", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeUrl("https://example.com")).toBe("https://example.com");
    expect(normalizeUrl("mailto:test@example.com")).toBe("mailto:test@example.com");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
  });
});

describe("getEffectiveCategoryIdForNewBookmark", () => {
  it("prefers an explicit valid category id", () => {
    const categories = createCategories();

    const result = getEffectiveCategoryIdForNewBookmark({
      explicitCategoryId: "child",
      currentCategoryId: "root",
      categories,
    });

    expect(result).toBe("child");
  });

  it("falls back to currentCategoryId when explicit is missing or invalid", () => {
    const categories = createCategories();

    const result = getEffectiveCategoryIdForNewBookmark({
      explicitCategoryId: "non-existent",
      currentCategoryId: "child",
      categories,
    });

    expect(result).toBe("child");
  });

  it("falls back to first root when neither explicit nor current are valid", () => {
    const categories = createCategories();

    const result = getEffectiveCategoryIdForNewBookmark({
      explicitCategoryId: null,
      currentCategoryId: "non-existent",
      categories,
    });

    expect(result).toBe("root");
  });

  it("returns null when there are no categories", () => {
    const result = getEffectiveCategoryIdForNewBookmark({
      explicitCategoryId: null,
      currentCategoryId: null,
      categories: [],
    });

    expect(result).toBeNull();
  });
});

describe("createBookmark", () => {
  it("builds a bookmark with normalized url and provided category", () => {
    const generateId = () => "generated-id";
    const createTimestamp = () => "stardate-1";

    const bookmark = createBookmark({
      title: "Test",
      url: "example.com",
      description: null,
      categoryId: "root",
      generateId,
      createTimestamp,
    });

    expect(bookmark.id).toBe("generated-id");
    expect(bookmark.title).toBe("Test");
    expect(bookmark.url).toBe("https://example.com");
    expect(bookmark.description).toBeUndefined();
    expect(bookmark.categoryId).toBe("root");
    expect(bookmark.createdAt).toBe("stardate-1");
  });
});

describe("applyBookmarkUpdate", () => {
  const original: Bookmark = {
    id: "b1",
    title: "Original",
    url: "https://original.example",
    description: "desc",
    categoryId: "root",
    createdAt: "stardate-original",
  };

  it("updates title and url when provided and keeps createdAt", () => {
    const updated = applyBookmarkUpdate(original, {
      title: "Updated",
      url: "updated.example",
    });

    expect(updated.title).toBe("Updated");
    expect(updated.url).toBe("https://updated.example");
    expect(updated.createdAt).toBe("stardate-original");
  });

  it("clears description when explicitly set to null and leaves it when undefined", () => {
    const cleared = applyBookmarkUpdate(original, { description: null });
    expect(cleared.description).toBeUndefined();

    const unchanged = applyBookmarkUpdate(original, {});
    expect(unchanged.description).toBe("desc");
  });

  it("updates categoryId when provided and non-null", () => {
    const updated = applyBookmarkUpdate(original, { categoryId: "child" });
    expect(updated.categoryId).toBe("child");
  });

  it("does not change fields when patch uses only nulls", () => {
    const updated = applyBookmarkUpdate(original, {
      title: null,
      url: null,
      categoryId: null,
    });

    expect(updated.title).toBe(original.title);
    expect(updated.url).toBe(original.url);
    expect(updated.categoryId).toBe(original.categoryId);
  });
});
