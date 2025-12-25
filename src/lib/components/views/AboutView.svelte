<script lang="ts">
  const { stardateLabel, earthDateLabel } = $props<{
    stardateLabel: string;
    earthDateLabel: string;
  }>();
</script>

<main role="main">
  <h1>About Zander</h1>
  <p>Stardate: {stardateLabel}</p>
  <p>Earth date: {earthDateLabel}</p>
</main>
