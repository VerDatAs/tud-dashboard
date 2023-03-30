<script>
import KnowledgeGraph from './KnowledgeGraph/KnowledgeGraph.vue'
import LearningPathManager from './LearningPathManager.vue'
import LoadingScreen from './LoadingScreen.vue'
import TileView from './TileView.vue'

export default {
  name: 'VerDatAsDashboard',
  components: {
    KnowledgeGraph,
    LearningPathManager,
    LoadingScreen,
    TileView
  },
  data() {
    return {
      diagram: null,
      diagramLoaded: false,
      currentView: 'tileView',
      viewOnly: true,
      path: './Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates' // standard path
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
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.currentView = viewName
      }
    },
    setDiagram(diagram) {
      this.diagram = diagram
    },
    updateViewOnly(viewOnly) {
      this.viewOnly = viewOnly
      if (!this.viewOnly) {
        this.setCurrentView('tileView')
      }
    }
  }
}
</script>

<template>
  <div id="verdatas-dashboard">
    <LoadingScreen :diagramLoaded="diagramLoaded" :path="path"></LoadingScreen>
    <TileView :currentView="currentView" :viewOnly="viewOnly" @setCurrentView="setCurrentView" />
    <LearningPathManager
      v-if="currentView === 'learningPathManager'"
      :diagram="diagram"
      @setCurrentView="setCurrentView"
    />
    <KnowledgeGraph
      :currentView="currentView"
      :diagram="diagram"
      :diagramLoaded="diagramLoaded"
      :viewOnly="viewOnly"
      @loadedDiagram="changeDiagramLoaded"
      @setCurrentView="setCurrentView"
      @setDiagram="setDiagram"
      @updateViewOnly="updateViewOnly"
    />
  </div>
</template>

<style scoped>
#verdatas-dashboard {
  position: relative;
  height: 600px;
}
</style>
