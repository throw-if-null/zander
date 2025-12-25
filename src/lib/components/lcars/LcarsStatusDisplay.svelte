<script lang="ts">
  type LiveMode = "off" | "polite" | "assertive";

  const { ariaLabel, liveMode = "off" } = $props<{
    ariaLabel?: string;
    liveMode?: LiveMode;
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
  <slot />
</div>
