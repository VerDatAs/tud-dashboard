<script lang="ts" setup>
withDefaults(defineProps<{ size?: string }>(), {
  size: '2em'
})
</script>

<template>
  <div :style="{ width: size, height: size }" class="loader"></div>
</template>

<style scoped lang="scss">
.loader {
  //   width: var(--loader-size, 48px);
  //   height: var(--loader-size, 48px);
  border: 5px solid #fff;
  border-bottom-color: var(--primary);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
