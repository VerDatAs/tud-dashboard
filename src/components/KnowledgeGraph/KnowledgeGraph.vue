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
import GraphControls from './GraphControls.vue'
import GraphViewer from './GraphViewer.vue'
import IconLegend from './IconLegend.vue'
import LearningState from './LearningState.vue'
import PropertiesPanel from './PropertiesPanel/PropertiesPanel.vue'
import { centerCanvas } from '@/util/GraphHelpers'

export default {
  name: 'KnowledgeGraph',
  components: {
    GraphControls,
    GraphViewer,
    IconLegend,
    LearningState,
    PropertiesPanel
  },
  data: () => ({
    // TODO: Holding and modifying the currently selected element will produce a console error:
    // Uncaught TypeError: 'get' on proxy: property 'children' is a read-only and non-configurable data property
    // on the proxy target but the proxy did not return its actual value (expected '[object Array]' but got '[object Array]')
    // Further information: https://stackoverflow.com/a/70648940/3623608
    elementSelected: null,
    metamodel: null,
    isMaximized: false
  }),
  props: {
    backendUrl: String,
    diagram: Object,
    diagramLoaded: Boolean,
    courseNode: Object,
    token: String,
    canViewOnly: Boolean,
    members: Array,
    isExpanded: Boolean,
    pseudoId: String
  },
  emits: ['loadedDiagram', 'setDiagram'],
  watch: {
    /**
     * Watch for changes on the expansion value.
     */
    isExpanded() {
      // TODO: This only works when using setTimeout
      setTimeout(() => {
        this.diagram?.get('canvas')?.resized()
        this.centerCanvas()
      }, 1)
    }
  },
  created() {
    // Add a listener for detecting switching into fullscreen mode in order to apply changes to the view
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.isMaximized = false
        document.getElementById('verdatas-dashboard').classList.remove('fullViewHeight')
        this.centerCanvas()
      }
    })
  },
  methods: {
    /**
     * Emit a given diagram value.
     *
     * @param diagram
     */
    setDiagram(diagram) {
      this.$emit('setDiagram', diagram)
    },
    /**
     * Emit a given diagramLoaded value.
     *
     * @param diagramLoaded
     */
    changeDiagramLoaded(diagramLoaded) {
      this.$emit('loadedDiagram', diagramLoaded)
    },
    /**
     * Set a given element as the selected element.
     *
     * @param element
     */
    selectedElement(element) {
      this.elementSelected = element
    },
    /**
     * If a given value exists, trigger the redraw of the knowledge graph.
     *
     * @param value
     */
    redrawKnowledgeGraph(value) {
      if (value) {
        this.$refs.graphViewer.redrawKnowledgeGraph()
      }
    },
    /**
     * If a given value exists, trigger the saving of the knowledge graph.
     *
     * @param value
     */
    saveKnowledgeGraph(value) {
      if (value) {
        this.$refs.graphViewer.saveKnowledgeGraph()
      }
    },
    /**
     * Set a given metamodel as the current metamodel.
     *
     * @param metamodel
     */
    updateMetamodel(metamodel) {
      this.metamodel = metamodel
    },
    /**
     * Trigger changing the input for a given parameter name into a new value.
     *
     * @param parameterName
     * @param newValue
     */
    changeInput(parameterName, newValue) {
      this.$refs.graphViewer.changeInput(parameterName, newValue)
    },
    /**
     * Center the canvas.
     */
    centerCanvas() {
      const canvas = this.diagram?.get('canvas')
      if (canvas) {
        centerCanvas(canvas)
      }
    },
    /**
     * If a given value exists, trigger the saving as XML.
     *
     * @param value
     */
    saveXML(value) {
      if (value) {
        this.$refs.graphViewer.saveXML()
      }
    },
    /**
     * Toggle the view of the dashboard app between normal and fullscreen mode.
     */
    toggleView() {
      const elem = document.getElementById('dashboardApp')
      if (!this.isMaximized) {
        this.openFullscreen(elem)
      } else {
        this.closeFullscreen()
      }

      this.isMaximized = !this.isMaximized
    },
    /**
     * Open the fullscreen mode for a given element.
     *
     * @param elem
     */
    openFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
      document.getElementById('verdatas-dashboard').classList.add('fullViewHeight')
      this.centerCanvas()
    },
    /**
     * Close the fullscreen mode.
     */
    closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
      document.getElementById('verdatas-dashboard').classList.remove('fullViewHeight')
      this.centerCanvas()
    }
  }
}
</script>

<template>
  <div id="knowledge-graph" :class="isExpanded ? 'margin-250' : ''">
    <GraphControls
      v-if="!canViewOnly"
      :is-maximized="isMaximized"
      @redrawKnowledgeGraph="redrawKnowledgeGraph"
      @saveKnowledgeGraph="saveKnowledgeGraph"
      @saveXML="saveXML"
      @toggleView="toggleView"
    />
    <GraphViewer
      ref="graphViewer"
      :backendUrl="backendUrl"
      :courseNode="courseNode"
      :token="token"
      :diagram="diagram"
      :diagramLoaded="diagramLoaded"
      :elementSelected="elementSelected"
      :canViewOnly="canViewOnly"
      :pseudoId="pseudoId"
      @loadedDiagram="changeDiagramLoaded"
      @selectedElement="selectedElement"
      @setDiagram="setDiagram"
      @updateMetamodel="updateMetamodel"
    />
    <PropertiesPanel
      :backendUrl="backendUrl"
      :diagram="diagram"
      :elementSelected="elementSelected"
      :metamodel="metamodel"
      :canViewOnly="canViewOnly"
      :members="members"
      @changeInput="changeInput"
    />
    <IconLegend v-if="canViewOnly" />
    <LearningState v-if="canViewOnly" />
  </div>
</template>

<style scoped>
#knowledge-graph {
  height: 100%;
  position: relative;
}

.margin-250 {
  margin-left: 250px;
}
</style>
