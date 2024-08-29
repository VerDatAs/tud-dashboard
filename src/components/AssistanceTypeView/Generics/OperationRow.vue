<script setup lang="ts">
import type { TOperation } from '@/types/AssistanceType/operation'
import { ref } from 'vue'

const props = defineProps<{
  operation: TOperation
}>()
const emit = defineEmits<{
  (e: 'addOperation', operation: TOperation): void
}>()

const expanded = ref(false)
const addClicked = ref(false)

function addOperation() {
  if (addClicked.value) return
  addClicked.value = true
  emit('addOperation', props.operation)
  setTimeout(() => {
    addClicked.value = false
  }, 1500)
}
</script>

<template>
  <div class="operation">
    <div class="permanent-row">
      <div class="operation-title" @click="expanded = !expanded">
        <font-awesome-icon class="icon collapse-icon" :class="{ rotated: expanded }" icon="chevron-right" />
        <p>{{ operation.name }}</p>
      </div>
      <div class="actions">
        <font-awesome-icon
          class="icon"
          :class="{ clicked: addClicked }"
          icon="plus"
          title="Operation hinzufügen"
          @click="addOperation"
        />
      </div>
    </div>
    <div v-if="expanded" class="expandable duoGrid">
      <i>ID:</i>
      <i class="operation-id">{{ operation.id }}</i>
      <i></i>
      <i class="operation-subtitle">{{ operation.description }}</i>
    </div>
  </div>
</template>

<style scoped lang="scss">
.operation {
  margin-left: 5px;
  p {
    margin: 0;
  }
}
.permanent-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;

  .operation-title {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .actions {
    padding-right: 5px;
    display: flex;
    align-items: center;
    gap: 7px;

    .icon {
      cursor: pointer;
    }

    .clicked {
      opacity: 0.5;
      cursor: initial;
    }
  }
}

.expandable {
  margin-left: 30px;
  font-size: 0.9em;
  margin-bottom: 10px;
}
</style>
