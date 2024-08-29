<script setup lang="ts">
import type { TDnD } from '@/types/AssistanceType/dnd'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { provide } from 'vue'
import FlowChart from './FlowChart.vue'
import DetailsSidebar from './Sidebars/DetailsSidebar.vue'
import OperationsSidebar from './Sidebars/OperationsSidebar.vue'

/*
 *    Drag And Drop
 */
provide<TDnD>(SDnDKey, useDragAndDrop())
</script>

<template>
  <div class="main">
    <!-- <operations-sidebar class="operations-sidebar" /> -->
    <flow-chart class="flow-chart" />
    <details-sidebar class="details-sidebar" />
  </div>
</template>

<style scoped lang="scss">
.main {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 100%;

  .operations-sidebar {
    flex-shrink: 0;
  }
  .details-sidebar {
    flex-shrink: 0;
  }
}

:deep(.sidebar) {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-inline: 5px;

  p {
    margin: 0;
    padding: 0;
  }

  .heading {
    p {
      font-size: 1.2em;
      font-weight: bold;
      margin-top: 1em;
      text-align: center;
    }
  }
}
</style>
