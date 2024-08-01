<script setup lang="ts">
import { type NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
</script>

<template>
  <div class="node-content">
    <p>{{ props.data.label }}</p>
  </div>
</template>

<style scoped lang="scss">
.node-content {
  font-size: 0.8em;
}
</style>
