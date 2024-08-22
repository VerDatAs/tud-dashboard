<script setup lang="ts">
import { EAssistanceTypeTrigger, useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'

const atStore = useAssistanceTypeStore()
</script>

<template>
  <div class="sidebar-type-view">
    <div>
      <div class="heading">
        <p>Assistenztyp</p>
      </div>
      <div class="subheading">
        <p>ID: {{ atStore.id }}</p>
      </div>
    </div>
    <div>
      <p class="underheading">Daten</p>
      <div class="duoGrid">
        <p>Name:</p>
        <input type="text" v-model="atStore.name" />
        <p>Beschreibung:</p>
        <textarea v-model="atStore.description"></textarea>
        <p>Auslöser:</p>
        <select name="trigger" v-model="atStore.trigger">
          <option :value="EAssistanceTypeTrigger.REACTIVE">Reaktiv</option>
          <option :value="EAssistanceTypeTrigger.PROACTIVE">Proaktiv</option>
        </select>
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
.duoGrid {
  gap: 5px 5px;
}
textarea {
  resize: vertical;
}
</style>
