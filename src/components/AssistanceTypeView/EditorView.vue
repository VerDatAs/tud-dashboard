<script setup lang="ts">
import { useATEventStore } from '@/stores/AssistanceTypes/events'
import { SFullscreenMode } from '@/util/AssistanceType/injectionkeys'
import { closeFullscreen, openFullscreen } from '@/util/SiteHelpers'
import { onMounted, provide, ref } from 'vue'
import EditorMainView from './EditorMainView.vue'

const props = defineProps<{
  typeId: string
}>()

const emit = defineEmits<{
  (e: 'backAction'): void
}>()

const atEventStore = useATEventStore()

function backAction() {
  if (confirm('Ihre ungespeicherten Änderungen gehen verloren. Möchten Sie wirklich zurück zur Assistenztyp-Auswahl?'))
    emit('backAction')
}

/** The dashboard element (with id 'verdatas-dashboard') */
const dashboardElement = ref<HTMLElement | undefined>()

/** Whether the dashboard is fullscreen or not */
const isFullscreen = ref<boolean>()
provide(SFullscreenMode, isFullscreen)

function toggleFullscreen() {
  const elem = dashboardElement.value
  if (!elem) return
  if (isFullscreen.value) {
    isFullscreen.value = closeFullscreen(elem)
  } else {
    isFullscreen.value = openFullscreen(elem)
  }
}

onMounted(() => {
  updateDashboardElement()
  isFullscreen.value = false
})

/*
 *    Helper Functions
 */
/** Sets the dashboard element to the element with the id 'verdatas-dashboard' */
function updateDashboardElement() {
  dashboardElement.value = document.getElementById('verdatas-dashboard') ?? undefined
}
</script>

<template>
  <div id="assistanceTypes">
    <div class="headline">
      <div class="title">
        <font-awesome-icon
          class="icon pointer"
          icon="arrow-left"
          size="lg"
          @click="backAction"
          title="Zurück zur Assistenztyp-Auswahl"
        />
        <h1>Editor für Assistenztypen</h1>
      </div>
      <div class="actions">
        <font-awesome-icon class="icon pointer" icon="save" size="lg" title="Speichern" />
        <font-awesome-icon
          class="icon pointer"
          icon="house"
          size="lg"
          title="Assistenztyp anzeigen"
          @click="atEventStore.clickSidebarShowAssistanceType.trigger"
        />
        <font-awesome-icon
          class="icon pointer"
          :icon="isFullscreen ? 'minimize' : 'maximize'"
          size="lg"
          @click="toggleFullscreen()"
          :title="isFullscreen ? 'Vollbild-Modus beenden' : 'Vollbild-Modus einschalten'"
        />
      </div>
    </div>
    <div class="divider"></div>
    <editor-main-view class="main-view"></editor-main-view>
  </div>
</template>

<style scoped lang="scss">
#assistanceTypes {
  height: 100%;
  width: 100%;

  .headline {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 3em;

    .title,
    .actions {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 20px;
    }
  }

  .main-view {
    height: calc(100% - 3em);
  }
  .divider {
    margin: 0;
  }
}
</style>
