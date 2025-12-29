<script lang="ts">
    import { onDestroy } from "svelte";

    const { open, parentName, onSubmit, onCancel } = $props<{
        open: boolean;
        parentName?: string | null;
        onSubmit: (detail: { name: string | null }) => void;
        onCancel: () => void;
    }>();

    let name = $state<string | null>(null);
    let dialogEl = $state.raw<HTMLElement | null>(null);
    let previouslyFocused = $state.raw<Element | null>(null);

    const FOCUSABLE =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    $effect(() => {
        if (!open) return;

        // reset name
        name = null;

        setTimeout(() => {
            previouslyFocused = document.activeElement;
            const nodes = dialogEl?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? null;
            const toFocus = nodes && nodes.length > 0 ? nodes[0] : dialogEl;
            toFocus?.focus();
        }, 0);

        document.addEventListener("keydown", handleKeydown);
    });

    function restoreFocus() {
        try {
            (previouslyFocused as HTMLElement | null)?.focus();
        } catch (e) {}
        previouslyFocused = null;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
        } else if (event.key === "Enter" && (event.target as HTMLElement).tagName !== "TEXTAREA") {
            event.preventDefault();
            handleSubmit();
        }
    }

    const handleSubmit = () => {
        onSubmit({ name: name === "" ? null : name });
    };

    $effect(() => {
        if (!open) {
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
            tabindex="-1"
            aria-modal="true"
            aria-label={parentName ? `Add subcategory to ${parentName}` : "Add category"}
            bind:this={dialogEl}
        >
            <h2>{parentName ? `Add Subcategory` : `Add Category`}</h2>

            {#if parentName}
                <p>Parent: {parentName}</p>
            {/if}

            <form
                onsubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <div>
                    <label>
                        Name
                        <input type="text" bind:value={name} />
                    </label>
                </div>

                <div class="dialog-actions">
                    <button type="button" onclick={() => onCancel()}>Cancel</button>
                    <button type="submit">Add</button>
                </div>
            </form>
        </div>
    </div>
{/if}
