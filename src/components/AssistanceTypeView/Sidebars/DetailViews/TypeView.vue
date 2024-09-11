<script setup lang="ts">
import { EAssistanceTypeTrigger, useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import type { TDnD } from '@/types/AssistanceType/dnd'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { inject, ref } from 'vue'
import VariableRow from '../../Generics/VariableRow.vue'
import TypeAddInputView from './TypeAddInputView.vue'

const atStore = useAssistanceTypeStore()
const createVariableView = ref(false)
const currentName = ref<string | null>(null)
const { onDragStart } = inject<TDnD>(SDnDKey, () => useDragAndDrop(), true)

function removeVariable(name: string) {
  if (!confirm('Möchten Sie den Eingang "' + name + '" wirklich löschen?')) return
  atStore.removeInputVariable(name)
}

function backAction() {
  currentName.value = null
  createVariableView.value = false
}

function editVariable(name: string) {
  currentName.value = name
  createVariableView.value = true
}
</script>

<template>
  <div class="sidebar-type-view" v-if="createVariableView === false">
    <div>
      <div class="heading">
        <p>Assistenztyp</p>
      </div>
      <div class="subheading">
        <p>ID: {{ atStore.id }}</p>
      </div>
    </div>
    <div>
      <p class="underheading">Daten</p>
      <div class="duoGrid">
        <p>Name:</p>
        <input type="text" v-model="atStore.name" />
        <p>Beschreibung:</p>
        <textarea v-model="atStore.description"></textarea>
        <p>Auslöser:</p>
        <select name="trigger" v-model="atStore.trigger">
          <option :value="EAssistanceTypeTrigger.REACTIVE">Reaktiv</option>
          <option :value="EAssistanceTypeTrigger.PROACTIVE">Proaktiv</option>
        </select>
        <font-awesome-icon class="icon info-icon" icon="circle-info"></font-awesome-icon>
        <p class="info-text" v-if="EAssistanceTypeTrigger.REACTIVE">
          <b>Reaktiv</b> bedeutet, dass der Assistenztyp auf eine bestimmte Aktion eines Nutzers reagiert.
        </p>
        <p class="info-text" v-else-if="EAssistanceTypeTrigger.PROACTIVE">
          <b>Proaktiv</b> bedeutet, dass der Assistenztyp aktiv durch eine Anfrage ausgeführt werden muss.
        </p>
      </div>
    </div>
    <div>
      <p class="underheading">Eingänge</p>
      <a @click="createVariableView = true">+ Eingang hinzufügen</a>
      <div class="variable-list" v-if="atStore.inputs.length > 0">
        <div
          v-for="input of atStore.inputs"
          :key="input.name"
          :draggable="true"
          @dragstart="onDragStart($event, input)"
        >
          <variable-row
            :variable="input"
            type="input"
            :show-add-remove-icon="false"
            show-delete-icon
            show-edit-icon
            drag-and-drop
            @delete-variable="removeVariable(input.name)"
            @edit-variable="editVariable(input.name)"
          ></variable-row>
        </div>
      </div>
      <div class="no-vars" v-else>
        <p>Keine Eingänge vorhanden.</p>
      </div>
    </div>
  </div>
  <type-add-input-view v-else @backAction="backAction" :current-name="currentName"></type-add-input-view>
</template>

<style scoped lang="scss">
.sidebar-type-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.duoGrid {
  gap: 5px 5px;
}
textarea {
  resize: vertical;
}
.variable-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.no-vars {
  margin-top: 10px;
}
.info-icon {
  justify-self: flex-end;
  align-self: baseline;
  font-size: 1em;
}
.info-text {
  font-size: .8em;
}
</style>
