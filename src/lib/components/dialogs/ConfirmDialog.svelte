<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    const {
        open,
        title,
        message,
        confirmLabel,
        cancelLabel,
        onConfirm,
        onCancel,
    } = $props<{
        open: boolean;
        title?: string;
        message?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        onConfirm: () => void;
        onCancel: () => void;
    }>();

    let dialogEl = $state.raw<HTMLElement | null>(null);
    let previouslyFocused = $state.raw<Element | null>(null);

    const FOCUSABLE =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function trapTabKey(e: KeyboardEvent) {
        if (e.key !== "Tab") return;
        const nodes =
            dialogEl?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? null;
        if (!nodes || nodes.length === 0) return;

        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
            if (active === first || !dialogEl?.contains(active)) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (active === last || !dialogEl?.contains(active)) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
        }
        trapTabKey(event);
    }

    function setupFocus() {
        previouslyFocused = document.activeElement;
        // Focus first focusable element or the dialog container
        const nodes =
            dialogEl?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? null;
        const toFocus = nodes && nodes.length > 0 ? nodes[0] : dialogEl;
        toFocus?.focus();
    }

    function restoreFocus() {
        try {
            (previouslyFocused as HTMLElement | null)?.focus();
        } catch (e) {
            // ignore
        }
        previouslyFocused = null;
    }

    $effect(() => {
        if (open) {
            // Defer to next tick so element is in DOM
            setTimeout(() => setupFocus(), 0);
            document.addEventListener("keydown", handleKeydown);
        } else {
            document.removeEventListener("keydown", handleKeydown);
            restoreFocus();
        }
    });

    onDestroy(() => {
        document.removeEventListener("keydown", handleKeydown);
    });
</script>

{#if open}
    <div class="dialog-backdrop">
        <div
            class="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            tabindex="-1"
            bind:this={dialogEl}
        >
            <h2 id="confirm-dialog-title">{title ?? "Confirm"}</h2>
            {#if message}
                <p>{message}</p>
            {/if}

            <div class="dialog-actions">
                <button type="button" onclick={() => onCancel()}
                    >{cancelLabel ?? "Cancel"}</button
                >
                <button type="button" onclick={() => onConfirm()}
                    >{confirmLabel ?? "OK"}</button
                >
            </div>
        </div>
    </div>
{/if}
