<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script>
import CollaborationMonitoring from '@/components/CollaborationMonitoring.vue'
import KnowledgeGraph from '@/components/KnowledgeGraph/KnowledgeGraph.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import NavigationView from '@/components/NavigationView.vue'
import PreviewContainer from '@/components/PreviewContainer.vue'
import QueryView from '@/components/Query/QueryView.vue'
import Settings from '@/components/SettingsView.vue'
import { useDashboardDataStore } from '@/stores/dashboardData'
import { ref } from 'vue'

export default {
  name: 'VerDatAsDashboard',
  components: {
    CollaborationMonitoring,
    KnowledgeGraph,
    LoadingScreen,
    NavigationView,
    PreviewContainer,
    QueryView,
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
    /**
     * Initialize the dashboard app by defining the values of the variables depending on the dashboard data provided,
     * handle potential reinitialization and define an observer for centering the canvas.
     */
    initDashboardApp() {
      this.courseNode = this.dashboardDataStore.data?.courseNode ?? {}
      this.token = this.dashboardDataStore.data?.token ?? ''
      this.backendUrl = this.dashboardDataStore.data?.backendUrl ?? ''
      this.path = this.dashboardDataStore.data?.path ?? ''
      this.canViewOnly = this.dashboardDataStore.data?.canViewOnly ?? true
      this.previewMode = this.dashboardDataStore.data?.previewMode ?? false
      // In preview mode, show the expanded menu
      if (this.previewMode) {
        this.isExpanded = true
      }
      this.members = this.dashboardDataStore.data?.members ?? []
      this.pseudoId = this.dashboardDataStore.data?.pseudoId ?? ''
      this.dashboardDataStore.reInitNecessary = false
      // Workaround to avoid calling both init() and reInit()
      setTimeout(() => {
        this.dashboardDataStore.reInitNecessary = true
      }, 1600)
      // Add a resize observer to center the canvas
      new ResizeObserver(() => {
        this.diagram?.get('canvas')?.resized()
        this.$refs.knowledgeGraph?.centerCanvas()
      }).observe(document.getElementById('dashboardApp'))
    },
    /**
     * Change the loading state of the diagram.
     *
     * @param diagramLoaded
     */
    changeDiagramLoaded(diagramLoaded) {
      this.diagramLoaded = diagramLoaded
    },
    /**
     * Set a provided view name as the current view.
     *
     * @param viewName
     */
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.currentView = viewName
      }
    },
    /**
     * Update the diagram value.
     *
     * @param diagram
     */
    setDiagram(diagram) {
      this.diagram = diagram
    },
    /**
     * Change the expansion state of the menu into a given value.
     *
     * @param value
     */
    toggleNavigationExpanded(value) {
      this.isExpanded = value
      localStorage.setItem('is_expanded', this.isExpanded + '')
    }
  }
}
</script>

<template>
  <div id="verdatas-dashboard">
    <PreviewContainer v-if="previewMode" />
    <LoadingScreen :diagramLoaded="diagramLoaded" :path="path" v-if="!previewMode" />
    <NavigationView
      v-if="!canViewOnly"
      :currentView="currentView"
      :isExpanded="isExpanded"
      @setCurrentView="setCurrentView"
      @toggleNavigationExpanded="toggleNavigationExpanded"
    />
    <KnowledgeGraph
      ref="knowledgeGraph"
      v-show="currentView === 'knowledgeStructure'"
      :backendUrl="backendUrl"
      :canViewOnly="canViewOnly"
      :courseNode="courseNode"
      :currentView="currentView"
      :diagram="diagram"
      :diagramLoaded="diagramLoaded"
      :isExpanded="isExpanded"
      :members="members"
      :pseudoId="pseudoId"
      :token="token"
      @loadedDiagram="changeDiagramLoaded"
      @setCurrentView="setCurrentView"
      @setDiagram="setDiagram"
    />
    <CollaborationMonitoring
      :backendUrl="backendUrl"
      :isExpanded="isExpanded"
      v-if="currentView === 'collaborationMonitoring'"
    />
    <QueryView :backendUrl="backendUrl" :isExpanded="isExpanded" :token="token" v-if="currentView === 'query'" />
    <Settings :isExpanded="isExpanded" v-if="currentView === 'settings'" />
    <DialogsWrapper />
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
