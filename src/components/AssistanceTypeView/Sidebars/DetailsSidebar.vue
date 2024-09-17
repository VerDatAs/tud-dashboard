<script setup lang="ts">
import { ESidebarType, useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { CFullscreenHelper } from '@/util/AssistanceType/fullscreenHelper'
import { SFullscreenMode } from '@/util/AssistanceType/injectionkeys'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { getChildrenFromParentId } from '@/util/AssistanceType/vueFlowHelper'
import { type GraphNode, useVueFlow } from '@vue-flow/core'
import { computed, inject } from 'vue'
import AtInputView from './DetailViews/ATInputView.vue'
import EdgeView from './DetailViews/EdgeView.vue'
import NodeView from './DetailViews/NodeView.vue'
import TypeView from './DetailViews/TypeView.vue'

const { isFullscreen } = inject(SFullscreenMode, () => new CFullscreenHelper(), true)

const { onNodeClick, onEdgeClick, onPaneClick, removeNodes, removeEdges } = useVueFlow(CVueFlowStoreId)
const sidebarStore = useSidebarStore()

onNodeClick((e) => {
  if (e.node?.type === 'operation') {
    sidebarStore.setNode(e.node.id)
  } else if (e.node?.type === 'at-input') {
    sidebarStore.setATInput(e.node.id)
  }
  if (e.node?.type === 'datainput' || e.node?.type === 'dataoutput') {
    if (e.node?.parentNode) sidebarStore.setNode(e.node?.parentNode)
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

const isNode = computed(() => sidebarStore.currentType === ESidebarType.Node)
const isEdge = computed(() => sidebarStore.currentType === ESidebarType.Edge)
const isATInput = computed(() => sidebarStore.currentType === ESidebarType.ATInput)
const isAType = computed(() => sidebarStore.currentType === ESidebarType.AssistanceType)
const currentObjectString = computed(() =>
  isNode.value
    ? 'diese Operation'
    : isEdge.value
    ? 'diese Verbindung'
    : isATInput.value
    ? 'diesen Eingang'
    : 'dieses Element'
)

function removeObject() {
  if (!confirm(`Möchten Sie ${currentObjectString.value} wirklich löschen?`)) return
  // Shouldnt ever happen
  if (!sidebarStore.currentId) return

  if (isNode.value || isATInput.value) {
    const obj = sidebarStore.currentObject as GraphNode
    // Remove all children nodes (variables)
    if (obj.isParent) removeNodes(getChildrenFromParentId(obj.id))
    removeNodes(sidebarStore.currentId)
  } else if (isEdge.value) {
    removeEdges(sidebarStore.currentId)
  }
}
</script>

<template>
  <aside class="details-sidebar sidebar" :class="{ fullscreen: isFullscreen }">
    <div class="toolbar" v-if="isNode || isATInput || isEdge">
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
    <at-input-view class="sidebar-view" v-else-if="isATInput"></at-input-view>
  </aside>
</template>

<style scoped lang="scss">
.details-sidebar {
  // width: 300px;
  // overflow: auto;

  &.fullscreen {
    // width: 400px;
  }
  &.sidebar {
    gap: 0px;
  }
  .toolbar {
    font-size: 1em;
    margin-top: 20px;
    margin-right: 10px;
    display: flex;
    flex-direction: row-reverse;
    gap: 15px;
  }
}
:deep(.sidebar-view) {
  font-size: 0.9em;

  .heading {
    font-size: 1.2em;
  }

  .subheading {
    font-size: 0.9em;
  }

  .underheading {
    font-size: 1.1em;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 8px;
  }
}
</style>
