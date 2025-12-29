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
    import { createAppState, createThemeState } from "./lib/state/index";
    import { LocalStorageBackend } from "./lib/persistence/LocalStorageBackend";
    import type { Bookmark } from "./lib/state/model";

    const title = "ZANDER";

    const backend = new LocalStorageBackend();
    const app = createAppState(backend);
    const theme = createThemeState();

    let isReady = $state(false);

    let isBookmarkDialogOpen = $state(false);
    let bookmarkDialogMode = $state<"create" | "edit">("create");
    let bookmarkDialogBookmark = $state<Bookmark | null>(null);

    onMount(async () => {
        await app.loadInitialState();
        theme.loadInitialTheme();
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
                    void app.setCurrentView("bookmarks");
                    void app.setCurrentSettingsPage(null);
                    break;
                case "settings":
                    void app.setCurrentView("settings");
                    void app.setCurrentSettingsPage("home");
                    break;
                case "add-bookmark":
                    openCreateBookmarkDialog();
                    break;
                case "add-category":
                    // Add a new root category and navigate to categories page
                    void app.addCategory({ parentId: null, name: null });
                    void app.setCurrentView("settings");
                    void app.setCurrentSettingsPage("categories");
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

        window.addEventListener(
            "zander:shortcut",
            handleGlobalShortcut as EventListener,
        );
        window.addEventListener(
            "zander:escape",
            handleGlobalEscape as EventListener,
        );

        return () => {
            window.removeEventListener(
                "zander:shortcut",
                handleGlobalShortcut as EventListener,
            );
            window.removeEventListener(
                "zander:escape",
                handleGlobalEscape as EventListener,
            );
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
        void app.setCurrentView("bookmarks");
        void app.setCurrentSettingsPage(null);
    };

    const openCreateBookmarkDialog = () => {
        bookmarkDialogMode = "create";
        bookmarkDialogBookmark = null;
        isBookmarkDialogOpen = true;
    };

    const openEditBookmarkDialog = (id: string) => {
        const currentState = app.model.state;
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
        void app.deleteBookmark(id);
    };

    const handleBookmarkDialogSubmit = (detail: {
        title: string;
        url: string;
        categoryId: string | null;
        description: string | null;
    }) => {
        if (bookmarkDialogMode === "create") {
            void app.addBookmark({
                title: detail.title,
                url: detail.url,
                categoryId: detail.categoryId,
                description: detail.description,
            });
        } else if (bookmarkDialogMode === "edit" && bookmarkDialogBookmark) {
            void app.updateBookmark({
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
        void app.deleteBookmark(id);
        closeBookmarkDialog();
    };

    const handleSelectCategory = (categoryId: string | null) => {
        void app.setCurrentCategory(categoryId);
    };

    const handleAddRootCategory = () => {
        void app.addCategory({ parentId: null, name: null });
        void app.setCurrentView("settings");
        void app.setCurrentSettingsPage("categories");
    };

    const handleAddChildCategory = (categoryId: string) => {
        void app.addCategory({ parentId: categoryId, name: null });
    };

    const handleMoveCategoryUp = (categoryId: string) => {
        void app.moveCategory({ categoryId, direction: "up" });
    };

    const handleMoveCategoryDown = (categoryId: string) => {
        void app.moveCategory({ categoryId, direction: "down" });
    };

    const handleDeleteCategory = (categoryId: string) => {
        void app.deleteCategory({ categoryId });
    };

    const handleChangeTheme = (themeId: string) => {
        theme.setTheme(themeId);
    };

    const handleExportData = () => {
        // Placeholder for export flow
    };

    const handleImportData = () => {
        // Placeholder for import flow
    };

    const handleResetSystem = () => {
        void app.resetSystem();
    };

    const handleGoToSettings = () => {
        void app.setCurrentView("settings");
        void app.setCurrentSettingsPage("home");
    };

    const handleGoToAbout = () => {
        void app.setCurrentView("about");
        void app.setCurrentSettingsPage(null);
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
    {#if !app.model.isReady || app.model.state === null}
        <main>
            <h1>Initializing Zander console</h1>
            <p>Loading saved state or creating defaults.</p>
        </main>
    {:else if app.model.state.currentView === "bookmarks"}
        <BookmarksView
            state={app.model.state}
            onAddBookmark={handleAddBookmark}
            onEditBookmark={handleEditBookmark}
            onDeleteBookmark={handleDeleteBookmark}
        />
        <BookmarkDialog
            open={isBookmarkDialogOpen}
            mode={bookmarkDialogMode}
            bookmark={bookmarkDialogBookmark}
            categories={app.model.state.categories}
            onSubmit={handleBookmarkDialogSubmit}
            onCancel={handleBookmarkDialogCancel}
            onDelete={handleBookmarkDialogDelete}
        />
    {:else if app.model.state.currentView === "settings"}
        <SettingsView
            state={app.model.state}
            themeState={theme.state}
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
