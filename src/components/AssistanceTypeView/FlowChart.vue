<script setup lang="ts">
import type { TDnD } from '@/types/AssistanceType/dnd'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { inject, ref } from 'vue'
import DropzoneBackground from './DropzoneBackground.vue'

/*
 *    Drag And Drop
 */
const { onDragOver, onDragLeave, onDrop, isDragOver } = inject<TDnD>(SDnDKey, () => useDragAndDrop(), true)

/*
 *    Vue Flow
 */
const nodes = ref([])
const edges = ref([])
const { onConnect, addEdges } = useVueFlow()
onConnect(addEdges)
</script>

<template>
  <vue-flow :nodes="nodes" :edges="edges" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <dropzone-background
      :style="{
        backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
        transition: 'background-color 0.2s ease'
      }"
    >
      <p v-if="isDragOver">Drop here</p>
    </dropzone-background>
  </vue-flow>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import my vue flow theme */
@import '@/assets/vue-flow-theme.scss';

/* import the default theme, this is optional but generally recommended */
/* @import '@vue-flow/core/dist/theme-default.css'; */
</style>
