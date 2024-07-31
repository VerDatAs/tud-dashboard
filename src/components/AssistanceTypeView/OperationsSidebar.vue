<script setup lang="ts">
import type { TDnD } from '@/types/AssistanceType/dnd'
import { SDnDKey } from '@/util/AssistanceType/injectionkeys'
import useDragAndDrop from '@/util/AssistanceType/useDnD'
import { inject } from 'vue'

const { onDragStart } = inject<TDnD>(SDnDKey, () => useDragAndDrop(), true)
</script>

<template>
  <aside class="operations-sidebar">
    <div class="heading">
      <p>Operationen</p>
    </div>
    <div class="search">
      <p>Suche:</p>
      <input type="search" name="search-operation" id="search-operation" />
    </div>

    <div class="operation-list">
      <div class="vue-flow__node-input" :draggable="true" @dragstart="onDragStart($event, 'input')">Input Node</div>

      <div class="vue-flow__node-default" :draggable="true" @dragstart="onDragStart($event, 'default')">
        Default Node
      </div>

      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">Output Node</div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.operations-sidebar {
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

  .search {
    font-size: 0.8em;

    input {
      width: 100%;
      border: 1px solid #000;
    }
  }

  .operation-list {
    margin-top: 1em;
    padding: 5px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: scroll;
    background-color: var(--vf-flow-color-bg);
    border-radius: 8px;
  }
}
</style>
