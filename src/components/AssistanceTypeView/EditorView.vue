<script setup lang="ts">
import { CModalManager, SSaveAndExitModal } from '@/util/AssistanceType/modalHelper'
import { provide } from 'vue'
import EditorMainView from './EditorMainView.vue'
import ToggleFullscreenIcon from './Generics/ToggleFullscreenIcon.vue'
import SaveAndExitModal from './Modals/SaveAndExitModal.vue'
const emit = defineEmits<{
  (e: 'backAction'): void
}>()

/*
 *   Save and Exit Modal
 */
const saveAndExitModalManager = new CModalManager()
provide(SSaveAndExitModal, saveAndExitModalManager)

function backAction() {
  saveAndExitModalManager.showModal()
  emit('backAction')
}
</script>

<template>
  <div id="assistanceTypes">
    <save-and-exit-modal v-if="saveAndExitModalManager.getShowModal" />
    <div class="headline">
      <div class="title">
        <font-awesome-icon
          class="icon pointer"
          icon="arrow-left"
          size="lg"
          @click="backAction"
          title="Zurück zur Assistenztyp-Auswahl"
        />
        <h1>Editor für Assistenztypen</h1>
      </div>
      <div class="actions">
        <toggle-fullscreen-icon />
      </div>
    </div>
    <div class="divider"></div>
    <editor-main-view class="main-view"></editor-main-view>
  </div>
</template>

<style scoped lang="scss">
#assistanceTypes {
  height: 100%;
  width: 100%;

  .headline {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 3em;

    .title,
    .actions {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 20px;
    }
  }

  .main-view {
    height: calc(100% - 3em);
  }
  .divider {
    margin: 0;
  }
}
</style>
