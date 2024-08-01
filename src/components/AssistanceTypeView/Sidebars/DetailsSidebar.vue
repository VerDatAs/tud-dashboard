<script setup lang="ts">
import { useATEventStore } from '@/stores/AssistanceTypes/events'
import { type TOperation } from '@/types/AssistanceType/operation'
import { SCurrentSelectedObject, SFullscreenMode } from '@/util/AssistanceType/injectionkeys'
import { useVueFlow } from '@vue-flow/core'
import { inject, provide, ref } from 'vue'
import EdgeView from './DetailViews/EdgeView.vue'
import NodeView from './DetailViews/NodeView.vue'
import TypeView from './DetailViews/TypeView.vue'

const isFullscreen = inject(SFullscreenMode, () => ref(false), true)

const { onNodeDoubleClick, onEdgeDoubleClick } = useVueFlow()
const atEventStore = useATEventStore()

// 0 = Type
// 1 = Node
// 2 = Edge
const clickedType = ref<0 | 1 | 2>(0)
const currentOperation = ref<TOperation | undefined>(undefined)
const currentOperationNodeID = ref<string | undefined>(undefined)
const currentEdge = ref<TOperation | undefined>(undefined)
const currentEdgeId = ref<string | undefined>(undefined)

provide(SCurrentSelectedObject, { currentOperation, currentOperationNodeID, currentEdge, currentEdgeId })

onNodeDoubleClick((e) => {
  if (e.node?.data?.operation) {
    clickedType.value = 1
    currentOperation.value = e.node.data.operation
    currentOperationNodeID.value = e.node.id
  }
})
onEdgeDoubleClick((e) => {
  clickedType.value = 2
})
atEventStore.onClickSidebarShowAssistanceType(() => {
  clickedType.value = 0
})
</script>

<template>
  <aside class="details-sidebar sidebar" :class="{ fullscreen: isFullscreen }">
    <type-view class="sidebar-view" v-if="clickedType === 0"></type-view>
    <node-view
      class="sidebar-view"
      v-else-if="clickedType === 1 && currentOperation"
      :operation="currentOperation"
    ></node-view>
    <edge-view class="sidebar-view" v-else-if="clickedType === 2"></edge-view>
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
