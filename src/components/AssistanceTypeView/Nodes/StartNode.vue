<script setup lang="ts">
import { Handle, type NodeProps, Position } from '@vue-flow/core'

const props = defineProps<NodeProps>()
</script>

<template>
  <div>
    <Handle type="source" class="controll" :position="Position.Bottom"></Handle>
    <div>
      <p>
        <b>{{ props.data.label }}</b>
      </p>
    </div>
  </div>
</template>
