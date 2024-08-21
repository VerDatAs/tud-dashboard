<script setup lang="ts">
import { SidebarType, useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { SFullscreenMode } from '@/util/AssistanceType/injectionkeys'
import { useVueFlow } from '@vue-flow/core'
import { computed, inject, ref } from 'vue'
import EdgeView from './DetailViews/EdgeView.vue'
import NodeView from './DetailViews/NodeView.vue'
import TypeView from './DetailViews/TypeView.vue'

const isFullscreen = inject(SFullscreenMode, () => ref(false), true)

const { onNodeClick, onEdgeClick, onPaneClick, removeNodes, removeEdges } = useVueFlow()
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

const isNode = computed(() => sidebarStore.currentType === SidebarType.Node)
const isEdge = computed(() => sidebarStore.currentType === SidebarType.Edge)
const isAType = computed(() => sidebarStore.currentType === SidebarType.AssistanceType)
const currentObjectString = computed(() => (isNode.value ? 'Operation' : isEdge.value ? 'Verbindung' : ''))

function removeObject() {
  if (!confirm(`Möchten Sie diese ${currentObjectString.value} wirklich löschen?`)) return
  // Shouldnt ever happen
  if (!sidebarStore.currentId) return

  if (isNode.value) {
    removeNodes(sidebarStore.currentId)
  } else if (isEdge.value) {
    removeEdges(sidebarStore.currentId)
  }
}
</script>

<template>
  <aside class="details-sidebar sidebar" :class="{ fullscreen: isFullscreen }">
    <div class="toolbar" v-if="isNode || isEdge">
      <font-awesome-icon
        class="icon pointer"
        icon="trash"
        :title="`${currentObjectString} löschen`"
        @click="removeObject"
      ></font-awesome-icon>
    </div>
    <type-view class="sidebar-view" v-if="isAType"></type-view>
    <node-view class="sidebar-view" v-else-if="isNode"></node-view>
    <edge-view class="sidebar-view" v-else-if="isEdge"></edge-view>
  </aside>
</template>

<style scoped lang="scss">
.details-sidebar {
  width: 300px;
  &.fullscreen {
    width: 400px;
  }
  &.sidebar {
    gap: 0px;
  }
  .toolbar {
    margin-top: 20px;
    margin-right: 10px;
    display: flex;
    flex-direction: row-reverse;
    gap: 15px;
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
