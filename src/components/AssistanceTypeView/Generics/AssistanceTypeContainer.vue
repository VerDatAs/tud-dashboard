<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import type { TAssistanceType } from '@/types/AssistanceType/serialization'
import { ref } from 'vue'
import LoadingIndicator from './LoadingIndicator.vue'
const atStore = useAssistanceTypeStore()

defineProps<{
  assistanceType: TAssistanceType
}>()
const emit = defineEmits<{
  (event: 'loadingAT', bool: boolean): void
}>()

const loadDuplicate = ref(false)

function loadAT(id: string) {
  emit('loadingAT', true)
  atStore.loadAssistanceType(id).finally(() => {
    emit('loadingAT', false)
  })
}

function deleteAT(id: string, name: string) {
  if (confirm(`Möchten Sie den Assistenztyp "${name}" wirklich löschen?`)) {
    atStore.deleteAssistanceType(id)
  }
}

function duplicateAT(id: string, name: string) {
  if (confirm(`Möchten Sie den Assistenztyp "${name}" wirklich duplizieren?`)) {
    loadDuplicate.value = true
    atStore.duplicateAssistanceType(id).finally(() => {
      loadDuplicate.value = false
    })
  }
}
</script>

<template>
  <div class="at-container">
    <div class="at-texts">
      <p class="at-name" @click="loadAT(assistanceType.id)">
        {{ assistanceType.name }}
      </p>
      <p class="at-id" @click="loadAT(assistanceType.id)">ID: {{ assistanceType.id }}</p>
      <p class="at-description" @click="loadAT(assistanceType.id)">{{ assistanceType.description }}</p>
    </div>
    <div class="at-actions">
      <loading-indicator v-if="loadDuplicate" size="1em" border-size="3px" background-color="#ddd" />
      <font-awesome-icon
        v-else
        class="icon"
        icon="copy"
        @click.stop="duplicateAT(assistanceType.id, assistanceType.name)"
        title="Assistenztyp duplizieren"
      ></font-awesome-icon>
      <font-awesome-icon
        class="icon"
        icon="trash"
        @click.stop="deleteAT(assistanceType.id, assistanceType.name)"
        title="Assistenztyp löschen"
      ></font-awesome-icon>
    </div>
  </div>
</template>

<style scoped lang="scss">
.at-container {
  padding: 5px 15px;
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .at-actions {
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;

    .icon {
      padding: 10px;
      cursor: pointer;
    }
  }

  .at-texts {
    & > * {
      width: fit-content;
      cursor: pointer;
    }
  }

  .at-name {
    font-weight: bold;
    margin-bottom: 0;
  }

  .at-id {
    margin-top: 0;
    font-size: 0.7em;
    opacity: 0.8;
  }

  .at-description {
    font-size: 0.8em;
  }
}
</style>
