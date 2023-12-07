<script>
import KnowledgeGraph from '@/components/KnowledgeGraph/KnowledgeGraph.vue'
import LearningPathManager from '@/components/LearningPathManager.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import ModuleSelection from '@/components/ModuleSelection.vue'
import NavigationView from '@/components/NavigationView.vue'
import Settings from '@/components/SettingsView.vue'
import { DashboardData } from '@/types/dashboard-data'

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
      courseNode: null,
      token: '',
      diagram: null,
      diagramLoaded: false,
      currentView: 'knowledgeStructure',
      canViewOnly: true,
      previewMode: false
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
  methods: {
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
    }
  }
}
</script>

<template>
  <div id="verdatas-dashboard">
    <NavigationView v-if="!canViewOnly" @setCurrentView="setCurrentView" />
    <LoadingScreen :diagramLoaded="diagramLoaded" :path="path"></LoadingScreen>
    <KnowledgeGraph
      v-show="currentView === 'knowledgeStructure'"
      :backendUrl="backendUrl"
      :courseNode="courseNode"
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
    <Settings v-if="currentView === 'settings'" />
  </div>
</template>

<style scoped>
#verdatas-dashboard {
  outline: none !important;
  border: 1px solid #DDD;
  border-radius: 3px;
  position: relative;
  height: 600px;
  margin-bottom: 10px;
}
</style>
