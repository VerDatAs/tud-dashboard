<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { CModalManager, SSaveAndExitModal } from '@/util/AssistanceType/modalHelper'
import { inject, ref } from 'vue'
import { toast } from 'vue3-toastify'
import LoadingIndicator from '../Generics/LoadingIndicator.vue'
import VueModal from '../Generics/VueModal.vue'
const atStore = useAssistanceTypeStore()

const { hideModal } = inject(SSaveAndExitModal, () => new CModalManager(), true)
const loadingSave = ref<boolean>(false)

function cancelAction() {
  hideModal()
}
function backWithoutSaveAction() {
  atStore.unsetAssistanceType()
  hideModal()
}
function saveAndExitAction() {
  loadingSave.value = true

  atStore
    .saveAssistanceType()
    .then((res) => {
      toast.success(res)
      hideModal()
      atStore.unsetAssistanceType()
    })
    .catch((err) => {
      toast.error(err)
    })
    .finally(() => {
      loadingSave.value = false
    })
}
</script>

<template>
  <vue-modal title="Zurück zur Assistenztyp-Auswahl" :symbol="SSaveAndExitModal" class="saveAndExitModal">
    <div class="modal-layout" v-if="!loadingSave">
      <div>
        <p>Möchten Sie den Assistenztypen speichern, bevor Sie zur Assistenztyp-Auswahl zurückkehren?</p>
      </div>
      <div class="actions">
        <button class="btn" @click="cancelAction">Abbrechen</button>
        <button class="btn" @click="backWithoutSaveAction">Zurück ohne Speichern</button>
        <button class="btn btn-primary" @click="saveAndExitAction">Speichern und zurück</button>
      </div>
    </div>
    <div class="loading-container" v-else>
      <loading-indicator size="4em" backgroundColor="#ddd" />
      <p>Speichern...</p>
    </div>
  </vue-modal>
</template>

<style lang="scss">
.saveAndExitModal {
  --modal-height: 40%;
  background-color: red;
}
</style>

<style scoped lang="scss">
.modal-layout {
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
.loading-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
</style>
