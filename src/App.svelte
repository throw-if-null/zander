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
  import { createStateStore } from "./lib/stores/stateStore";
  import { LocalStorageBackend } from "./lib/persistence/LocalStorageBackend";
  import { createThemeStore } from "./lib/stores/themeStore";

  const title = "ZANDER";

  const backend = new LocalStorageBackend();
  const stateStore = createStateStore(backend);
  const themeStore = createThemeStore();

  let isReady = false;

  onMount(async () => {
    await stateStore.loadInitialState();
    themeStore.loadInitialTheme();
    isReady = true;
  });

  const handleHomeClick = () => {
    void stateStore.setCurrentView("bookmarks");
    void stateStore.setCurrentSettingsPage(null);
  };

  const handleAddBookmark = () => {
    // Placeholder for bookmark dialog integration
  };

  const handleEditBookmark = (id: string) => {
    // Placeholder for bookmark dialog integration
    void id;
  };

  const handleSelectCategory = (categoryId: string | null) => {
    // Placeholder for category selection integration
    void categoryId;
  };

  const handleChangeCategoryTree = () => {
    // Placeholder for settings-driven category changes
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
    // Placeholder for reset flow
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

<LcarsApp ariaLabel="Zander LCARS Console">
  <svelte:fragment slot="header">
    <LcarsHeaderBar {title} onHomeClick={handleHomeClick} />
  </svelte:fragment>

  <svelte:fragment slot="sidebar">
    <LcarsSidebarBar ariaLabel="Navigation sidebar">
      <!-- Navigation/content will go here in later phases -->
    </LcarsSidebarBar>
  </svelte:fragment>

  <svelte:fragment slot="main">
    {#if !isReady || $stateStore === null}
      <main>
        <h1>Initializing Zander console…</h1>
        <p>Loading saved state… or creating defaults.</p>
      </main>
    {:else}
      {#if $stateStore.currentView === "bookmarks"}
        <BookmarksView
          state={$stateStore}
          onAddBookmark={handleAddBookmark}
          onEditBookmark={handleEditBookmark}
          onSelectCategory={handleSelectCategory}
        />
      {:else if $stateStore.currentView === "settings"}
        <SettingsView
          state={$stateStore}
          themeState={$themeStore}
          onChangeCategoryTree={handleChangeCategoryTree}
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
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="footer">
    <LcarsFooterBar ariaLabel="Global footer actions">
      <svelte:fragment slot="primaryActions">
        <button type="button" onclick={handleAddBookmark}>
          ADD ENTRY
        </button>
        <button type="button" onclick={handleGoToSettings}>
          SETTINGS
        </button>
        <button type="button" onclick={handleGoToAbout}>
          ABOUT
        </button>
      </svelte:fragment>

      <svelte:fragment slot="status">
        <LcarsStatusDisplay ariaLabel="System status">
          {#if !isReady}
            Initializing…
          {:else}
            Svelte shell initialized
          {/if}
        </LcarsStatusDisplay>
      </svelte:fragment>
    </LcarsFooterBar>
  </svelte:fragment>
</LcarsApp>
