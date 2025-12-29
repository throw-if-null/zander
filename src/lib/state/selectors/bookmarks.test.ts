import { describe, it, expect } from "vitest";
import type { State, Bookmark, Category } from "../stateTypes";
import { getVisibleBookmarks } from "./bookmarks";

function createState(opts: {
  bookmarks: Bookmark[];
  categories: Category[];
  currentCategoryId: string | null;
}): State {
  return {
    bookmarks: opts.bookmarks,
    categories: opts.categories,
    currentCategoryId: opts.currentCategoryId,
    currentView: "bookmarks",
    currentSettingsPage: null,
    landingCategoryId: null,
  };
}

describe("getVisibleBookmarks", () => {
  it("returns all bookmarks when currentCategoryId is null", () => {
    const categories: Category[] = [
      {
        id: "root-a",
        name: "Root A",
        color: "#fff",
        createdAt: "stardate-a",
        children: [],
      },
      {
        id: "root-b",
        name: "Root B",
        color: "#eee",
        createdAt: "stardate-b",
        children: [],
      },
    ];

    const bookmarks: Bookmark[] = [
      {
        id: "b1",
        title: "One",
        url: "https://one.example",
        description: "",
        categoryId: "root-a",
        createdAt: "sd1",
      },
      {
        id: "b2",
        title: "Two",
        url: "https://two.example",
        description: "",
        categoryId: "root-b",
        createdAt: "sd2",
      },
    ];

    const state = createState({
      bookmarks,
      categories,
      currentCategoryId: null,
    });

    const visible = getVisibleBookmarks(state);

    expect(visible).toEqual(bookmarks);
  });

  it("returns bookmarks within the selected category subtree", () => {
    const categories: Category[] = [
      {
        id: "root",
        name: "Root",
        color: "#fff",
        createdAt: "stardate-root",
        children: [
          {
            id: "child-a",
            name: "Child A",
            color: "#eee",
            createdAt: "stardate-a",
            children: [],
          },
          {
            id: "child-b",
            name: "Child B",
            color: "#ddd",
            createdAt: "stardate-b",
            children: [
              {
                id: "grandchild-b1",
                name: "Grandchild B1",
                color: "#ccc",
                createdAt: "stardate-b1",
                children: [],
              },
            ],
          },
        ],
      },
    ];

    const bookmarks: Bookmark[] = [
      {
        id: "b-root",
        title: "Root bookmark",
        url: "https://root.example",
        description: "",
        categoryId: "root",
        createdAt: "sd-root",
      },
      {
        id: "b-a",
        title: "Child A bookmark",
        url: "https://a.example",
        description: "",
        categoryId: "child-a",
        createdAt: "sd-a",
      },
      {
        id: "b-b",
        title: "Child B bookmark",
        url: "https://b.example",
        description: "",
        categoryId: "child-b",
        createdAt: "sd-b",
      },
      {
        id: "b-b1",
        title: "Grandchild B1 bookmark",
        url: "https://b1.example",
        description: "",
        categoryId: "grandchild-b1",
        createdAt: "sd-b1",
      },
    ];

    const state = createState({
      bookmarks,
      categories,
      currentCategoryId: "child-b",
    });

    const visible = getVisibleBookmarks(state);

    const expected = bookmarks.filter((b) =>
      ["child-b", "grandchild-b1"].includes(b.categoryId),
    );

    expect(visible).toEqual(expected);
  });

  it("defensively returns all bookmarks if the selected category does not exist", () => {
    const categories: Category[] = [
      {
        id: "root",
        name: "Root",
        color: "#fff",
        createdAt: "stardate-root",
        children: [],
      },
    ];

    const bookmarks: Bookmark[] = [
      {
        id: "b1",
        title: "One",
        url: "https://one.example",
        description: "",
        categoryId: "root",
        createdAt: "sd1",
      },
    ];

    const state = createState({
      bookmarks,
      categories,
      currentCategoryId: "missing-category",
    });

    const visible = getVisibleBookmarks(state);

    expect(visible).toEqual(bookmarks);
  });
});
