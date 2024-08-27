<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { variableTypeToString } from '@/types/AssistanceType/variableTypes'
import { Handle, type NodeProps, Position } from '@vue-flow/core'

const props = defineProps<NodeProps>()
const atStore = useAssistanceTypeStore()
</script>

<template>
  <div>
    <Handle type="source" class="data" :position="Position.Bottom"></Handle>
    <div>
      <p>
        <i v-if="atStore.showVariableTypesOnNodes">{{ variableTypeToString(props.data.variable.type) }}: </i
        >{{ props.data.label }}
      </p>
    </div>
  </div>
</template>
