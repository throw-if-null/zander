<script lang="ts">
    import type { AppState } from "../../state/app/appTypes";
    import { getVisibleBookmarks } from "../../state/selectors/bookmarks";

    const {
        state,
        onAddBookmark,
        onEditBookmark,
        onSelectCategory,
        onDeleteBookmark,
    } = $props<{
        state: AppState;
        onAddBookmark: () => void;
        onEditBookmark: (id: string) => void;
        onDeleteBookmark: (id: string) => void;
    }>();

    const visibleBookmarks = $derived(getVisibleBookmarks(state));

    const handleAddClick = () => {
        onAddBookmark();
    };

    const handleEditClick = (id: string) => {
        onEditBookmark(id);
    };

    const handleDeleteClick = (id: string) => {
        onDeleteBookmark(id);
    };
</script>

<main>
    <h1>Bookmarks</h1>

    <p>
        Categories: {state.categories.length}, bookmarks: {state.bookmarks
            .length}.
    </p>

    <button type="button" onclick={handleAddClick}> Add bookmark </button>

    {#if visibleBookmarks.length === 0}
        <p>No bookmarks to display.</p>
    {:else}
        <ul>
            {#each visibleBookmarks as bookmark}
                <li>
                    <div>
                        <strong>{bookmark.title}</strong>
                        <span>({bookmark.url})</span>
                    </div>
                    <div>
                        <button
                            type="button"
                            onclick={() => handleEditClick(bookmark.id)}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onclick={() => handleDeleteClick(bookmark.id)}
                        >
                            Delete
                        </button>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</main>
