<script lang="ts">
  import type { Snippet } from "svelte";

  const { ariaLabel, header, sidebar, main, footer } = $props<{
    ariaLabel?: string;
    header?: Snippet;
    sidebar?: Snippet;
    main?: Snippet;
    footer?: Snippet;
  }>();
</script>

<div class="lcars-app" role="application" aria-label={ariaLabel}>
  <header>
    {@render header?.()}
  </header>

  <aside>
    {@render sidebar?.()}
  </aside>

  <section>
    {@render main?.()}
  </section>

  <footer>
    {@render footer?.()}
  </footer>
</div>
