<script setup lang="ts">
import { useOperationStore } from '@/stores/AssistanceTypes/operations'
import { useViewportStore } from '@/stores/AssistanceTypes/viewport'
import type { TOperation } from '@/types/AssistanceType/operation'
import { SAddOperationModal } from '@/util/AssistanceType/modalHelper'
import { createOperationNode, createOperationNodeId } from '@/util/AssistanceType/nodeCreationHandler'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { type Dimensions, useVueFlow } from '@vue-flow/core'
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import OperationRow from '../Generics/OperationRow.vue'
import VueModal from '../Generics/VueModal.vue'
const operationStore = useOperationStore()
const { screenToFlowCoordinate, onNodesChange } = useVueFlow(CVueFlowStoreId)
const vpStore = useViewportStore()

const searchTerm = ref('')

onMounted(() => {
  operationStore.requestOperations()
})

const addedNodesWithDimensions = ref<{ id: string; dimensions: Dimensions }[]>([])

async function addOperation(operation: TOperation) {
  const nodeId = createOperationNodeId(operation.id)
  // centerNodeToPointOnCreation(nodeId) // Centers the node in the middle, else the top left of the node is in the center
  // let position = screenToFlowCoordinate(vpStore.getCenterPoint())
  let position = screenToFlowCoordinate(vpStore.getPoint(3, 3))
  position.y += addedNodesWithDimensions.value.reduce((acc, cur) => acc + cur.dimensions.height + 20, 0)
  createOperationNode(nodeId, operation.id, position)
  addedNodesWithDimensions.value.push({ id: nodeId, dimensions: { height: 0, width: 0 } })
  toast.success(`Operation "${operation.name}" hinzugefügt.`)
}

onNodesChange((changes) => {
  for (const change of changes) {
    if (change.type === 'dimensions') {
      const node = addedNodesWithDimensions.value.find((n) => n.id === change.id)
      if (node && change.dimensions) {
        node.dimensions = change.dimensions
      }
    }
  }
})
</script>

<template>
  <vue-modal title="Operationen hinzufügen" :symbol="SAddOperationModal">
    <div class="modal-layout">
      <div class="search">
        <p>Suche</p>
        <input
          type="search"
          name="search-operation"
          id="search-operation"
          placeholder="Suche nach Operationen"
          v-model="searchTerm"
          @input="operationStore.setSearchTerm(searchTerm)"
        />
      </div>
      <div class="my-main">
        <operation-row
          class="operation"
          v-for="operation of operationStore.searchedOperations"
          :key="operation.id"
          :operation="operation"
          @add-operation="addOperation"
        />
      </div>
    </div>
  </vue-modal>
</template>

<style scoped lang="scss">
.modal-layout {
  height: calc(100% - 10px);
  display: grid;
  grid-template-columns: fit-content(100%) 1fr;
  gap: 5px;
}
.my-main {
  overflow: auto;
  height: calc(100%);
  display: flex;
  flex-direction: column;
}
.search {
  p {
    text-align: center;
  }
  input {
    font-size: 0.8em;
    margin: 2px;
    box-sizing: border-box;
    width: calc(100% - 4px);
    border: 1px solid #000;
  }
}

.operation {
  padding: 5px 5px;

  &:nth-child(2n + 1) {
    background-color: #ddd;
  }
}
</style>
