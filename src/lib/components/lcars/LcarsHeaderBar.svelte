<script lang="ts">
  import { createEventDispatcher } from "svelte";

  type HeaderEvents = {
    homeClick: void;
  };

  const dispatch = createEventDispatcher<HeaderEvents>();

  const { title, homeHref = null, ariaLabel } = $props<{
    title: string;
    homeHref?: string | null;
    ariaLabel?: string;
  }>();

  const onHomeClick = () => {
    dispatch("homeClick");
  };
</script>

<header
  class="lcars-header-bar"
  role="banner"
  aria-label={ariaLabel ?? title}
>
  {#if homeHref}
    <a
      class="lcars-header-bar-home"
      href={homeHref}
      on:click={onHomeClick}
    >
      {title}
    </a>
  {:else}
    <button
      class="lcars-header-bar-home"
      type="button"
      on:click={onHomeClick}
    >
      {title}
    </button>
  {/if}

  <div class="lcars-header-bar-fill">
    <slot />
  </div>

  <div class="lcars-header-bar-endcap" />
</header>
