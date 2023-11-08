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
    }
  }
}
</script>

<template>
  <div id="graph-controls" v-if="currentView !== 'tileView'">
    <button type="button" class="btn btn-secondary" @click="setCurrentView('tileView')">Settings</button>
    <button type="button" class="btn btn-secondary" @click="redrawKnowledgeGraph()">Redraw</button>
    <button type="button" class="btn btn-secondary" @click="saveKnowledgeGraph()">Save Graph</button>
    <button type="button" class="btn btn-secondary" @click="saveXML()">Download</button>
    <button type="button" class="btn btn-secondary" @click="centerCanvas()">Center</button>
  </div>
</template>

<style scoped>
#graph-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 6;
}
.btn {
  display: block;
  margin-bottom: 7px;
  width: 80px;
}
</style>
