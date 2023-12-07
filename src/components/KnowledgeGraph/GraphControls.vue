<script>
import { useSettingStore } from '@/stores/settings'

export default {
  data: () => ({
    settings: useSettingStore()
  }),
  props: {
    isMaximized: Boolean
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
      this.$emit('toggleView', true)
    }
  }
}
</script>

<template>
  <div id="maximize">
    <font-awesome-icon
      class="icon"
      icon="maximize"
      size="lg"
      @click="toggleView()"
      :title="isMaximized ? 'Vollbild-Modus beenden' : 'Vollbild-Modus einschalten'"
    />
  </div>
  <div id="controls">
    <font-awesome-icon
      v-if="settings.debugging"
      class="icon"
      icon="refresh"
      size="xl"
      @click="redrawKnowledgeGraph()"
      title="Graph neuzeichnen"
    />
    <font-awesome-icon
      v-if="settings.debugging"
      class="icon"
      icon="download"
      size="xl"
      @click="saveXML()"
      title="Graph herunterladen"
    />
    <font-awesome-icon
      class="icon"
      icon="floppy-disk"
      size="xl"
      @click="saveKnowledgeGraph()"
      title="Graph speichern"
    />
  </div>
</template>

<style scoped>
#controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 6;
}
#maximize {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 6;
}
.icon {
  cursor: pointer;
  margin-left: 5px;
}
</style>
