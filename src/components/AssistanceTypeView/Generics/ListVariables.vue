<script setup lang="ts">
import VariableRow from '@/components/AssistanceTypeView/Generics/VariableRow.vue'
import type { TInput, TOutput } from '@/types/AssistanceType/operation'

defineProps<{
  variableArray: Array<TInput | TOutput>
  type: 'input' | 'output'
}>()
</script>

<template>
  <div>
    <div v-for="v of variableArray" :key="v.name" :value="v.name">
      <variable-row :variable="v" :type="type"></variable-row>
    </div>
  </div>
</template>
