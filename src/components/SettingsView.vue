<script>
export default {
  data: () => ({
    test: null
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
  <div id="settings">
    <div class="container py-4" style="max-width: 100%">
        <h1>Settings</h1>

        <div class="setting">
            <input type="checkbox"/>
            Auto-Save

        </div>
        <div class="setting">
            <input type="checkbox"/>
            Debugging Modus
        </div>
    </div>
  </div>
</template>

<style scoped>
#settings {
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