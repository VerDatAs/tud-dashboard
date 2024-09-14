<script setup lang="ts">
import { SLoadingModal } from '@/util/AssistanceType/modalHelper';
import LoadingIndicator from '../Generics/LoadingIndicator.vue';
import VueModal from '../Generics/VueModal.vue';
const symbol = SLoadingModal
</script>

<template>
  <vue-modal :symbol="symbol" :closeOnBackgroundClick="false">
    <template #override>
      <loading-indicator class="loading-indicator" size="5em" />
    </template>
  </vue-modal>
</template>

<style lang="scss" scoped>
.loading-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
}
</style>
