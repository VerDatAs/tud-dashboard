<script lang="ts" setup>
withDefaults(defineProps<{ size?: string; borderSize?: string; backgroundColor?: string }>(), {
  size: '2em',
  borderSize: '5px',
  backgroundColor: '#fff'
})
</script>

<template>
  <div
    :style="{ width: size, height: size, borderWidth: borderSize, borderColor: backgroundColor }"
    class="loader"
  ></div>
</template>

<style scoped lang="scss">
.loader {
  // width: var(--loader-size, 48px);
  // height: var(--loader-size, 48px);
  // border-width: 5px;
  border-style: solid;
  // border-color: #fff;
  border-bottom-color: var(--primary) !important;
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
