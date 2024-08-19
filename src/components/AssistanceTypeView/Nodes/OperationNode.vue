<script setup lang="ts">
import { Handle, type NodeProps, Position, useNodeId, useVueFlow } from '@vue-flow/core'
// import { NodeResizer } from '@vue-flow/node-resizer';
import { ref, watch } from 'vue'

const props = defineProps<NodeProps>()
const nodeId = useNodeId()

const { removeNodes } = useVueFlow()

function removeSelf() {
  if (confirm(`Möchten Sie die Operation "${props.data.label}" wirklich entfernen?`)) removeNodes(nodeId)
}

const nodeContent = ref<HTMLElement | undefined>()

watch(
  () => props.dimensions,
  (newDimension) => {
    if (!nodeContent.value) return
    nodeContent.value.style.marginTop = `${newDimension.height / 2}px`
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <!-- <NodeResizer :min-width="300" :min-height="50" /> -->
    <Handle type="target" :position="Position.Top"></Handle>
    <Handle type="source" :position="Position.Bottom"></Handle>
    <div ref="nodeContent" class="node-content">
      <div title="Operation entfernen" @click="removeSelf" class="remove-icon pointer">
        <font-awesome-icon class="icon" icon="xmark"></font-awesome-icon>
      </div>
      <p class="title">{{ props.data.label }}</p>
      <p class="description">{{ props.data.operation.description }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.node-content {
  display: block;
  margin-top: auto;
  position: relative;
  translate: 0 -70%;
  --remove-icon-width: 25px;
  .remove-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    top: -5px;
    right: 0;
    width: var(--remove-icon-width);
    box-sizing: border-box;
    cursor: pointer;
  }
  .title {
    width: calc(100% - calc(2 * var(--remove-icon-width)) - 4px);
    margin-left: calc(var(--remove-icon-width) + 2px);
    font-size: 1.2em;
    text-align: center;
    border-bottom: 1px solid var(--vf-node-color);
  }
  .description {
    font-size: 1em;
    text-align: center;
  }
}
</style>
