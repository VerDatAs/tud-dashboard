<script>

export default {
  data: () => ({
    }),
  methods: {
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
      }
    }
  }
}
</script>

<template>
  <div id="learning-path-manager">
    <div class="container py-4" style="max-width: 100%">
      <h2>LearningPath Manager</h2>
      <p>...</p>
    </div>
  </div>
</template>

<style scoped>
#learning-path-manager {
  z-index: 115;
  position: absolute;
  top: 15%;
  left: 15%;
  height: calc(100% - 30%);
  width: calc(100% - 30%);
  background: #eee;
  border: 1px solid #ccc;
  }
</style>
