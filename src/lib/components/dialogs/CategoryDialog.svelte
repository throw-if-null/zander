<script lang="ts">
    import { onDestroy } from "svelte";
    import type { Category } from "../../state/model";

    const {
        open,
        categories,
        initialParentId,
        onSubmit,
        onCancel,
    } = $props<{
        open: boolean;
        categories: Category[];
        initialParentId?: string | null;
        onSubmit: (detail: { name: string | null; parentId: string | null }) => void;
        onCancel: () => void;
    }>();

    let name = $state<string | null>(null);
    let selectedParent = $state<string | null>(null);
    let dialogEl = $state.raw<HTMLElement | null>(null);
    let previouslyFocused = $state.raw<Element | null>(null);

    const FOCUSABLE =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function flatten(categories: Category[], depth = 0): Array<{ id: string; name: string; depth: number }> {
        const out: Array<{ id: string; name: string; depth: number }> = [];
        for (const c of categories) {
            out.push({ id: c.id, name: c.name, depth });
            if (c.children && c.children.length > 0) {
                out.push(...flatten(c.children, depth + 1));
            }
        }
        return out;
    }

    $effect(() => {
        if (!open) return;

        // reset name and selectedParent
        name = null;
        selectedParent = initialParentId ?? null;

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
        onSubmit({ name: name === "" ? null : name, parentId: selectedParent ?? null });
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
            aria-label="Add category"
            bind:this={dialogEl}
        >
            <h2>Add Category</h2>

            <form
                onsubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <div>
                    <label>
                        Title
                        <input type="text" bind:value={name} />
                    </label>
                </div>

                <div>
                    <label>
                        Parent
                        <select bind:value={selectedParent}>
                            <option value="">(root)</option>
                            {#each flatten(categories) as item}
                                <option value={item.id}>
                                    {@html '&nbsp;'.repeat(item.depth * 4) + item.name}
                                </option>
                            {/each}
                        </select>
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
