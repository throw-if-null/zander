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

<style>
  .lcars-footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: linear-gradient(180deg, rgba(0,0,0,0.02), transparent);
    border-top: 1px solid var(--lcars-border);
    color: var(--lcars-text);
  }

  .lcars-footer-bar-primary-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .lcars-footer-bar-status {
    display: flex;
    gap: 10px;
    align-items: center;
    color: var(--lcars-meta);
    font-size: var(--type-body-size);
  }

  .lcars-footer-bar button:focus-visible {
    outline: none;
    box-shadow: var(--lcars-focus-glow);
  }
</style>
