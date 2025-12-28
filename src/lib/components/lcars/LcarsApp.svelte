<script lang="ts">
  import type { Snippet } from "svelte";

  const { ariaLabel, header, sidebar, main, footer } = $props<{
    ariaLabel?: string;
    header?: Snippet;
    sidebar?: Snippet;
    main?: Snippet;
    footer?: Snippet;
  }>();

  // Keyboard shortcuts (Alt+H, Alt+S, Alt+B, Alt+C)
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      const k = event.key.toLowerCase();
      if (k === "h") {
        event.preventDefault();
        dispatchShortcut("home");
      } else if (k === "s") {
        event.preventDefault();
        dispatchShortcut("settings");
      } else if (k === "b") {
        event.preventDefault();
        dispatchShortcut("add-bookmark");
      } else if (k === "c") {
        event.preventDefault();
        dispatchShortcut("add-category");
      }
    }

    if (event.key === "Escape") {
      // Close active dialogs by dispatching a global escape event
      const esc = new CustomEvent("zander:escape", { bubbles: true });
      window.dispatchEvent(esc);
    }
  };

  function dispatchShortcut(name: string) {
    const ev = new CustomEvent("zander:shortcut", { detail: { name }, bubbles: true });
    window.dispatchEvent(ev);
  }

  $effect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>

<div class="lcars-app" role="application" aria-label={ariaLabel}>
  <header>
    {@render header?.()}
  </header>

  <aside>
    {@render sidebar?.()}
  </aside>

  <main id="main" tabindex="-1">
    {@render main?.()}
  </main>

  <footer>
    {@render footer?.()}
  </footer>
</div>

<style>
  .lcars-app {
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer footer";
    min-height: 100vh;
    background: var(--lcars-bg);
    color: var(--lcars-text);
  }

  header { grid-area: header; }
  aside { grid-area: sidebar; }
  main { grid-area: main; padding: 18px; }
  footer { grid-area: footer; }
</style>
