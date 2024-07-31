<script setup lang="ts">
import { ref } from 'vue'
import EditorView from './AssistanceTypeView/EditorView.vue'
import SelectView from './AssistanceTypeView/SelectView.vue'

const props = withDefaults(
  defineProps<{
    /** Whether the sidebar is expanded or not */
    isExpanded: boolean
  }>(),
  {
    isExpanded: false
  }
)

const currentTypeID = ref<string | undefined>(undefined)
function onSelection(id: string | undefined) {
  currentTypeID.value = id
}
</script>

<template>
  <div id="assistanceTypesContainer" :class="{ expanded: isExpanded }">
    <SelectView v-if="currentTypeID === undefined" @assistanceTypeSelected="onSelection"></SelectView>
    <EditorView v-else @backAction="onSelection(undefined)" :typeId="currentTypeID"></EditorView>
  </div>
</template>

<style scoped lang="scss">
#assistanceTypesContainer {
  --sidebar-min-width: 50px;
  --offset: 10px;
  --default-width: calc(100% - calc(2 * var(--offset)));

  font-size: 0.9rem;

  margin-bottom: var(--offset);
  height: calc(100% - var(--offset));
  width: calc(var(--default-width) - var(--sidebar-min-width));
  margin-left: calc(var(--sidebar-min-width) + var(--offset));

  &.expanded {
    margin-left: calc(var(--sidebar-width) + var(--offset));
    width: calc(var(--default-width) - var(--sidebar-width));
  }
}

:deep(.divider) {
  height: 1px;
  width: 100%;
  background-color: #aaa;
  margin: 10px 0;
}
</style>
