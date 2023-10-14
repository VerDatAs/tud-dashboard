<script>
import KnowledgeGraph from './KnowledgeGraph/KnowledgeGraph.vue'
import LearningPathManager from './LearningPathManager.vue'
import LoadingScreen from './LoadingScreen.vue'
import ModuleSelection from './ModuleSelection.vue'
import NavigationView from './NavigationView.vue'
import { initialEvent } from '@/util/InitialEvent'
import axios from 'axios';

export default {
  name: 'VerDatAsDashboard',
  components: {
    KnowledgeGraph,
    LearningPathManager,
    LoadingScreen,
    ModuleSelection,
    NavigationView
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
      path: ''// TODO Niklas: Revert after integrating in ILIAS -> './Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates' // standard path
    }
  },
  created() {
    this.initDashboard()
    // TODO Niklas: Remove after integrating in ILIAS
    this.localInitialization()
  },
  methods: {
    // Helper function to init the graph manually after 1 second
    localInitialization() {
      // We need a valid token to work with the backend routes
      const authUrl = 'http://develop.verdatas.inf.tu-dresden.de:8062/api/v1/auth/login'
      const request = {
        "actorAccountName": "Robert",
        "password": "trebor"
      }
      axios.post(authUrl, request).then((data) => {
        let initEvent = initialEvent
        initEvent.token = data.data.token
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("init-graph", { "detail": initEvent }))
        }, 1000)
      })
    },
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
    }
  }
}
</script>

<template>
  <div id="verdatas-dashboard">
    <LoadingScreen :diagramLoaded="diagramLoaded" :path="path"></LoadingScreen>
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
    <NavigationView
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
  </div>
</template>

<!-- TODO Niklas: Remove max-width and margin: 0 auto after integrating in ILIAS and change margin-top back to 10px -->
<style scoped>
#verdatas-dashboard {
  position: relative;
  height: 600px;
  max-width: 1170px;
  margin: 0 auto;
  margin-top: 25px;
  margin-bottom: 10px;
}
</style>
