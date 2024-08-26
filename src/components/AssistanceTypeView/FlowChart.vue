<script setup lang="ts">
import { ESidebarType, useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { useVueFlowStore } from '@/stores/AssistanceTypes/vueflow'
import type { TDnD } from '@/types/AssistanceType/dnd'
import useEdgeCreationHandler from '@/util/AssistanceType/edgeCreationHandler'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import { createStartNode } from '@/util/AssistanceType/nodeCreationHandler'
import useNodeSizeHandler from '@/util/AssistanceType/nodeSizeHandler'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { inject, onMounted } from 'vue'
import DropzoneBackground from './DropzoneBackground.vue'
import ControlEdge from './Edges/ControlEdge.vue'
import DataEdge from './Edges/DataEdge.vue'
import AtInputNode from './Nodes/ATInputNode.vue'
import DataInputNode from './Nodes/DataInputNode.vue'
import DataOutputNode from './Nodes/DataOutputNode.vue'
import OperationNode from './Nodes/OperationNode.vue'
import StartNode from './Nodes/StartNode.vue'

/*
 *    Drag And Drop
 */
const { onDragOver, onDragLeave, onDrop, isDragOver } = inject<TDnD>(SDnDKey, () => useDragAndDrop(), true)

/*
 *    Node Size Handler
 */
useNodeSizeHandler()

/*
 *    Vue Flow
 */
const flowStore = useVueFlowStore()
useEdgeCreationHandler()
const { onNodesChange, onEdgesChange } = useVueFlow(CVueFlowStoreId)
const sidebarStore = useSidebarStore()

/* Set Sidebar to Assistance Type when currently selected node gets removed */
onNodesChange((nodes) => {
  for (const node of nodes) {
    if (
      node.type === 'remove' &&
      sidebarStore.currentType === ESidebarType.Node &&
      sidebarStore.currentId === node.id
    ) {
      sidebarStore.setAssistanceType()
    }
  }
})

/* Set Sidebar to Assistance Type when currently selected edge gets removed */
onEdgesChange((edges) => {
  for (const edge of edges) {
    if (
      edge.type === 'remove' &&
      sidebarStore.currentType === ESidebarType.Edge &&
      sidebarStore.currentId === edge.id
    ) {
      sidebarStore.setAssistanceType()
    }
  }
})

onMounted(() => {
  createStartNode()
})
</script>

<template>
  <vue-flow
    v-model:nodes="flowStore.nodes"
    v-model:edges="flowStore.edges"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    elevate-edges-on-select
    :connectionRadius="15"
    :min-zoom="0.1"
    fit-view-on-init
  >
    <dropzone-background
      :style="{
        backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
        transition: 'background-color 0.2s ease'
      }"
    >
      <p v-if="isDragOver">Drop here</p>
    </dropzone-background>
    <template #node-operation="nodeProps">
      <operation-node v-bind="nodeProps"></operation-node>
    </template>
    <template #node-datainput="nodeProps">
      <data-input-node v-bind="nodeProps"></data-input-node>
    </template>
    <template #node-dataoutput="nodeProps">
      <data-output-node v-bind="nodeProps"></data-output-node>
    </template>
    <template #node-at-input="nodeProps">
      <at-input-node v-bind="nodeProps"></at-input-node>
    </template>
    <template #node-start="nodeProps">
      <start-node v-bind="nodeProps"></start-node>
    </template>
    <template #edge-control="edgeProps">
      <control-edge v-bind="edgeProps"></control-edge>
    </template>
    <template #edge-data="edgeProps">
      <data-edge v-bind="edgeProps"></data-edge>
    </template>
  </vue-flow>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import my vue flow theme */
@import '@/assets/vue-flow-theme.scss';

/* Allow resizing */
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css';

/* import the default theme, this is optional but generally recommended */
/* @import '@vue-flow/core/dist/theme-default.css'; */
</style>
