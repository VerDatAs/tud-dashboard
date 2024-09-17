<script setup lang="ts">
import type { EdgeProps } from '@vue-flow/core'
import MyDefaultEdge from './MyDefaultEdge.vue'
const props = defineProps<EdgeProps>()
</script>

<template>
  <MyDefaultEdge :edgeProps="props" />
</template>
