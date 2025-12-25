import { describe, it, expect } from "vitest";
import App from "./App.svelte";

// Minimal smoke test: ensure the component can be imported
// and that it exposes a valid Svelte component constructor.

describe("App", () => {
  it("is a valid Svelte component", () => {
    expect(typeof App).toBe("function");
  });
});
