<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import type { TAssistanceType } from '@/types/AssistanceType/serialization'
import axios from 'axios'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import LoadingIndicator from './Generics/LoadingIndicator.vue'
const atStore = useAssistanceTypeStore()

const emit = defineEmits<{
  (e: 'assistanceTypeSelected', id: string): void
  (e: 'newAssistanceType'): void
}>()

const assistanceTypes = ref<TAssistanceType[]>()
const loadingAssistanceTypes = ref<boolean>(true)
const loadingAssistanceTypeAfterClick = ref<boolean>(false)

async function loadAssistanceTypes() {
  const res = await axios.get('/example-types.json')
  console.log(res)
  if (!res || res.status !== 200) {
    toast.error('Fehler beim Laden der Assistenztypen.')
    return Promise.reject('Error loading assistance types')
  }
  assistanceTypes.value = res.data
  return Promise.resolve(res.data)
}

function loadAT(id: string) {
  loadingAssistanceTypeAfterClick.value = true
  atStore.loadAssistanceType(id).finally(() => {
    loadingAssistanceTypeAfterClick.value = false
  })
}

loadAssistanceTypes().then(() => {
  loadingAssistanceTypes.value = false
})
</script>

<template>
  <div class="container">
    <h1>Assistenztypen</h1>
    <p>Wählen Sie einen Assistenztyp aus, oder erstellen Sie einen neuen Assistenztypen.</p>
    <div class="divider"></div>
    <div>
      <button class="btn btn-primary">
        <font-awesome-icon class="icon" icon="plus" />
        <p @click.prevent="emit('newAssistanceType')">Neuer Assistenztyp</p>
      </button>
    </div>
    <div class="divider"></div>
    <div v-if="loadingAssistanceTypes || loadingAssistanceTypeAfterClick" class="loading-indicator">
      <loading-indicator size="5em" />
      <p v-if="loadingAssistanceTypes">Assistenztypen werden geladen.</p>
      <p v-if="loadingAssistanceTypeAfterClick">Editor wird geladen.</p>
    </div>
    <div class="list-types" v-else>
      <div v-if="assistanceTypes?.length === 0">
        <p>Keine Assistenztypen vorhanden.</p>
      </div>
      <div class="at-container" v-for="at of assistanceTypes" :key="at.id" @click="loadAT(at.id)">
        <p class="at-name">
          {{ at.name }}
        </p>
        <p class="at-id">ID: {{ at.id }}</p>
        <p class="at-description">{{ at.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  background-color: var(--vf-flow-color-bg);
  margin-top: var(--offset);
  width: 100%;
  height: calc(100% - var(--offset));
}

.loading-indicator {
  width: 100%;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;

  p {
    font-size: 0.9em;
  }
}

.btn {
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;

  p {
    margin: 0;
    padding: 0;
  }
}

.list-types {
  display: flex;
  flex-direction: column;
  height: calc(100% - 140px);
  gap: 5px;
  overflow: auto;
}

.at-container {
  padding: 5px 15px;
  background-color: #fff;
  border-radius: 5px;
  cursor: pointer;

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
