<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype';
import { ref } from 'vue';
import LoadingIndicator from './Generics/LoadingIndicator.vue';
const atStore = useAssistanceTypeStore()

const loadingEditor = ref<boolean>(false)

function loadAssistanceTypes() {
  atStore.requestAssistanceTypes()
}

function loadAT(id: string) {
  loadingEditor.value = true
  atStore.loadAssistanceType(id).finally(() => {
    loadingEditor.value = false
  })
}

function deleteAT(id: string, name: string) {
  if (confirm(`Möchten Sie den Assistenztyp "${name}" wirklich löschen?`)) {
    atStore.deleteAssistanceType(id)
  }
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
      <div class="at-container" v-for="at of atStore.searchedAssistanceTypes" :key="at.id">
        <div class="at-texts">
          <p class="at-name" @click="loadAT(at.id)">
            {{ at.name }}
          </p>
          <p class="at-id" @click="loadAT(at.id)">ID: {{ at.id }}</p>
          <p class="at-description" @click="loadAT(at.id)">{{ at.description }}</p>
        </div>
        <div class="at-actions">
          <font-awesome-icon class="icon" icon="trash" @click.stop="deleteAT(at.id, at.name)"></font-awesome-icon>
        </div>
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
