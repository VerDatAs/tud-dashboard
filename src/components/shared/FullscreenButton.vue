<script setup>
import {ref} from "vue";

const isMaximized = ref(false);

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen()
  }
  document.getElementById('verdatas-dashboard').classList.add('fullViewHeight')
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
  document.getElementById('verdatas-dashboard').classList.remove('fullViewHeight')
}


function toggleView() {
  const elem = document.getElementById('dashboardApp')
  if (!isMaximized.value) {
    openFullscreen(elem)
  } else {
    closeFullscreen()
  }

  isMaximized.value = !isMaximized.value
}
</script>

<template>
  <font-awesome-icon
      style="cursor: pointer"
      icon="maximize"
      size="lg"
      @click="toggleView()"
  />
</template>

<style scoped lang="scss">

</style>