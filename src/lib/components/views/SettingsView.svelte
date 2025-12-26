<script lang="ts">
  import type { State } from "../../stores/stateTypes";
  import type { ThemeState } from "../../stores/themeStore";

  const {
    state,
    themeState,
    onChangeCategoryTree,
    onChangeTheme,
    onExportData,
    onImportData,
    onResetSystem,
  } = $props<{
    state: State;
    themeState: ThemeState;
    onChangeCategoryTree: () => void;
    onChangeTheme: (themeId: string) => void;
    onExportData: () => void;
    onImportData: () => void;
    onResetSystem: () => void;
  }>();

  const handleExportClick = () => {
    onExportData();
  };

  const handleResetClick = () => {
    onResetSystem();
  };
</script>

<main role="main">
  <h1>Settings</h1>
  <p>Categories configured: {state.categories.length}</p>
  <p>Available themes: {themeState.themes.length}</p>
  <button type="button" onclick={handleExportClick}>
    Export data
  </button>
  <button type="button" onclick={handleResetClick}>
    Reset system
  </button>
</main>
