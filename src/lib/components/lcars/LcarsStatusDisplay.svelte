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
