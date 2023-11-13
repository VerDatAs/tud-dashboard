<script>
import { useDebuggerStore } from '@/stores/settings'

export default {
  data() {
    return {
      debugging: useDebuggerStore()
    } 
  },
  methods: {
    redrawKnowledgeGraph() {
      this.$emit('redrawKnowledgeGraph', true)
    },
    saveKnowledgeGraph() {
      this.$emit('saveKnowledgeGraph', true)
    },
    saveXML() {
      this.$emit('saveXML', true)
    },
    toggleView() {
      this.$emit('toggleView')
    },
    test() {
      this.$emit('saveXML', true)
    }
  }
}
</script>

<template>
  <div id="maximize">
    <font-awesome-icon class="icon" icon="maximize" size="lg" @click="toggleView()" title="Enter Fullscreen"/> 
  </div>
  <div id="controls">
    <font-awesome-icon v-if="debugging.debuggingMode" class="icon" icon="refresh" size="xl" @click="redrawKnowledgeGraph()" title="Redraw Graph"/>
    <font-awesome-icon v-if="debugging.debuggingMode" class="icon" icon="download" size="xl" @click="saveXML()" title="Download Graph"/>
    <font-awesome-icon class="icon" icon="floppy-disk" size="xl"  @click="saveKnowledgeGraph()" title="Save Graph"/>   
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
  margin-left: 5px;
}
</style>
