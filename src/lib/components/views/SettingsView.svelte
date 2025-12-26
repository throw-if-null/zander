<script lang="ts">
    import type { Category, State } from "../../stores/stateTypes";
    import type { ThemeState } from "../../stores/themeStore";

    const {
        state,
        themeState,
        onAddRootCategory,
        onAddChildCategory,
        onMoveCategoryUp,
        onMoveCategoryDown,
        onDeleteCategory,
        onChangeTheme,
        onExportData,
        onImportData,
        onResetSystem,
    } = $props<{
        state: State;
        themeState: ThemeState;
        onAddRootCategory: () => void;
        onAddChildCategory: (categoryId: string) => void;
        onMoveCategoryUp: (categoryId: string) => void;
        onMoveCategoryDown: (categoryId: string) => void;
        onDeleteCategory: (categoryId: string) => void;
        onChangeTheme: (themeId: string) => void;
        onExportData: () => void;
        onImportData: () => void;
        onResetSystem: () => void;
    }>();

    const handleAddRootCategoryClick = () => {
        onAddRootCategory();
    };

    const handleAddChildCategoryClick = (categoryId: string) => {
        onAddChildCategory(categoryId);
    };

    const handleMoveCategoryUpClick = (categoryId: string) => {
        onMoveCategoryUp(categoryId);
    };

    const handleMoveCategoryDownClick = (categoryId: string) => {
        onMoveCategoryDown(categoryId);
    };

    const handleDeleteCategoryClick = (categoryId: string) => {
        onDeleteCategory(categoryId);
    };


    const handleThemeChange = (event: Event) => {
        const value = (event.target as HTMLInputElement).value;
        if (value) {
            onChangeTheme(value);
        }
    };

    const handleExportClick = () => {
        onExportData();
    };

    const handleImportClick = () => {
        onImportData();
    };

    const handleResetClick = () => {
        onResetSystem();
    };
</script>

{#snippet renderCategoryList(categories: Array<Category>)}
    {#if categories.length > 0}
        <ul>
            {#each categories as category}
                <li>
                    <span>{category.name}</span>
                    <button
                        type="button"
                        onclick={() => handleAddChildCategoryClick(category.id)}
                    >
                        + Subcategory
                    </button>
                    <button
                        type="button"
                        onclick={() => handleMoveCategoryUpClick(category.id)}
                    >
                        Move up
                    </button>
                    <button
                        type="button"
                        onclick={() => handleMoveCategoryDownClick(category.id)}
                    >
                        Move down
                    </button>
                    <button
                        type="button"
                        onclick={() => handleDeleteCategoryClick(category.id)}
                    >
                        Delete
                    </button>
                    {@render renderCategoryList(category.children)}
                </li>
            {/each}
        </ul>
    {/if}
{/snippet}

<main>
    <h1>Settings</h1>

    <section aria-labelledby="settings-categories-heading">
        <h2 id="settings-categories-heading">Categories</h2>
        <p>Configured categories: {state.categories.length}</p>
        <button type="button" onclick={handleAddRootCategoryClick}>
            Add root category
        </button>

        {#if state.categories.length === 0}
            <p>No categories configured yet.</p>
        {:else}
            <div aria-label="Category tree">
                {@render renderCategoryList(state.categories)}
            </div>
        {/if}
    </section>

    <section aria-labelledby="settings-themes-heading">
        <h2 id="settings-themes-heading">Themes</h2>

        {#if themeState.themes.length === 0}
            <p>No themes available.</p>
        {:else}
            <fieldset>
                <legend>Select active theme</legend>

                {#each themeState.themes as theme}
                    <label>
                        <input
                            type="radio"
                            name="theme"
                            value={theme.id}
                            checked={theme.id === themeState.currentThemeId}
                            onchange={handleThemeChange}
                        />
                        {theme.label}
                    </label>
                {/each}
            </fieldset>
        {/if}
    </section>

    <section aria-labelledby="settings-data-heading">
        <h2 id="settings-data-heading">Data management</h2>
        <button type="button" onclick={handleExportClick}> Export data </button>
        <button type="button" onclick={handleImportClick}> Import data </button>
    </section>

    <section aria-labelledby="settings-danger-heading">
        <h2 id="settings-danger-heading">Danger zone</h2>
        <p>
            Resetting the system will clear bookmarks and categories and restore
            the default bundle.
        </p>
        <button type="button" onclick={handleResetClick}> Reset system </button>
    </section>
</main>
