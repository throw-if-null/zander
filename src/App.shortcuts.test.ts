import { describe, it, expect } from "vitest";
import { setupGlobalShortcuts } from "./lib/shortcuts/shortcuts";

describe("Global shortcuts helper", () => {
  it("calls handlers for shortcut events", () => {
    let opened = false;
    let wentToSettings = false;
    let wentHome = false;
    let addedCategory = false;

    const teardown = setupGlobalShortcuts({
      openCreateBookmarkDialog: () => {
        opened = true;
      },
      goToSettings: () => {
        wentToSettings = true;
      },
      goToHome: () => {
        wentHome = true;
      },
      addCategory: () => {
        addedCategory = true;
      },
    });

    window.dispatchEvent(new CustomEvent("zander:shortcut", { detail: { name: "add-bookmark" } }));
    window.dispatchEvent(new CustomEvent("zander:shortcut", { detail: { name: "settings" } }));
    window.dispatchEvent(new CustomEvent("zander:shortcut", { detail: { name: "home" } }));
    window.dispatchEvent(new CustomEvent("zander:shortcut", { detail: { name: "add-category" } }));

    expect(opened).toBe(true);
    expect(wentToSettings).toBe(true);
    expect(wentHome).toBe(true);
    expect(addedCategory).toBe(true);

    // Test that teardown removes listeners (dispatching further events doesn't change flags)
    teardown();

    opened = false;
    window.dispatchEvent(new CustomEvent("zander:shortcut", { detail: { name: "add-bookmark" } }));
    expect(opened).toBe(false);
  });

  it("dispatches internal escape event on zander:escape", (done) => {
    const onInternal = () => {
      window.removeEventListener("zander:escape:internal", onInternal);
      done();
    };

    window.addEventListener("zander:escape:internal", onInternal);
    // trigger escape
    window.dispatchEvent(new CustomEvent("zander:escape"));
  });
});
