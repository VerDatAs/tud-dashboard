<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { supportedVariableTypes, variableTypeToString } from '@/types/AssistanceType/variableTypes'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
const atStore = useAssistanceTypeStore()

const props = defineProps<{
  currentName: string | null
}>()

const emit = defineEmits<{
  (e: 'backAction'): void
}>()

function backAction() {
  emit('backAction')
}

const currentVariable = computed(() =>
  props.currentName === null ? undefined : atStore.getInputVariable(props.currentName)
)
const createMode = computed(() => currentVariable.value === undefined)

const name = ref(currentVariable.value?.name ?? '')
const description = ref(currentVariable.value?.description ?? '')
const type = ref(currentVariable.value?.type ?? supportedVariableTypes[0])
const required = ref(currentVariable.value?.required ?? true)
const defaultValue = ref(currentVariable.value?.default ?? '')

function saveInput() {
  if (!supportedVariableTypes.includes(type.value)) {
    toast.error('Der Typ ist nicht unterstützt.')
    return
  }
  if (createMode.value) {
    const res = atStore.createInputVariable(name.value, description.value, type.value, required.value, defaultValue.value)
    if (!res) return
    backAction()
    toast.success(`Eingang "${name.value}" hinzugefügt.`)
  } else {
    if (!props.currentName) return
    const res = atStore.updateInputVariable(
      props.currentName,
      name.value,
      description.value,
      type.value,
      required.value,
      defaultValue.value
    )
    if (!res) return
    backAction()
    toast.success(`Eingang "${name.value}" aktualisiert.`)
  }
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
        <p>Standard:</p>
        <input type="text" v-model="defaultValue" />
      </div>
      <div class="actions">
        <button class="btn btn-primary" :disabled="name == ''" @click="saveInput">Speichern</button>
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
