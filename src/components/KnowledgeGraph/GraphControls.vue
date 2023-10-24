<script>
export default {
  props: {
    diagramLoaded: Boolean,
    currentView: String
  },
  methods: {
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
      }
    },
    redrawKnowledgeGraph() {
      this.$emit('redrawKnowledgeGraph', true)
    },
    saveKnowledgeGraph() {
      this.$emit('saveKnowledgeGraph', true)
    },
    saveXML() {
      this.$emit('saveXML', true)
    },
    centerCanvas() {
      this.$emit('centerCanvas', true)
    },
    toggleView() {
      this.$emit('toggleView')
    }
  }
}
</script>

<template>
  <div id="maximize">
    <font-awesome-icon class="icon" icon="maximize" size="xl" @click="toggleView()"/> 
  </div>
  <div id="controls">
    <font-awesome-icon class="icon" icon="refresh" size="xl" @click="redrawKnowledgeGraph()"/>
    <font-awesome-icon class="icon" icon="floppy-disk" size="xl"  @click="saveKnowledgeGraph()"/>
  </div>
</template>

<style scoped>
#controls {
  position: absolute;
  bottom: 2px;
  right: 2px;
  z-index: 110;
}
#maximize{
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 110;
}
.icon {
  cursor: pointer;
  display: block;
  margin-bottom: 7px;
}
</style>
