<script setup lang="ts">
import type { TInput, TOutput } from '@/types/AssistanceType/operation'
import { createVariableNodeID } from '@/util/AssistanceType/AssistanceTypeHelper'
import { createVariableNode } from '@/util/AssistanceType/createVariableNodes'
import { SCurrentSelectedObject } from '@/util/AssistanceType/injectionkeys'
import { useVueFlow } from '@vue-flow/core'
import { computed, inject, type Ref, ref } from 'vue'

const props = defineProps<{
  variable: TInput | TOutput
  type: 'input' | 'output'
}>()

const showDescription = ref<boolean>(false)

const { currentOperationNodeID } = inject<{ currentOperationNodeID: Ref<undefined | string> }>(
  SCurrentSelectedObject,
  () => ({ currentOperationNodeID: ref(undefined) }),
  true
)
const { addNodes, findNode, removeNodes } = useVueFlow()

function addVariable() {
  if (currentOperationNodeID.value)
    createVariableNode(currentOperationNodeID.value, props.variable, props.type, addNodes)
}

function removeVariable() {
  if (currentOperationNodeID.value && variableAlreadyExists.value)
    removeNodes(createVariableNodeID(currentOperationNodeID.value, props.type, props.variable.name))
}

const variableAlreadyExists = computed(() =>
  currentOperationNodeID.value != undefined
    ? findNode(createVariableNodeID(currentOperationNodeID.value, props.type, props.variable.name)) != undefined
    : false
)
</script>

<template>
  <div class="variable-row">
    <div class="permanent-row">
      <div class="text" @click="showDescription = !showDescription">
        <font-awesome-icon
          class="icon"
          :class="{ rotated: showDescription }"
          icon="chevron-right"
          size="sm"
          v-if="variable.description"
        />
        <div>
          <i>{{ variable.type }}:</i> {{ variable.name }}
        </div>
      </div>
      <div class="addIcon">
        <font-awesome-icon
          v-if="variableAlreadyExists"
          class="icon pointer"
          icon="minus"
          size="sm"
          @click="removeVariable()"
        />
        <font-awesome-icon v-else class="icon pointer" icon="plus" size="sm" @click="addVariable()" />
      </div>
    </div>
    <div class="description" v-if="variable.description && showDescription">
      <i>{{ variable.description }}</i>
    </div>
  </div>
</template>

<style scoped lang="scss">
.variable-row {
  border: 1px solid #000;
  border-radius: 5px;
  margin-bottom: 2px;
  padding-inline: 3px 10px;

  & > .permanent-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .text {
    display: flex;
    align-items: baseline;
    gap: 5px;
    padding: 5px;
    cursor: pointer;
  }

  & > .description {
    padding: 0 5px 5px 20px;
    line-height: 1.1em;
  }
}
</style>
