<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import type { TAssistanceType } from '@/types/AssistanceType/serialization'
import axios from 'axios'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import LoadingIndicator from './Generics/LoadingIndicator.vue'
const atStore = useAssistanceTypeStore()

const assistanceTypes = ref<TAssistanceType[]>([])
const loadingAssistanceTypes = ref<boolean>(true)
const loadingEditor = ref<boolean>(false)
const searchTerm = ref<string>('')

const searchedAssistanceTypes = computed(() => {
  const search = searchTerm.value.toLowerCase().trim()
  return assistanceTypes.value.filter((operation) => {
    return (
      operation.name.toLowerCase().includes(search) ||
      operation.description.toLowerCase().includes(search) ||
      operation.id.toLowerCase().includes(search)
    )
  })
})

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
  loadingEditor.value = true
  atStore.loadAssistanceType(id).finally(() => {
    loadingEditor.value = false
  })
}

function newAssistanceType() {
  loadingEditor.value = true
  atStore.initEmptyAssistanceType()
  loadingEditor.value = false
}

loadAssistanceTypes().then(() => {
  loadingAssistanceTypes.value = false
})
</script>

<template>
  <div class="container">
    <h1><b>Assistenztyp - Auswahl</b></h1>
    <p>
      Erstellen Sie einen neuen Assistenztyp, oder wählen Sie einen vorhandenen Assistenztyp aus, um den Editor zu
      öffnen.
    </p>
    <div class="divider"></div>
    <div>
      <button class="btn btn-primary">
        <font-awesome-icon class="icon" icon="plus" />
        <p @click.prevent="newAssistanceType()">Neuer Assistenztyp</p>
      </button>
    </div>
    <div class="divider"></div>
    <div v-if="loadingAssistanceTypes || loadingEditor" class="loading-indicator">
      <loading-indicator size="5em" />
      <p v-if="loadingAssistanceTypes">Assistenztypen werden geladen.</p>
      <p v-if="loadingEditor">Editor wird geladen.</p>
    </div>
    <div class="list-types" v-else>
      <div v-if="assistanceTypes?.length === 0">
        <p>Keine Assistenztypen vorhanden.</p>
      </div>
      <div v-else class="search-container">
        <font-awesome-icon icon="search" title="Suche nach Assistenztypen" />
        <input type="text" placeholder="Suche nach Assistenztypen..." v-model="searchTerm" />
      </div>
      <div class="at-container" v-for="at of searchedAssistanceTypes" :key="at.id" @click="loadAT(at.id)">
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

.search-container {
  width: fit-content;
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  padding: 5px 10px;
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
