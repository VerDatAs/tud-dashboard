<script setup lang="ts">
import type { TDnD } from '@/types/AssistanceType/dnd'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { Pane, Splitpanes } from 'splitpanes'
import { provide, ref } from 'vue'
import FlowChart from './FlowChart.vue'
import DetailsSidebar from './Sidebars/DetailsSidebar.vue'

const sidebarSize = ref(30)

/*
 *    Drag And Drop
 */
provide<TDnD>(SDnDKey, useDragAndDrop())

/*
 *    Remove Preload Class
 *    preload class is needed to disable transitions before everything has finished loading
 *      else the center start-element is not working, because both panes start with 50% and we would need to wait the transition time before centering
 */
function rmPreloadClass() {
  document.querySelector('.main')?.classList.remove('preload')
}
</script>

<template>
  <div class="main preload" @load="rmPreloadClass">
    <Splitpanes class="default-theme" :dbl-click-splitter="false">
      <!-- <Pane>
        <operations-sidebar class="operations-sidebar" />
      </Pane> -->
      <Pane>
        <flow-chart class="flow-chart" />
      </Pane>
      <Pane class="details-sidebar-pane" :size="sidebarSize">
        <details-sidebar class="details-sidebar" />
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped lang="scss">
.preload * {
  transition: none !important;
}

.main {
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 100%;

  .operations-sidebar {
    flex-shrink: 0;
  }
  .details-sidebar {
    overflow: auto;
    height: 100%;
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
