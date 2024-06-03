<script setup>
function sendDebugData() {
  console.log('sendDebugData')
}
</script>

<template>
<div>
  <div @click="sendDebugData">
    Debug Data
  </div>
</div>
</template>

<style scoped lang="scss">

</style>