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
