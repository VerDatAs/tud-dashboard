<script setup lang="ts">
import { ESidebarType, useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow, type EdgeProps } from '@vue-flow/core'
import { computed, watch } from 'vue'
const props = withDefaults(
  defineProps<{
    edgeProps: EdgeProps
    showClock?: boolean
  }>(),
  {
    showClock: false
  }
)
const path = computed(() => getBezierPath(props.edgeProps))
const { findEdge } = useVueFlow(CVueFlowStoreId)
const sidebarStore = useSidebarStore()

const edgeSelected = computed(
  () => props.edgeProps.id === sidebarStore.currentId && sidebarStore.currentType === ESidebarType.Edge
)

const mainColor = computed(() =>
  props.edgeProps.type === 'control'
    ? 'var(--vf-operation-color-handle)'
    : props.edgeProps.type === 'data'
    ? 'var(--vf-io-coor-handle)'
    : '#000'
)

function onClickLabel() {
  sidebarStore.setEdge(props.edgeProps.id)
}

watch(
  () => edgeSelected.value,
  (newVal) => {
    const edge = findEdge(props.edgeProps.id)
    if (edge) {
      edge.animated = newVal
    }
  }
)
</script>

<template>
  <BaseEdge
    ref="baseEdgeRef"
    v-bind="props"
    :path="path[0]"
    :class="{ 'my-custom-currently-selected': edgeSelected }"
  />

  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        color: mainColor,
        borderColor: mainColor
      }"
      class="nodrag nopan edge-label"
      v-if="props.edgeProps.label"
      :title="`Verzögerung von ${props.edgeProps.data.label}`"
      @click="onClickLabel"
    >
      <font-awesome-icon class="icon" icon="clock" v-if="props.showClock"></font-awesome-icon>
      {{ props.edgeProps.label }}
    </div>
  </EdgeLabelRenderer>
</template>

<style scoped lang="scss">
.edge-label {
  font-size: 0.7em;
  background-color: #fff;
  padding: 5px 8px;
  border-radius: 5px;
  border-width: 1px;
  border-style: solid;
  z-index: 1000;
}
</style>
