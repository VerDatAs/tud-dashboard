<script>
import GraphControls from './GraphControls.vue'
import GraphViewer from './GraphViewer.vue'
import PropertiesPanel from './PropertiesPanel/PropertiesPanel.vue'

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
  }),
  props: {
    backendURL: String,
    diagram: Object,
    diagramLoaded: Boolean,
    courseData: Object,
    token: String,
    viewOnly: Boolean
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
    }
  }
}
</script>

<template>
  <div id="knowledge-graph">
    <GraphControls
    v-if="!viewOnly"
      @redrawKnowledgeGraph="redrawKnowledgeGraph"
      @saveKnowledgeGraph="saveKnowledgeGraph"
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
