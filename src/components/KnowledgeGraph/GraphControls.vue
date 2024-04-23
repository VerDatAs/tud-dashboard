<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script>
import { useSettingStore } from '@/stores/settings'

export default {
  data: () => ({
    settings: useSettingStore()
  }),
  props: {
    isMaximized: Boolean
  },
  emits: ['redrawKnowledgeGraph', 'saveKnowledgeGraph', 'saveXML', 'toggleView'],
  methods: {
    /**
     * Emit an event to redraw the knowledge graph.
     */
    redrawKnowledgeGraph() {
      this.$emit('redrawKnowledgeGraph', true)
    },
    /**
     * Emit an event to save the knowledge graph.
     */
    saveKnowledgeGraph() {
      this.$emit('saveKnowledgeGraph', true)
    },
    /**
     * Emit an event to save the knowledge graph as XML.
     */
    saveXML() {
      this.$emit('saveXML', true)
    },
    /**
     * Emit an event to toggle the view.
     */
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
