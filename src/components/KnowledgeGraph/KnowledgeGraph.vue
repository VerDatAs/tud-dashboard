<script>
import GraphControls from './GraphControls.vue'
import GraphViewer from './GraphViewer.vue'
import PropertiesPanel from './PropertiesPanel/PropertiesPanel.vue'
import { centerCanvas } from '@/util/GraphHelpers'

export default {
  name: 'KnowledgeGraph',
  components: {
    GraphControls,
    GraphViewer,
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
    isExpanded: Boolean
  },
  emits: [
    'loadedDiagram',
    'setDiagram',
    'updateCourseNode'
  ],
  created() {
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.isMaximized = false
        document.getElementById('verdatas-dashboard').classList.remove('fullViewHeight')
        this.centerCanvas()
      }
    })
  },
  methods: {
    setDiagram(diagram) {
      this.$emit('setDiagram', diagram)
    },
    changeDiagramLoaded(diagramLoaded) {
      this.$emit('loadedDiagram', diagramLoaded)
    },
    selectedElement(element) {
      this.elementSelected = element
    },
    redrawKnowledgeGraph(value) {
      if (value) {
        this.$refs.graphViewer.redrawKnowledgeGraph()
      }
    },
    saveKnowledgeGraph(value) {
      if (value) {
        this.$refs.graphViewer.saveKnowledgeGraph()
      }
    },
    updateCourseNode(courseNode) {
      this.$emit('updateCourseNode', courseNode)
    },
    updateMetamodel(metamodel) {
      this.metamodel = metamodel
    },
    changeInput(parameterName, newValue) {
      this.$refs.graphViewer.changeInput(parameterName, newValue)
    },
    centerCanvas() {
      const canvas = this.diagram?.get('canvas')
      if (canvas) {
        centerCanvas(canvas)
      }
    },
    saveXML(value) {
      if (value) {
        this.$refs.graphViewer.saveXML()
      }
    },
    toggleView() {
      const elem = document.getElementById('dashboardApp')
      if (!this.isMaximized) {
        this.openFullscreen(elem)
      } else {
        this.closeFullscreen()
      }

      this.isMaximized = !this.isMaximized
    },
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
      @loadedDiagram="changeDiagramLoaded"
      @selectedElement="selectedElement"
      @setDiagram="setDiagram"
      @updateCourseNode="updateCourseNode"
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
