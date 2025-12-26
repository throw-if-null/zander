<script lang="ts">
  import type { Bookmark, Category } from "../../stores/stateTypes";

  const { open, mode, bookmark, categories, onSubmit, onCancel, onDelete } = $props<{
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

  // Reset form fields whenever the dialog opens
  // or when the bookmark/mode props change.
  $effect(() => {
    if (!open) return;

    title = bookmark?.title ?? "";
    url = bookmark?.url ?? "";
    description = bookmark?.description ?? "";
    categoryId = bookmark?.categoryId ?? null;
  });

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

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancel();
    } else if (event.key === "Enter") {
      if ((event.target as HTMLElement).tagName !== "TEXTAREA") {
        event.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleCategoryChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;
    categoryId = value === "" ? null : value;
  };
</script>

{#if open}
  <div class="dialog-backdrop">
    <div
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-label={isEditMode ? "Edit bookmark" : "Add bookmark"}
      onkeydown={handleKeydown}
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
            <input
              type="text"
              value={title}
              oninput={(event) => (title = (event.target as HTMLInputElement).value)}
            />
          </label>
        </div>

        <div>
          <label>
            URL
            <input
              type="url"
              value={url}
              oninput={(event) => (url = (event.target as HTMLInputElement).value)}
            />
          </label>
        </div>

        <div>
          <label>
            Description
            <textarea
              value={description}
              oninput={(event) =>
                (description = (event.target as HTMLTextAreaElement).value)}
            />
          </label>
        </div>

        <div>
          <label>
            Category
            <select onchange={handleCategoryChange}>
              <option value="">(None)</option>
              {#each categories as category}
                <option
                  value={category.id}
                  selected={category.id === categoryId}
                >
                  {category.name}
                </option>
              {/each}
            </select>
          </label>
        </div>

        <div class="dialog-actions">
          <button type="button" onclick={handleCancel}>
            Cancel
          </button>
          {#if isEditMode && onDelete}
            <button type="button" onclick={handleDelete}>
              Delete
            </button>
          {/if}
          <button type="submit">
            {isEditMode ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
