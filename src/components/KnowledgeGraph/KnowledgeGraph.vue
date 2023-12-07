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
    isMaximized: false,
  }),
  props: {
    backendURL: String,
    diagram: Object,
    diagramLoaded: Boolean,
    courseData: Object,
    token: String,
    viewOnly: Boolean
  },
  created() {
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this.isMaximized = false;
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
    setBackendURL(backendURL) {
      if (backendURL && backendURL !== '') {
        this.$emit('setBackendURL', backendURL)
      }
    },
    setCourseData(courseData) {
      if (courseData) {
        this.$emit('setCourseData', courseData)
      }
    },
    setToken(token) {
      if (token && token !== '') {
        this.$emit('setToken', token)
      }
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
    updateMetamodel(metamodel) {
      this.metamodel = metamodel
    },
    updateViewOnly(viewOnly) {
      this.$emit('updateViewOnly', viewOnly)
    },
    setPreviewMode(isPreviewMode) {
      this.$emit('setPreviewMode', isPreviewMode)
    },
    changeInput(parameterName, newValue) {
      this.$refs.graphViewer.changeInput(parameterName, newValue)
    },
    centerCanvas() {
      const canvas = this.diagram?.get('canvas')
      if(canvas) {
        centerCanvas(canvas)
      }
    },
    saveXML(value) {
      if (value) {
        this.$refs.graphViewer.saveXML()
      }
    },
    toggleView() {
      const elem = document.getElementById('knowledge-graph')
      if(!this.isMaximized) {
        this.openFullscreen(elem)
      } else {
        this.closeFullscreen()
      }
      
      this.isMaximized = !this.isMaximized
    },
    openFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      this.centerCanvas()
    },
    closeFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.centerCanvas()
    }
  }
}
</script>

<template>
  <div id="knowledge-graph">
    <GraphControls
      v-if="!viewOnly"
      :is-maximized="isMaximized"
      @redrawKnowledgeGraph="redrawKnowledgeGraph"
      @saveKnowledgeGraph="saveKnowledgeGraph"
      @saveXML="saveXML"
      @toggleView="toggleView"
    />
    <GraphViewer
      ref="graphViewer"
      :backendURL="backendURL"
      :courseData="courseData"
      :token="token"
      :diagram="diagram"
      :diagramLoaded="diagramLoaded"
      :elementSelected="elementSelected"
      :viewOnly="viewOnly"
      @loadedDiagram="changeDiagramLoaded"
      @selectedElement="selectedElement"
      @setBackendURL="setBackendURL"
      @setCourseData="setCourseData"
      @setDiagram="setDiagram"
      @setToken="setToken"
      @updateMetamodel="updateMetamodel"
      @updateViewOnly="updateViewOnly"
      @setPreviewMode="setPreviewMode"
    />
    <PropertiesPanel
      :diagram="diagram"
      :elementSelected="elementSelected"
      :metamodel="metamodel"
      :viewOnly="viewOnly"
      @changeInput="changeInput"
    />
  </div>
</template>

<style scoped>
#knowledge-graph {
  height: 100%;
  position: relative;
}
</style>
