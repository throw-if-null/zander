<script lang="ts">
  const { ariaLabel } = $props<{
    ariaLabel?: string;
  }>();
</script>

<div
  class="lcars-app"
  role="application"
  aria-label={ariaLabel}
>
  <header>
    <slot name="header" />
  </header>

  <aside>
    <slot name="sidebar" />
  </aside>

  <section>
    <slot name="main" />
  </section>

  <footer>
    <slot name="footer" />
  </footer>
</div>
