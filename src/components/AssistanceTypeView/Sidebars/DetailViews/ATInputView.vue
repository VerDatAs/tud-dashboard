<script setup lang="ts">
import { useSidebarStore } from '@/stores/AssistanceTypes/sidebar';
import { variableTypeToString } from '@/types/AssistanceType/variableTypes';
import { type GraphNode } from '@vue-flow/core';
import { computed } from 'vue';
const sidebarStore = useSidebarStore()

const obj = sidebarStore.currentObject as GraphNode

const hasDefault = computed(() => obj.data.variable?.default && obj.data.variable.default != '')
</script>

<template>
  <div class="sidebar-at-input-view">
    <div>
      <div class="heading">
        <p>Eingang</p>
      </div>
      <div class="subheading duoGrid">
        <p>ID:</p>
        <p>{{ sidebarStore.currentId }}</p>
        <p>Name:</p>
        <p>{{ obj.data.variable.name }}</p>
        <p>Beschreibung:</p>
        <p>{{ obj.data.variable.description }}</p>
        <p>Typ:</p>
        <p>{{ variableTypeToString(obj.data.variable.type) }}</p>
        <p>Erforderlich:</p>
        <p>{{ obj.data.variable.required }}</p>
        <p v-if="hasDefault">Standard:</p>
        <p v-if="hasDefault">{{ obj.data.variable.default }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sidebar-type-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
