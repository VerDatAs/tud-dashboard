<script>
import KnowledgeGraph from '@/components/KnowledgeGraph/KnowledgeGraph.vue'
import LearningPathManager from '@/components/LearningPathManager.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import ModuleSelection from '@/components/ModuleSelection.vue'
import NavigationView from '@/components/NavigationView.vue'
import QueryView from '@/components/QueryView.vue'
import Settings from '@/components/SettingsView.vue'
import { DashboardData } from '@/types/dashboard-data'
import { ref } from 'vue'

export default {
  name: 'VerDatAsDashboard',
  components: {
    KnowledgeGraph,
    LearningPathManager,
    LoadingScreen,
    ModuleSelection,
    NavigationView,
    QueryView,
    Settings
  },
  data() {
    return {
      courseNode: null,
      token: '',
      diagram: null,
      diagramLoaded: false,
      currentView: 'knowledgeStructure',
      canViewOnly: true,
      previewMode: false,
      isExpanded: ref(localStorage.getItem('is_expanded') === 'true')
    }
  },
  props: {
    initDashboardData: DashboardData
  },
  computed: {
    courseNode() {
      return this.initDashboardData?.courseNode ?? {}
    },
    token() {
      return this.initDashboardData?.token ?? ''
    },
    backendUrl() {
      return this.initDashboardData?.backendUrl ?? ''
    },
    path() {
      return this.initDashboardData?.path ?? ''
    },
    canViewOnly() {
      return this.initDashboardData?.canViewOnly ?? true
    },
    previewMode() {
      return this.initDashboardData?.previewMode ?? false
    }
  },
  created() {
    this.initDashboardApp()
  },
  methods: {
    initDashboardApp() {
      // https://stackoverflow.com/a/69196265
      // TODO: This will center the canvas on every resize. Improve if possible.
      new ResizeObserver(() => {
        this.$refs.knowledgeGraph.centerCanvas()
      }).observe(document.getElementById('dashboardApp'))
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
    toggleNavigationExpanded(value) {
      this.isExpanded = value
      localStorage.setItem('is_expanded', this.isExpanded + '')
      // TODO: This somehow makes the height larger than expected
      setTimeout(() => {
        this.$refs.knowledgeGraph.centerCanvas()
      }, 100)
    }
  }
}
</script>

<template>
  <div id="verdatas-dashboard">
    <NavigationView
      v-if="!canViewOnly"
      :isExpanded="isExpanded"
      @setCurrentView="setCurrentView"
      @toggleNavigationExpanded="toggleNavigationExpanded"
    />
    <LoadingScreen :diagramLoaded="diagramLoaded" :path="path"></LoadingScreen>
    <KnowledgeGraph
      ref="knowledgeGraph"
      v-show="currentView === 'knowledgeStructure'"
      :backendUrl="backendUrl"
      :courseNode="courseNode"
      :isExpanded="isExpanded"
      :token="token"
      :currentView="currentView"
      :diagram="diagram"
      :diagramLoaded="diagramLoaded"
      :canViewOnly="canViewOnly"
      @loadedDiagram="changeDiagramLoaded"
      @setCurrentView="setCurrentView"
      @setDiagram="setDiagram"
    />
    <ModuleSelection v-if="currentView === 'moduleSelection'" />
    <LearningPathManager v-if="currentView === 'learningPathManager'" />
    <QueryView v-if="currentView === 'query'" />
    <Settings v-if="currentView === 'settings'" />
  </div>
</template>

<style scoped>
#verdatas-dashboard {
  outline: none !important;
  border: 1px solid #ddd;
  border-radius: 3px;
  position: relative;
  height: 600px;
  width: 100%;
  margin-bottom: 10px;
}
</style>
