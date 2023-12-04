<script>
import KnowledgeGraph from './KnowledgeGraph/KnowledgeGraph.vue'
import LearningPathManager from './LearningPathManager.vue'
import LoadingScreen from './LoadingScreen.vue'
import ModuleSelection from './ModuleSelection.vue'
import TileView from './TileView.vue'

export default {
  name: 'VerDatAsDashboard',
  components: {
    KnowledgeGraph,
    LearningPathManager,
    LoadingScreen,
    ModuleSelection,
    TileView
  },
  data() {
    return {
      backendURL: '',
      courseData: null,
      token: '',
      diagram: null,
      diagramLoaded: false,
      currentView: 'tileView',
      viewOnly: true,
      previewMode: false,
      path: './Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates' // standard path
    }
  },
  created() {
    this.initDashboard()
  },
  methods: {
    changeDiagramLoaded(diagramLoaded) {
      this.diagramLoaded = diagramLoaded
    },
    setBackendURL(backendURL) {
      if (backendURL && backendURL !== '') {
        this.backendURL = backendURL
      }
    },
    setCourseData(courseData) {
      if (courseData) {
        this.courseData = courseData
      }
    },
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.currentView = viewName
      }
    },
    setDiagram(diagram) {
      this.diagram = diagram
    },
    setToken(token) {
      if (token && token !== '') {
        this.token = token
      }
    },
    updateViewOnly(viewOnly) {
      this.viewOnly = viewOnly
      if (!this.viewOnly) {
        this.setCurrentView('tileView')
      }
    },
    setPreviewMode(isPreviewMode) {
      this.previewMode = isPreviewMode
      if (this.previewMode) {
        this.setCurrentView('tileView')
      }
    }
  }
}
</script>

<template>
  <div id="verdatas-dashboard">
    <LoadingScreen :diagramLoaded="diagramLoaded" :path="path"></LoadingScreen>
    <TileView
      :currentView="currentView"
      :viewOnly="viewOnly"
      :previewMode="previewMode"
      @setCurrentView="setCurrentView"
    />
    <ModuleSelection
      v-if="currentView === 'moduleSelection'"
      :backendURL="backendURL"
      :courseData="courseData"
      :diagram="diagram"
      :token="token"
      @setCurrentView="setCurrentView"
    />
    <LearningPathManager
      v-if="currentView === 'learningPathManager'"
      :diagram="diagram"
      @setCurrentView="setCurrentView"
    />
    <KnowledgeGraph
      :backendURL="backendURL"
      :courseData="courseData"
      :token="token"
      :currentView="currentView"
      :diagram="diagram"
      :diagramLoaded="diagramLoaded"
      :viewOnly="viewOnly"
      @loadedDiagram="changeDiagramLoaded"
      @setBackendURL="setBackendURL"
      @setCourseData="setCourseData"
      @setCurrentView="setCurrentView"
      @setDiagram="setDiagram"
      @setToken="setToken"
      @updateViewOnly="updateViewOnly"
      @setPreviewMode="setPreviewMode"
    />
  </div>
</template>

<style scoped>
#verdatas-dashboard {
  position: relative;
  height: 600px;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
