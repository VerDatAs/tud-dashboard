<script setup lang="ts">
import { useAssistanceTypeStore } from '@/stores/AssistanceTypes/assistancetype'
import { useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { SFullscreenMode } from '@/util/AssistanceType/injectionkeys'
import { closeFullscreen, openFullscreen } from '@/util/SiteHelpers'
import axios from 'axios'
import { onMounted, provide, ref } from 'vue'
import EditorMainView from './EditorMainView.vue'
const atStore = useAssistanceTypeStore()

const emit = defineEmits<{
  (e: 'backAction'): void
}>()

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

function saveAssistanceType() {
  atStore.saveAssistanceType()
}
function loadAssistanceType() {
  axios.get('/example-type.json').then((response) => {
    atStore.loadAssistanceType(response.data)
  })
}

onMounted(() => {
  updateDashboardElement()
  isFullscreen.value = false
})

const sidebarStore = useSidebarStore()

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
        <font-awesome-icon
          v-if="atStore.showVariableTypesOnNodes"
          class="icon pointer"
          icon="eye-slash"
          size="lg"
          title="Variablentypen verstecken"
          @click="atStore.showVariableTypesOnNodes = false"
        />
        <font-awesome-icon
          v-else
          class="icon pointer"
          icon="eye"
          size="lg"
          title="Variablentypen anzeigen"
          @click="atStore.showVariableTypesOnNodes = true"
        />
        <font-awesome-icon class="icon pointer" icon="clock" size="lg" title="Laden" @click="loadAssistanceType" />
        <font-awesome-icon class="icon pointer" icon="save" size="lg" title="Speichern" @click="saveAssistanceType" />
        <!-- <font-awesome-icon
          class="icon pointer"
          icon="house"
          size="lg"
          title="Assistenztyp anzeigen"
          @click="sidebarStore.setAssistanceType()"
        /> -->
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
