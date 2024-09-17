<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { ref } from 'vue'
import AssistanceTypeContainer from './Generics/AssistanceTypeContainer.vue'
import LoadingIndicator from './Generics/LoadingIndicator.vue'
const atStore = useAssistanceTypeStore()

const loadingEditor = ref<boolean>(false)

function loadAssistanceTypes() {
  atStore.requestAssistanceTypes()
}

function newAssistanceType() {
  loadingEditor.value = true
  atStore.initEmptyAssistanceType()
  loadingEditor.value = false
}

loadAssistanceTypes()
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
    <div v-if="atStore.loadingAssistanceTypes || loadingEditor" class="loading-indicator">
      <loading-indicator size="5em" />
      <p v-if="atStore.loadingAssistanceTypes">Assistenztypen werden geladen.</p>
      <p v-if="loadingEditor">Editor wird geladen.</p>
    </div>
    <div class="list-types" v-else>
      <div v-if="atStore.assistanceTypes?.length === 0">
        <p>Keine Assistenztypen vorhanden.</p>
      </div>
      <div v-else class="search-container">
        <font-awesome-icon icon="search" title="Suche nach Assistenztypen" />
        <input type="text" placeholder="Suche nach Assistenztypen..." v-model="atStore.atsSearchTerm" />
      </div>
      <assistance-type-container
        v-for="at of atStore.searchedAssistanceTypes"
        :key="at.id"
        :assistance-type="at"
        @loadingAT="loadingEditor = $event"
      />
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
</style>
