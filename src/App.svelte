<script lang="ts">
    import { onMount } from "svelte";
    import LcarsApp from "./lib/components/lcars/LcarsApp.svelte";
    import LcarsHeaderBar from "./lib/components/lcars/LcarsHeaderBar.svelte";
    import LcarsSidebarBar from "./lib/components/lcars/LcarsSidebarBar.svelte";
    import LcarsFooterBar from "./lib/components/lcars/LcarsFooterBar.svelte";
    import LcarsStatusDisplay from "./lib/components/lcars/LcarsStatusDisplay.svelte";
    import BookmarksView from "./lib/components/views/BookmarksView.svelte";
    import SettingsView from "./lib/components/views/SettingsView.svelte";
    import AboutView from "./lib/components/views/AboutView.svelte";
    import BookmarkDialog from "./lib/components/dialogs/BookmarkDialog.svelte";
    import { createStateStore } from "./lib/stores/stateStore";
    import { LocalStorageBackend } from "./lib/persistence/LocalStorageBackend";
    import { createThemeStore } from "./lib/stores/themeStore";
    import type { Bookmark } from "./lib/stores/stateTypes";

    const title = "ZANDER";

    const backend = new LocalStorageBackend();
    const stateStore = createStateStore(backend);
    const themeStore = createThemeStore();

    let isReady = $state(false);

    let isBookmarkDialogOpen = $state(false);
    let bookmarkDialogMode = $state<"create" | "edit">("create");
    let bookmarkDialogBookmark = $state<Bookmark | null>(null);

    onMount(async () => {
        await stateStore.loadInitialState();
        themeStore.loadInitialTheme();
        isReady = true;
    });

    // Set up global listeners after mount (non-async) so cleanup can be registered safely
    const setupGlobalListeners = () => {
        const handleGlobalShortcut = (ev: Event) => {
            const ce = ev as CustomEvent;
            const name = ce?.detail?.name as string | undefined;
            if (!name) return;

            switch (name) {
                case "home":
                    void stateStore.setCurrentView("bookmarks");
                    void stateStore.setCurrentSettingsPage(null);
                    break;
                case "settings":
                    void stateStore.setCurrentView("settings");
                    void stateStore.setCurrentSettingsPage("home");
                    break;
                case "add-bookmark":
                    openCreateBookmarkDialog();
                    break;
                case "add-category":
                    // Add a new root category and navigate to categories page
                    void stateStore.addCategory({ parentId: null, name: null });
                    void stateStore.setCurrentView("settings");
                    void stateStore.setCurrentSettingsPage("categories");
                    break;
                default:
                    break;
            }
        };

        const handleGlobalEscape = () => {
            if (isBookmarkDialogOpen) {
                closeBookmarkDialog();
            }
        };

        window.addEventListener("zander:shortcut", handleGlobalShortcut as EventListener);
        window.addEventListener("zander:escape", handleGlobalEscape as EventListener);

        return () => {
            window.removeEventListener("zander:shortcut", handleGlobalShortcut as EventListener);
            window.removeEventListener("zander:escape", handleGlobalEscape as EventListener);
        };
    };

    let teardownGlobalListeners = $state<(() => void) | null>(null);
    onMount(() => {
        teardownGlobalListeners = setupGlobalListeners();
    });

    // Ensure listeners are removed on destroy
    import { onDestroy } from "svelte";
    onDestroy(() => {
        if (teardownGlobalListeners) {
            teardownGlobalListeners();
        }
    });

    const handleHomeClick = () => {
        void stateStore.setCurrentView("bookmarks");
        void stateStore.setCurrentSettingsPage(null);
    };

    const openCreateBookmarkDialog = () => {
        bookmarkDialogMode = "create";
        bookmarkDialogBookmark = null;
        isBookmarkDialogOpen = true;
    };

    const openEditBookmarkDialog = (id: string) => {
        const currentState = $stateStore;
        if (!currentState) return;
        const existing =
            currentState.bookmarks.find((b) => b.id === id) ?? null;
        if (!existing) return;

        bookmarkDialogMode = "edit";
        bookmarkDialogBookmark = existing;
        isBookmarkDialogOpen = true;
    };

    const closeBookmarkDialog = () => {
        isBookmarkDialogOpen = false;
        bookmarkDialogBookmark = null;
    };

    const handleAddBookmark = () => {
        openCreateBookmarkDialog();
    };

    const handleEditBookmark = (id: string) => {
        openEditBookmarkDialog(id);
    };

    const handleDeleteBookmark = (id: string) => {
        void stateStore.deleteBookmark(id);
    };

    const handleBookmarkDialogSubmit = (detail: {
        title: string;
        url: string;
        categoryId: string | null;
        description: string | null;
    }) => {
        if (bookmarkDialogMode === "create") {
            void stateStore.addBookmark({
                title: detail.title,
                url: detail.url,
                categoryId: detail.categoryId,
                description: detail.description,
            });
        } else if (bookmarkDialogMode === "edit" && bookmarkDialogBookmark) {
            void stateStore.updateBookmark({
                id: bookmarkDialogBookmark.id,
                title: detail.title,
                url: detail.url,
                categoryId: detail.categoryId,
                description: detail.description,
            });
        }

        closeBookmarkDialog();
    };

    const handleBookmarkDialogCancel = () => {
        closeBookmarkDialog();
    };

    const handleBookmarkDialogDelete = (id: string) => {
        void stateStore.deleteBookmark(id);
        closeBookmarkDialog();
    };

    const handleSelectCategory = (categoryId: string | null) => {
        void stateStore.setCurrentCategory(categoryId);
    };

    const handleAddRootCategory = () => {
        void stateStore.addCategory({ parentId: null, name: null });
        void stateStore.setCurrentView("settings");
        void stateStore.setCurrentSettingsPage("categories");
    };

    const handleAddChildCategory = (categoryId: string) => {
        void stateStore.addCategory({ parentId: categoryId, name: null });
    };

    const handleMoveCategoryUp = (categoryId: string) => {
        void stateStore.moveCategory({ categoryId, direction: "up" });
    };

    const handleMoveCategoryDown = (categoryId: string) => {
        void stateStore.moveCategory({ categoryId, direction: "down" });
    };

    const handleDeleteCategory = (categoryId: string) => {
        void stateStore.deleteCategory({ categoryId });
    };

    const handleChangeTheme = (themeId: string) => {
        themeStore.setTheme(themeId);
    };

    const handleExportData = () => {
        // Placeholder for export flow
    };

    const handleImportData = () => {
        // Placeholder for import flow
    };

    const handleResetSystem = () => {
        void stateStore.resetSystem();
    };

    const handleGoToSettings = () => {
        void stateStore.setCurrentView("settings");
        void stateStore.setCurrentSettingsPage("home");
    };

    const handleGoToAbout = () => {
        void stateStore.setCurrentView("about");
        void stateStore.setCurrentSettingsPage(null);
    };
</script>

{#snippet header()}
    <LcarsHeaderBar {title} onHomeClick={handleHomeClick} />
{/snippet}

{#snippet sidebar()}
    <LcarsSidebarBar ariaLabel="Navigation sidebar">
        <!-- Navigation/content will go here in later phases -->
    </LcarsSidebarBar>
{/snippet}

{#snippet main()}
    {#if !isReady || $stateStore === null}
        <main>
            <h1>Initializing Zander console</h1>
            <p>Loading saved state or creating defaults.</p>
        </main>
    {:else if $stateStore.currentView === "bookmarks"}
        <BookmarksView
            state={$stateStore}
            onAddBookmark={handleAddBookmark}
            onEditBookmark={handleEditBookmark}
            onDeleteBookmark={handleDeleteBookmark}
        />
        <BookmarkDialog
            open={isBookmarkDialogOpen}
            mode={bookmarkDialogMode}
            bookmark={bookmarkDialogBookmark}
            categories={$stateStore.categories}
            onSubmit={handleBookmarkDialogSubmit}
            onCancel={handleBookmarkDialogCancel}
            onDelete={handleBookmarkDialogDelete}
        />
    {:else if $stateStore.currentView === "settings"}
        <SettingsView
            state={$stateStore}
            themeState={$themeStore}
            onAddRootCategory={handleAddRootCategory}
            onAddChildCategory={handleAddChildCategory}
            onMoveCategoryUp={handleMoveCategoryUp}
            onMoveCategoryDown={handleMoveCategoryDown}
            onDeleteCategory={handleDeleteCategory}
            onChangeTheme={handleChangeTheme}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetSystem={handleResetSystem}
        />
    {:else}
        <AboutView
            stardateLabel="TODO: stardate"
            earthDateLabel="TODO: earth date"
        />
    {/if}
{/snippet}

{#snippet footerPrimaryActions()}
    <button type="button" onclick={handleAddBookmark}> ADD ENTRY </button>
    <button type="button" onclick={handleGoToSettings}> SETTINGS </button>
    <button type="button" onclick={handleGoToAbout}> ABOUT </button>
{/snippet}

{#snippet footerStatus()}
    <LcarsStatusDisplay ariaLabel="System status">
        {#if !isReady}
            Initializing
        {:else}
            Svelte shell initialized
        {/if}
    </LcarsStatusDisplay>
{/snippet}

{#snippet footer()}
    <LcarsFooterBar
        ariaLabel="Global footer actions"
        primaryActions={footerPrimaryActions}
        status={footerStatus}
    />
{/snippet}

<LcarsApp ariaLabel="Zander LCARS Console" {header} {sidebar} {main} {footer} />
