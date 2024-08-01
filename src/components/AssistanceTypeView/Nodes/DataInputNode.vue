<script setup lang="ts">
import { Handle, type NodeProps, Position } from '@vue-flow/core';
import VariableNode from './VariableNode.vue';

const props = defineProps<NodeProps>()
</script>

<template>
  <div>
    <Handle type="target" :position="Position.Top"></Handle>
    <variable-node v-bind="props" />
  </div>
</template>
