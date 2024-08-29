<script setup lang="ts">
import { useOperationStore } from '@/stores/AssistanceTypes/operations'
import { useViewportStore } from '@/stores/AssistanceTypes/viewport'
import type { TOperation } from '@/types/AssistanceType/operation'
import { SAddOperationModal } from '@/util/AssistanceType/modalHelper'
import {
  centerNodeToPointOnCreation,
  createOperationNode,
  createOperationNodeId
} from '@/util/AssistanceType/nodeCreationHandler'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { useVueFlow } from '@vue-flow/core'
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import OperationRow from '../Generics/OperationRow.vue'
import VueModal from '../Generics/VueModal.vue'
const operationStore = useOperationStore()
const { screenToFlowCoordinate } = useVueFlow(CVueFlowStoreId)
const vpStore = useViewportStore()

const searchTerm = ref('')

onMounted(() => {
  operationStore.requestOperations()
})

function addOperation(operation: TOperation) {
  const nodeId = createOperationNodeId(operation.id)
  centerNodeToPointOnCreation(nodeId)
  // const { x, y, zoom } = getViewport()
  // const position = { x: -x / zoom, y: -y / zoom }
  const position = screenToFlowCoordinate(vpStore.getCenterPoint())
  createOperationNode(nodeId, operation.id, position)
  toast.success(`Operation "${operation.name}" hinzugefügt.`)
}
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
  overflow: scroll;
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
