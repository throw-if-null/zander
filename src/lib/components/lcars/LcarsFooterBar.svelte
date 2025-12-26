<script lang="ts">
  import type { Snippet } from "svelte";

  const { ariaLabel, primaryActions, status, children } = $props<{
    ariaLabel?: string;
    primaryActions?: Snippet;
    status?: Snippet;
    children?: Snippet;
  }>();
</script>

<footer
  class="lcars-footer-bar"
  role="contentinfo"
  aria-label={ariaLabel}
>
  <div class="lcars-footer-bar-primary-actions">
    {@render primaryActions?.()}
  </div>
  <div class="lcars-footer-bar-status">
    {@render status?.()}
  </div>
  {@render children?.()}
</footer>
