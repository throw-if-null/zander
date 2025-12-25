<script lang="ts">
  import LcarsApp from "./lib/components/lcars/LcarsApp.svelte";
  import LcarsHeaderBar from "./lib/components/lcars/LcarsHeaderBar.svelte";
  import LcarsSidebarBar from "./lib/components/lcars/LcarsSidebarBar.svelte";
  import LcarsFooterBar from "./lib/components/lcars/LcarsFooterBar.svelte";
  import LcarsStatusDisplay from "./lib/components/lcars/LcarsStatusDisplay.svelte";

  const title = "ZANDER";
</script>

<LcarsApp ariaLabel="Zander LCARS Console">
  <svelte:fragment slot="header">
    <LcarsHeaderBar {title} />
  </svelte:fragment>

  <svelte:fragment slot="sidebar">
    <LcarsSidebarBar ariaLabel="Navigation sidebar">
      <!-- Navigation/content will go here in later phases -->
    </LcarsSidebarBar>
  </svelte:fragment>

  <svelte:fragment slot="main">
    <main>
      <h1>Zander Svelte Shell</h1>
      <p>LCARS layout and behavior to be implemented.</p>
    </main>
  </svelte:fragment>

  <svelte:fragment slot="footer">
    <LcarsFooterBar ariaLabel="Global footer actions">
      <svelte:fragment slot="status">
        <LcarsStatusDisplay ariaLabel="System status">
          Svelte shell initialized
        </LcarsStatusDisplay>
      </svelte:fragment>
    </LcarsFooterBar>
  </svelte:fragment>
</LcarsApp>
