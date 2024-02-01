<script>
import { useSettingStore } from '@/stores/settings'

export default {
  data: () => ({
    settings: useSettingStore()
  })
}
</script>

<template>
  <div id="settings">
    <div class="container py-4 mw-100">
      <h1>Einstellungen</h1>
      <div class="setting">
        <input id="autoSave" type="checkbox" v-model="settings.autosave" />
        <label for="autoSave" class="mx-1">Auto-Save</label>
        <font-awesome-icon
          class="icon"
          icon="circle-info"
          size="md"
          title="Dadurch wird die Funktion des automatischen Speicherns aktiviert, die Ihre Änderungen beim Arbeiten mit der Wissensstruktur speichert."
        />
      </div>
      <div class="setting">
        <input id="debuggingMode" type="checkbox" v-model="settings.debugging" />
        <label for="debuggingMode" class="mx-1">Debug-Modus</label>
        <font-awesome-icon
          class="icon"
          icon="circle-info"
          size="md"
          title="Dadurch wird der Debugging-Modus aktiviert, der es Ihnen derzeit ermöglicht, das Diagramm in der Komponente der Wissensstruktur herunterzuladen und neu zu zeichnen."
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
#settings {
  margin-left: 5%;
}

.setting {
  margin-top: 5px;
}

.icon {
  cursor: pointer;
}
</style>
