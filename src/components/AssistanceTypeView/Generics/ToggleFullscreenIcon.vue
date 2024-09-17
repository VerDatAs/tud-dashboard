<script setup lang="ts">
import { CFullscreenHelper } from '@/util/AssistanceType/fullscreenHelper'
import { SFullscreenMode } from '@/util/AssistanceType/injectionkeys'
import { inject } from 'vue'

const { isFullscreen, toggleFullscreen } = inject(SFullscreenMode, () => new CFullscreenHelper(), true)
</script>

<template>
  <font-awesome-icon
    class="icon pointer"
    :icon="isFullscreen ? 'minimize' : 'maximize'"
    size="lg"
    @click="toggleFullscreen()"
    :title="isFullscreen ? 'Vollbild-Modus beenden' : 'Vollbild-Modus einschalten'"
  />
</template>
