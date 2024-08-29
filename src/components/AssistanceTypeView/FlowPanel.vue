<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { CModalManager, SAddOperationModal } from '@/util/AssistanceType/modalHelper'
import { Panel } from '@vue-flow/core'
import { provide } from 'vue'
import AddOperationModal from './Modals/AddOperationModal.vue'
const atStore = useAssistanceTypeStore()

const modalManager = new CModalManager()
provide(SAddOperationModal, modalManager)
</script>

<template>
  <add-operation-modal v-if="modalManager.getShowModal" />
  <Panel class="action-panel" position="bottom-center">
    <div>
      <font-awesome-icon
        class="icon pointer"
        icon="plus"
        size="lg"
        title="Operation hinzufügen"
        @click="modalManager.showModal()"
      ></font-awesome-icon>
    </div>
    <div>
      <font-awesome-icon
        v-if="atStore.showVariableTypesOnNodes"
        class="icon pointer"
        icon="eye-slash"
        size="lg"
        title="Variablentypen verstecken"
        @click="atStore.showVariableTypesOnNodes = false"
      />
      <font-awesome-icon
        v-else
        class="icon pointer"
        icon="eye"
        size="lg"
        title="Variablentypen anzeigen"
        @click="atStore.showVariableTypesOnNodes = true"
      />
    </div>
    <div>
      <font-awesome-icon
        class="icon pointer"
        icon="save"
        size="lg"
        title="Speichern"
        @click="atStore.saveAssistanceType()"
      />
    </div>
  </Panel>
</template>

<style scoped lang="scss">
.action-panel {
  padding: 8px 15px;
  background-color: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}
</style>
