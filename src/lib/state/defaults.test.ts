import { describe, it, expect } from "vitest";
import { createDefaultState } from "./defaults";

describe("createDefaultState", () => {
  it("returns an empty initial State with expected defaults", () => {
    const state = createDefaultState();

    expect(state.bookmarks).toEqual([]);
    expect(state.categories).toEqual([]);
    expect(state.currentCategoryId).toBeNull();
    expect(state.currentView).toBe("bookmarks");
    expect(state.currentSettingsPage).toBeNull();
    expect(state.landingCategoryId).toBeNull();
  });
});
