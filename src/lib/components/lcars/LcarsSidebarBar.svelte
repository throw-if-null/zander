<script lang="ts">
  import type { Snippet } from "svelte";

  const { ariaLabel, children } = $props<{
    ariaLabel?: string;
    children?: Snippet;
  }>();
</script>

<aside
  class="lcars-sidebar-bar"
  aria-label={ariaLabel}
>
  <div class="lcars-sidebar-bar-top-cap"></div>
  <div class="lcars-sidebar-bar-track">
    {@render children?.()}
  </div>
  <div class="lcars-sidebar-bar-bottom-cap"></div>
</aside>

<style>
  .lcars-sidebar-bar {
    width: 240px;
    background: linear-gradient(180deg, var(--lcars-panel), rgba(0,0,0,0));
    border-right: 1px solid var(--lcars-border);
    padding: 12px 8px;
    color: var(--lcars-text);
    box-sizing: border-box;
  }

  .lcars-sidebar-bar-track {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
  }

  .lcars-sidebar-bar-top-cap,
  .lcars-sidebar-bar-bottom-cap {
    height: 16px;
    border-radius: 6px;
    background: var(--lcars-accent-primary);
    opacity: 0.08;
  }
</style>
