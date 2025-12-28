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

  <div class="lcars-header-bar-fill"></div>

  <div class="lcars-header-bar-endcap"></div>
</header>

<style>
  .lcars-header-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(180deg, var(--lcars-panel), rgba(0,0,0,0.0));
    color: var(--lcars-text);
    padding: 10px 16px;
    border-bottom: 1px solid var(--lcars-border);
  }

  .lcars-header-bar-home {
    font-family: var(--font-sans);
    font-size: var(--type-heading-size);
    color: var(--lcars-accent-primary);
    background: transparent;
    border: none;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-decoration: none;
  }

  .lcars-header-bar-home:focus-visible {
    outline: none;
    box-shadow: var(--lcars-focus-glow);
  }

  .lcars-header-bar-fill {
    flex: 1 1 auto;
    height: 18px;
  }

  .lcars-header-bar-endcap {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--lcars-accent-secondary);
  }
</style>
