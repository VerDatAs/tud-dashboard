<script setup lang="ts">
import FlowChart from './AssistanceTypeView/FlowChart.vue';

const props = withDefaults(
  defineProps<{
    isExpanded: boolean
  }>(),
  {
    isExpanded: false
  }
)
</script>

<template>
  <div id="assistanceTypesContainer" :class="{ 'margin-250': isExpanded, 'margin-5': !isExpanded }">
    <h1>AssistanceTypes</h1>
    <FlowChart />
  </div>
</template>

<style scoped lang="scss">
#assistanceTypesContainer {
  --sidebar-min-width: 50px;
  --offset-left: 10px;

  width: 100%;
  height: 100%;
}

.margin-5 {
  margin-left: calc(var(--sidebar-min-width) + var(--offset-left));
}
.margin-250 {
  margin-left: calc(var(--sidebar-width) + var(--offset-left));
}
</style>
