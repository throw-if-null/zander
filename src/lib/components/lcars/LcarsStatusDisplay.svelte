<script lang="ts">
  import type { Snippet } from "svelte";

  type LiveMode = "off" | "polite" | "assertive";

  const { ariaLabel, liveMode = "off", children } = $props<{
    ariaLabel?: string;
    liveMode?: LiveMode;
    children?: Snippet;
  }>();

  const isLive = $derived(liveMode !== "off");
  const liveAttributes = $derived(
    isLive ? { role: "status", "aria-live": liveMode } : {}
  );
</script>

<div
  class="lcars-status-display"
  aria-label={ariaLabel}
  {...liveAttributes}
>
  {@render children?.()}
</div>

<style>
  .lcars-status-display {
    display: flex;
    gap: 12px;
    align-items: center;
    font-family: var(--font-sans);
    color: var(--lcars-text);
  }

  .lcars-status-display .lcars-status-label {
    font-size: var(--type-body-size);
    color: var(--lcars-meta);
  }

  .lcars-status-display .lcars-status-item {
    font-size: var(--type-body-size);
  }
</style>
