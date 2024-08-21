<script setup lang="ts">
import { useSidebarStore } from '@/stores/AssistanceTypes/sidebar';
import { computed, ref } from 'vue';
const sidebarStore = useSidebarStore()

const edge = computed((): any => sidebarStore.currentObject)

const showInputs = ref<boolean>(true)
const showOutputs = ref<boolean>(true)
</script>

<template>
  <div class="sidebar-edge-view" v-if="edge">
    <div>
      <div class="heading">
        <p>Verbindung</p>
      </div>
      <div class="subheading">
        <p>ID:</p>
        <i class="id" :title="edge.id">{{ edge.id }}</i>
        <p>Typ:</p>
        <i
          :style="{
            color:
              edge.type == 'control'
                ? 'var(--vf-operation-color-handle)'
                : edge.type == 'data'
                ? 'var(--vf-io-color-handle)'
                : 'inherit'
          }"
          >{{ edge.type == 'control' ? 'Kontrollfluss' : edge.type == 'data' ? 'Datenfluss' : 'Unbekannt' }}</i
        >
      </div>
    </div>
    <div>
      <div class="underheading">
        <p>Eingänge/Ausgänge hinzufügen</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sidebar-edge-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .subheading {
    display: grid;
    gap: 2px 8px;
    grid-template-columns: fit-content(100%) 1fr;

    .id {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}
</style>
