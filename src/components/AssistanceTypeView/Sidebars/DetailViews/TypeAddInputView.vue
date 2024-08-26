<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { supportedVariableTypes, variableTypeToString } from '@/types/AssistanceType/variableTypes'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
const atStore = useAssistanceTypeStore()

const emit = defineEmits<{
  (e: 'backAction'): void
}>()

function backAction() {
  emit('backAction')
}

const name = ref('')
const description = ref('')
const type = ref(supportedVariableTypes[0])
const required = ref(true)

function addInput() {
  if (atStore.getInputVariable(name.value)) {
    toast.error('Ein Eingang mit diesem Namen existiert bereits.')
    return
  }
  if (!supportedVariableTypes.includes(type.value)) {
    toast.error('Der Typ ist nicht unterstützt.')
    return
  }
  atStore.createInputVariable(name.value, description.value, type.value, required.value)
  backAction()
  toast.success(`Eingang "${name.value}" hinzugefügt.`)
}
</script>

<template>
  <div class="create-variable-view">
    <div class="headingLine">
      <font-awesome-icon
        class="icon pointer backArrow"
        icon="arrow-left"
        @click="backAction"
        title="Zurück"
      ></font-awesome-icon>
      <div class="heading">
        <p>Eingang hinzufügen</p>
      </div>
    </div>
    <div>
      <div class="duoGrid">
        <p>Name:</p>
        <input type="text" v-model="name" />
        <p>Beschreibung:</p>
        <textarea v-model="description"></textarea>
        <p>Typ:</p>
        <select name="type" v-model="type">
          <option v-for="variable of supportedVariableTypes" :key="variable" :value="variable">
            {{ variableTypeToString(variable) }}
          </option>
        </select>
        <p>Erforderlich:</p>
        <input type="checkbox" v-model="required" />
      </div>
      <div class="actions">
        <button class="btn btn-primary" :disabled="name == ''" @click="addInput">Speichern</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.create-variable-view {
  .headingLine {
    display: grid;
    grid-template-columns: fit-content(100%) 1fr;
    align-items: center;
    gap: 10px;
    margin-block: 20px;

    .backArrow {
      font-size: 1.2em;
    }

    .heading p {
      margin: 0;
    }
  }

  input[type='checkbox'] {
    justify-self: flex-start;
  }
}
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
.duoGrid {
  gap: 5px 5px;
}
textarea {
  resize: vertical;
}
</style>
