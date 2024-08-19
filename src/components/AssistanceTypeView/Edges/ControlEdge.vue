<script setup lang="ts">
import { BaseEdge, getBezierPath, type EdgeProps } from '@vue-flow/core'
import { computed } from 'vue'
const props = defineProps<EdgeProps>()
const path = computed(() => getBezierPath(props))
</script>

<template>
  <BaseEdge v-bind="props" :path="path[0]" />
</template>
