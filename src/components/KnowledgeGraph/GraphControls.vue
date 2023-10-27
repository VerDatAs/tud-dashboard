<script>
export default {
  methods: {
    redrawKnowledgeGraph() {
      this.$emit('redrawKnowledgeGraph', true)
    },
    saveKnowledgeGraph() {
      this.$emit('saveKnowledgeGraph', true)
    }
  }
}
</script>

<template>
  <div id="controls">
    <font-awesome-icon class="icon" icon="floppy-disk" size="xl"  @click="saveKnowledgeGraph()" title="Save Graph"/>
    <font-awesome-icon class="icon" icon="refresh" size="xl" @click="redrawKnowledgeGraph()" title="Redraw Graph"/>
  </div>
</template>

<style scoped>
#controls {
  position: absolute;
  bottom: 2px;
  right: 2px;
  z-index: 110;
}
.icon {
  cursor: pointer;
  margin-left: 5px;
}
</style>
