<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
const atStore = useAssistanceTypeStore()

const emit = defineEmits<{
  (e: 'assistanceTypeSelected', id: string): void
  (e: 'newAssistanceType'): void
}>()
</script>

<template>
  <div class="container">
    <h1>Assistenztypen</h1>
    <p>Wählen Sie einen Assistenztyp aus, oder erstellen Sie einen neuen.</p>
    <div class="divider"></div>
    <div>
      <button class="btn btn-primary">
        <font-awesome-icon class="icon" icon="plus" />
        <p @click.prevent="emit('newAssistanceType')">Neuer Assistenztyp</p>
      </button>
    </div>
    <div class="divider"></div>
    <div class="list-types">
      <p @click="atStore.loadAssistanceType('1')">Test</p>
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
  overflow: scroll;
}
</style>
