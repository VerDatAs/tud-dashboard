<script setup lang="ts">
import { SidebarType, useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { SFullscreenMode } from '@/util/AssistanceType/injectionkeys'
import { useVueFlow } from '@vue-flow/core'
import { inject, ref } from 'vue'
import EdgeView from './DetailViews/EdgeView.vue'
import NodeView from './DetailViews/NodeView.vue'
import TypeView from './DetailViews/TypeView.vue'

const isFullscreen = inject(SFullscreenMode, () => ref(false), true)

const { onNodeClick, onEdgeClick, onPaneClick } = useVueFlow()
const sidebarStore = useSidebarStore()

onNodeClick((e) => {
  if (e.node?.data?.operation) {
    sidebarStore.setNode(e.node.id)
  }
})
onEdgeClick((e) => {
  if (e.edge) {
    sidebarStore.setEdge(e.edge.id)
  }
})
onPaneClick(() => {
  sidebarStore.setAssistanceType()
})
</script>

<template>
  <aside class="details-sidebar sidebar" :class="{ fullscreen: isFullscreen }">
    <type-view class="sidebar-view" v-if="sidebarStore.currentType === SidebarType.AssistanceType"></type-view>
    <node-view class="sidebar-view" v-else-if="sidebarStore.currentType === SidebarType.Node"></node-view>
    <edge-view class="sidebar-view" v-else-if="sidebarStore.currentType === SidebarType.Edge"></edge-view>
  </aside>
</template>

<style scoped lang="scss">
.details-sidebar {
  width: 300px;
  &.fullscreen {
    width: 400px;
  }
}
:deep(.sidebar-view) {
  .subheading {
    font-size: 0.8em;
  }

  .underheading {
    font-size: 1em;
    font-weight: bold;
  }
}
</style>
