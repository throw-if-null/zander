<script lang="ts">
  const { title, homeHref = null, ariaLabel, onHomeClick } = $props<{
    title: string;
    homeHref?: string | null;
    ariaLabel?: string;
    onHomeClick?: () => void;
  }>();

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
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
      onclick={handleHomeClick}
    >
      {title}
    </a>
  {:else}
    <button
      class="lcars-header-bar-home"
      type="button"
      onclick={handleHomeClick}
    >
      {title}
    </button>
  {/if}

  <div class="lcars-header-bar-fill" />

  <div class="lcars-header-bar-endcap" />
</header>
