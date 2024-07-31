<script setup lang="ts">
import type { TDnD } from '@/types/AssistanceType/dnd'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { provide } from 'vue'
import FlowChart from './FlowChart.vue'
import OperationsSidebar from './OperationsSidebar.vue'

/*
 *    Drag And Drop
 */
provide<TDnD>(SDnDKey, useDragAndDrop())
</script>

<template>
  <div class="main">
    <operations-sidebar class="flow-sidebar" />
    <flow-chart class="flow-chart" />
  </div>
</template>

<style scoped lang="scss">
.main {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 100%;

  .flow-chart {
    flex-grow: 1;
  }
  .operations-sidebar {
    flex-shrink: 1;
  }
}
</style>
