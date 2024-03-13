<script>
import KnowledgeGraph from '@/components/KnowledgeGraph/KnowledgeGraph.vue'
import CollaborationMonitoring from '@/components/CollaborationMonitoring.vue'
import LearningPathManager from '@/components/LearningPathManager.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import ModuleSelection from '@/components/ModuleSelection.vue'
import NavigationView from '@/components/NavigationView.vue'
import Settings from '@/components/SettingsView.vue'
import { useDashboardDataStore } from '@/stores/dashboardData'
import { ref } from 'vue'

export default {
  name: 'VerDatAsDashboard',
  components: {
    CollaborationMonitoring,
    KnowledgeGraph,
    LearningPathManager,
    LoadingScreen,
    ModuleSelection,
    NavigationView,
    Settings
  },
  data() {
    return {
      dashboardDataStore: useDashboardDataStore(),
      diagram: null,
      diagramLoaded: false,
      currentView: 'knowledgeStructure',
      isExpanded: ref(localStorage.getItem('is_expanded') === 'true'),
      courseNode: {},
      token: '',
      backendUrl: '',
      path: '',
      canViewOnly: true,
      previewMode: false,
      members: [],
      pseudoId: ''
    }
  },
  created() {
    this.initDashboardApp()
  },
  methods: {
    initDashboardApp() {
      this.courseNode = this.dashboardDataStore.data?.courseNode ?? {}
      this.token = this.dashboardDataStore.data?.token ?? ''
      this.backendUrl = this.dashboardDataStore.data?.backendUrl ?? ''
      this.path = this.dashboardDataStore.data?.path ?? ''
      this.canViewOnly = this.dashboardDataStore.data?.canViewOnly ?? true
      this.previewMode = this.dashboardDataStore.data?.previewMode ?? false
      this.members = this.dashboardDataStore.data?.members ?? []
      this.pseudoId = this.dashboardDataStore.data?.pseudoId ?? ''
      this.dashboardDataStore.reInitNecessary = false
      // workaround to avoid calling both init() and reInit()
      setTimeout(() => {
        this.dashboardDataStore.reInitNecessary = true
      }, 1600)
      // https://stackoverflow.com/a/69196265
      // TODO: This will center the canvas on every resize. Improve if possible.
      new ResizeObserver(() => {
        this.diagram?.get('canvas')?.resized()
        this.$refs.knowledgeGraph?.centerCanvas()
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
        this.$refs.knowledgeGraph?.centerCanvas()
      }, 100)
    },
    updateCourseNode(courseNode) {
      this.dashboardDataStore.data.courseNode = courseNode
      this.courseNode = courseNode
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
      :members="members"
      :pseudoId="pseudoId"
      @loadedDiagram="changeDiagramLoaded"
      @setCurrentView="setCurrentView"
      @setDiagram="setDiagram"
      @updateCourseNode="updateCourseNode"
    />
    <ModuleSelection v-if="currentView === 'moduleSelection'" />
    <CollaborationMonitoring
      :backendUrl="backendUrl"
      :isExpanded="isExpanded"
      v-if="currentView === 'collaborationMonitoring'"
    />
    <LearningPathManager v-if="currentView === 'learningPathManager'" />
    <Settings v-if="currentView === 'settings'" />
  </div>
</template>

<style scoped>
#verdatas-dashboard {
  outline: none !important;
  border: 1px solid #ddd;
  border-radius: 3px;
  position: relative;
  height: 550px;
  width: 100%;
  margin-bottom: 10px;
}
</style>
