<script setup lang="ts">
import { useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { variableTypeToString } from '@/types/AssistanceType/variableTypes'
import { type GraphNode } from '@vue-flow/core'
import { computed } from 'vue'
import AtInputDefaultValueInput from '../../Generics/ATInputDefaultValueInput.vue'
const sidebarStore = useSidebarStore()

const obj = computed(() => sidebarStore.currentObject as GraphNode)

const isRequired = computed(() => obj.value.data.variable.required)
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
        <input type="checkbox" v-model="obj.data.variable.required" disabled />
        <p v-if="!isRequired">Standard:</p>
        <at-input-default-value-input
          v-if="!isRequired"
          :value="obj.data.variable.default"
          @update:value="obj.data.variable.default = $event"
          :at-type="obj.data.variable.type"
          readonly
        ></at-input-default-value-input>
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
