<script lang="ts">
  import type { State } from "../../stores/stateTypes";

  const { state, onAddBookmark, onEditBookmark, onSelectCategory } = $props<{
    state: State;
    onAddBookmark: () => void;
    onEditBookmark: (id: string) => void;
    onSelectCategory: (categoryId: string | null) => void;
  }>();

  const handleAddClick = () => {
    onAddBookmark();
  };
</script>

<main role="main">
  <h1>Bookmarks</h1>
  <p>
    Bookmarks view stub. Categories: {state.categories.length},
    bookmarks: {state.bookmarks.length}.
  </p>
  <button type="button" on:click={handleAddClick}>
    Add bookmark
  </button>
</main>
