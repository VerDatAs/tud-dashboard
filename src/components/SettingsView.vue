<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script>
import { useSettingStore } from '@/stores/settings'

export default {
  data: () => ({
    settings: useSettingStore()
  }),
  props: {
    isExpanded: Boolean
  }
}
</script>

<template>
  <div id="settings" :class="`${isExpanded ? 'is-expanded' : ''}`">
    <div class="container py-4 mw-100">
      <h1>Einstellungen</h1>
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

<style lang="scss" scoped>
#settings {
  z-index: 8;
  position: absolute;
  top: 10px;
  left: calc(1rem + 32px + 10px);
  height: calc(100% - 20px);
  width: calc(100% - (1rem + 32px) - 20px);
  background: #eee;
  border: 1px solid #ccc;
  overflow-y: scroll;

  &.is-expanded {
    left: calc(var(--sidebar-width) + 10px);
    width: calc(100% - var(--sidebar-width) - 20px);
  }

  .setting {
    margin-top: 5px;

    .icon {
      cursor: pointer;
    }
  }
}
</style>
