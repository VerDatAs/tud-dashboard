<script setup lang="ts">
import { Handle, type NodeProps, Position } from '@vue-flow/core';
import VariableNode from './VariableNode.vue';

const props = defineProps<NodeProps>()
</script>

<template>
  <div>
    <Handle type="source" class="data" :position="Position.Bottom"></Handle>
    <variable-node v-bind="props" />
  </div>
</template>
