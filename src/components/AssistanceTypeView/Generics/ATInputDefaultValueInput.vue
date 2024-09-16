<script setup lang="ts">
import type { TIOType, TIOTypes } from '@/types/AssistanceType/variableTypes'

withDefaults(
  defineProps<{
    atType: TIOTypes
    value: TIOType
    readonly?: boolean
  }>(),
  {
    readonly: false
  }
)
const emit = defineEmits<{
  (e: 'update:value', value: TIOType): void
}>()
function updateValue(value: any) {
  emit('update:value', value.target.value)
}
function updateBoolValue(value: any) {
  emit('update:value', value.target.checked === true)
}
</script>

<template>
  <input v-if="atType === 'string'" type="text" :value="value" @input="updateValue" :disabled="readonly" />
  <input
    v-else-if="atType === 'number'"
    type="number"
    step="0.0001"
    :value="value"
    @input="updateValue"
    :disabled="readonly"
  />
  <input
    v-else-if="atType === 'integer'"
    type="number"
    step="1"
    :value="value"
    @input="updateValue"
    :disabled="readonly"
  />
  <input
    v-else-if="atType === 'boolean'"
    type="checkbox"
    :checked="value === true"
    @change="updateBoolValue"
    :disabled="readonly"
  />
  <!-- <textarea v-else-if="type === 'object'" v-model="value" :disabled="readonly" ></textarea> -->
  <!-- TODO: Array -->
</template>

<style scoped lang="sass"></style>
