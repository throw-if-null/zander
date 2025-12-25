<script lang="ts">
  const { ariaLabel } = $props<{
    ariaLabel?: string;
  }>();
</script>

<aside
  class="lcars-sidebar-bar"
  role="complementary"
  aria-label={ariaLabel}
>
  <div class="lcars-sidebar-bar-top-cap" />
  <div class="lcars-sidebar-bar-track">
    <slot />
  </div>
  <div class="lcars-sidebar-bar-bottom-cap" />
</aside>
