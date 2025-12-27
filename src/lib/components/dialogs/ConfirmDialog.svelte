<script lang="ts">
  const { open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel } = $props<{
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>();

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };
</script>

{#if open}
  <div class="dialog-backdrop">
    <div class="dialog" role="dialog" aria-modal="true" tabindex="-1" onkeydown={handleKeydown}>
      <h2>{title ?? 'Confirm'}</h2>
      <p>{message ?? ''}</p>

      <div class="dialog-actions">
        <button type="button" onclick={onCancel}>{cancelLabel ?? 'Cancel'}</button>
        <button type="button" onclick={onConfirm}>{confirmLabel ?? 'OK'}</button>
      </div>
    </div>
  </div>
{/if}
