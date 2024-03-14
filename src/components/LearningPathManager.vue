<script>
export default {
  props: {
    isExpanded: Boolean
  }
}
</script>

<template>
  <div id="learning-path-manager" :class="`${isExpanded ? 'is-expanded' : ''}`">
    <div class="container py-4" style="max-width: 100%">
      <h2>Lernpfad-Verwaltung</h2>
      <p>...</p>
    </div>
  </div>
</template>

<style scoped>
#learning-path-manager {
  z-index: 8;
  position: absolute;
  top: 10px;
  left: calc(1rem + 32px + 10px);
  height: calc(100% - 20px);
  width: calc(100% - (1rem + 32px) - 20px);
  background: #eee;
  border: 1px solid #ccc;
  overflow-y: scroll;
}
#learning-path-manager.is-expanded {
  left: calc(var(--sidebar-width) + 10px);
  width: calc(100% - var(--sidebar-width) - 20px);
}
</style>
