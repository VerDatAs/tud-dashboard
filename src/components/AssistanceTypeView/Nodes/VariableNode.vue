<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { variableTypeToString } from '@/types/AssistanceType/variableTypes'
import { type NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
const atStore = useAssistanceTypeStore()
</script>

<template>
  <div class="node-content">
    <p>
      <i v-if="atStore.showVariableTypesOnNodes">{{ variableTypeToString(props.data.variable.type) }}: </i
      >{{ props.data.label }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.node-content {
  font-size: 0.7em;
}
</style>
