<script setup lang="ts">
import { useOperationStore } from '@/stores/AssistanceTypes/operations'
import type { TDnD } from '@/types/AssistanceType/dnd'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { inject, onMounted, ref } from 'vue'

const operationStore = useOperationStore()
const { onDragStart } = inject<TDnD>(SDnDKey, () => useDragAndDrop(), true)

const searchTerm = ref('')

onMounted(() => {
  operationStore.requestOperations()
})
</script>

<template>
  <aside class="operations-sidebar sidebar">
    <div class="heading">
      <p>Operationen</p>
    </div>
    <div class="search">
      <p>Suche:</p>
      <input
        type="search"
        name="search-operation"
        id="search-operation"
        v-model="searchTerm"
        @input="operationStore.setSearchTerm(searchTerm)"
      />
    </div>

    <div class="operation-list">
      <div
        class="operation"
        v-for="operation of operationStore.searchedOperations"
        :key="operation.id"
        :draggable="true"
        @dragstart="onDragStart($event, operation)"
      >
        <p class="operation-title">{{ operation.name }}</p>
        <p class="operation-subtitle">{{ operation.description }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.operations-sidebar {
  width: 200px;

  .search {
    font-size: 0.8em;

    input {
      width: 100%;
      border: 1px solid #000;
    }
  }

  .operation-list {
    --border-radius: 8px;

    margin-top: 1em;
    padding: 5px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: scroll;
    background-color: var(--vf-flow-color-bg);
    border-radius: var(--border-radius);

    .operation {
      background-color: #fff;
      padding: 5px;
      border-radius: var(--border-radius);

      .operation-subtitle {
        font-size: 0.7em;
        opacity: 0.8;
      }
    }
  }
}
</style>
