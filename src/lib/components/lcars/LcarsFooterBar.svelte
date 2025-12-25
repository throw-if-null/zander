<script lang="ts">
  const { ariaLabel } = $props<{
    ariaLabel?: string;
  }>();
</script>

<footer
  class="lcars-footer-bar"
  role="contentinfo"
  aria-label={ariaLabel}
>
  <div class="lcars-footer-bar-primary-actions">
    <slot name="primaryActions" />
  </div>
  <div class="lcars-footer-bar-status">
    <slot name="status" />
  </div>
  <slot />
</footer>
