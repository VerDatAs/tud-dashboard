<script setup lang="ts">
import { useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import type { TAssistanceTypeInput, TInput, TOutput } from '@/types/AssistanceType/operation'
import { variableTypeToString } from '@/types/AssistanceType/variableTypes'
import { createVariableNodeID } from '@/util/AssistanceType/AssistanceTypeHelper'
import { createVariableNode } from '@/util/AssistanceType/nodeCreationHandler'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { useVueFlow } from '@vue-flow/core'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    variable: TInput | TOutput | TAssistanceTypeInput
    type: 'input' | 'output'
    showAddRemoveIcon?: boolean
    showDeleteIcon?: boolean
    showEditIcon?: boolean
  }>(),
  {
    showAddRemoveIcon: true,
    showDeleteIcon: false,
    showEditIcon: false
  }
)
const emit = defineEmits<{
  (e: 'deleteVariable'): void
  (e: 'editVariable'): void
}>()

const showDescription = ref<boolean>(false)

const sidebarStore = useSidebarStore()
const { findNode, removeNodes } = useVueFlow(CVueFlowStoreId)

function addVariable() {
  if (sidebarStore.currentId) createVariableNode(sidebarStore.currentId, props.variable, props.type)
}

function removeVariable() {
  if (sidebarStore.currentId && variableAlreadyExists.value)
    removeNodes(createVariableNodeID(sidebarStore.currentId, props.type, props.variable.name))
}

const variableAlreadyExists = computed(() =>
  sidebarStore.currentId != undefined
    ? findNode(createVariableNodeID(sidebarStore.currentId, props.type, props.variable.name)) != undefined
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
          <i>{{ variableTypeToString(variable.type) }}:</i> {{ variable.name }}
        </div>
      </div>
      <div class="icons">
        <div v-if="showAddRemoveIcon">
          <font-awesome-icon
            v-if="variableAlreadyExists"
            class="icon pointer"
            icon="minus"
            size="sm"
            @click="removeVariable()"
            title="Variable entfernen"
          />
          <font-awesome-icon
            v-else
            class="icon pointer"
            icon="plus"
            size="sm"
            @click="addVariable()"
            title="Variable hinzufügen"
          />
        </div>
        <div v-if="showEditIcon">
          <font-awesome-icon
            class="icon pointer"
            icon="pencil"
            size="sm"
            @click="emit('editVariable')"
            title="Bearbeiten"
          />
        </div>
        <div v-if="showDeleteIcon">
          <font-awesome-icon
            class="icon pointer"
            icon="trash"
            size="sm"
            @click="emit('deleteVariable')"
            title="Löschen"
          />
        </div>
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

  .icons {
    display: flex;
    gap: 5px;
  }
}
</style>
