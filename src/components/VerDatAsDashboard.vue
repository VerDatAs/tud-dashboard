<script>
import KnowledgeGraph from './KnowledgeGraph/KnowledgeGraph.vue'
import LearningPathManager from './LearningPathManager.vue'
import LoadingScreen from './LoadingScreen.vue'
import ModuleSelection from './ModuleSelection.vue'
import NavigationView from './NavigationView.vue'
import Settings from './SettingsView.vue'

export default {
  name: 'VerDatAsDashboard',
  components: {
    KnowledgeGraph,
    LearningPathManager,
    LoadingScreen,
    ModuleSelection,
    NavigationView,
    Settings
  },
  data() {
    return {
      backendURL: '',
      courseData: null,
      token: '',
      diagram: null,
      diagramLoaded: false,
      currentView: 'knowledgeStructure',
      viewOnly: true,
      previewMode: false,
      path: './Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates',
      autosave: false,
      debugging: false
    }
  },
  created() {
    this.initDashboard()
  },
  methods: {
    initDashboard() {
      document.addEventListener('init-dashboard', (event) => {
        // https://github.com/vaadin/vaadin-upload/issues/138#issuecomment-266773430
        this.path = event.detail
      })
    },
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
        this.setCurrentView('knowledgeStructure')
      }
    },
    setPreviewMode(isPreviewMode) {
      this.previewMode = isPreviewMode
      if (this.previewMode) {
        this.setCurrentView('knowledgeStructure')
      }
    },
    toggleAutosave() {
      this.autosave = !this.autosave
    },
    toggleDebugging() {
      this.debugging = !this.debugging
    }
  }
}
</script>

<template>
  <div id="verdatas-dashboard">
    <NavigationView
      @setCurrentView="setCurrentView"
    />
    <LoadingScreen :diagramLoaded="diagramLoaded" :path="path"></LoadingScreen>
    <KnowledgeGraph
      v-show="currentView === 'knowledgeStructure'"
      :backendURL="backendURL"
      :courseData="courseData"
      :token="token"
      :currentView="currentView"
      :diagram="diagram"
      :diagramLoaded="diagramLoaded"
      :viewOnly="viewOnly"
      :autosave="autosave"
      :debugging="debugging"
      @loadedDiagram="changeDiagramLoaded"
      @setBackendURL="setBackendURL"
      @setCourseData="setCourseData"
      @setCurrentView="setCurrentView"
      @setDiagram="setDiagram"
      @setToken="setToken"
      @updateViewOnly="updateViewOnly"
      @setPreviewMode="setPreviewMode"
    />
    <ModuleSelection v-if="currentView === 'moduleSelection'"/>
    <LearningPathManager v-if="currentView === 'learningPathManager'"/>
    <Settings 
      v-if="currentView === 'settings'" 
      :autosave="autosave"
      :debugging="debugging"
      @toggleAutosave="toggleAutosave"
      @toggleDebugging="toggleDebugging"
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
