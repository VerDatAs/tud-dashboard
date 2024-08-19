<script setup lang="ts">
import { SidebarType, useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { BaseEdge, getBezierPath, useVueFlow, type EdgeProps } from '@vue-flow/core'
import { computed, watch } from 'vue'
const props = defineProps<EdgeProps>()
const path = computed(() => getBezierPath(props))
const { findEdge } = useVueFlow()
const sidebarStore = useSidebarStore()

const edgeSelected = computed(
  () => props.id === sidebarStore.currentId && sidebarStore.currentType === SidebarType.Edge
)

watch(
  () => edgeSelected.value,
  (newVal) => {
    const edge = findEdge(props.id)
    if (edge) {
      edge.animated = newVal
    }
  }
)
</script>

<template>
  <BaseEdge v-bind="props" :path="path[0]" :class="{ 'my-custom-currently-selected': edgeSelected }" />
</template>
