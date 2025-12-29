<script lang="ts">
    import { onDestroy } from "svelte";
    import type { Bookmark, Category } from "../../state/model";

    const { open, mode, bookmark, categories, onSubmit, onCancel, onDelete } =
        $props<{
            open: boolean;
            mode: "create" | "edit";
            bookmark: Bookmark | null;
            categories: Category[];
            onSubmit: (detail: {
                title: string;
                url: string;
                categoryId: string | null;
                description: string | null;
            }) => void;
            onCancel: () => void;
            onDelete?: (id: string) => void;
        }>();

    const isEditMode = $derived(mode === "edit");

    let title = $state("");
    let url = $state("");
    let description = $state("");
    let categoryId = $state<string | null>(null);

    // Focus management
    let dialogEl = $state.raw<HTMLElement | null>(null);
    let previouslyFocused = $state.raw<Element | null>(null);

    const FOCUSABLE =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    $effect(() => {
        if (!open) return;

        title = bookmark?.title ?? "";
        url = bookmark?.url ?? "";
        description = bookmark?.description ?? "";
        categoryId = bookmark?.categoryId ?? null;

        // Setup focus after DOM insertion
        setTimeout(() => {
            previouslyFocused = document.activeElement;
            const nodes =
                dialogEl?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? null;
            const toFocus = nodes && nodes.length > 0 ? nodes[0] : dialogEl;
            toFocus?.focus();
        }, 0);

        document.addEventListener("keydown", handleKeydown);
    });

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
        } else if (event.key === "Enter") {
            if ((event.target as HTMLElement).tagName !== "TEXTAREA") {
                event.preventDefault();
                handleSubmit();
            }
        }
        trapTabKey(event);
    }

    const handleSubmit = () => {
        onSubmit({
            title,
            url,
            categoryId,
            description: description === "" ? null : description,
        });
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleDelete = () => {
        if (isEditMode && bookmark && onDelete) {
            onDelete(bookmark.id);
        }
    };

    const handleCategoryChange = (event: Event) => {
        const value = (event.target as HTMLSelectElement).value;
        categoryId = value === "" ? null : value;
    };

    function restoreFocus() {
        try {
            (previouslyFocused as HTMLElement | null)?.focus();
        } catch (e) {}
        previouslyFocused = null;
    }

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
            aria-label={isEditMode ? "Edit bookmark" : "Add bookmark"}
            bind:this={dialogEl}
        >
            <h2>{isEditMode ? "Edit bookmark" : "Add bookmark"}</h2>

            <form
                onsubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <div>
                    <label>
                        Title
                        <input type="text" bind:value={title} required />
                    </label>
                </div>

                <div>
                    <label>
                        URL
                        <input type="url" bind:value={url} required />
                    </label>
                </div>

                <div>
                    <label>
                        Description
                        <textarea bind:value={description}></textarea>
                    </label>
                </div>

                <div>
                    <label>
                        Category
                        <select
                            onchange={handleCategoryChange}
                            bind:value={categoryId}
                        >
                            <option value="">(None)</option>
                            {#each categories as category}
                                <option value={category.id}
                                    >{category.name}</option
                                >
                            {/each}
                        </select>
                    </label>
                </div>

                <div class="dialog-actions">
                    <button type="button" onclick={handleCancel}>Cancel</button>
                    {#if isEditMode && onDelete}
                        <button type="button" onclick={handleDelete}
                            >Delete</button
                        >
                    {/if}
                    <button type="submit">{isEditMode ? "Save" : "Add"}</button>
                </div>
            </form>
        </div>
    </div>
{/if}
