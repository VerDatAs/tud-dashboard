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
import { useAdministrationStore } from '@/stores/administration'
import { useSettingStore } from '@/stores/settings'
import axios from 'axios'

export default {
  data: () => ({
    administrationStore: useAdministrationStore(),
    adminUserName: '',
    adminUserPassword: '',
    errorMsg: '',
    requestInProgress: false,
    settings: useSettingStore()
  }),
  props: {
    adminTokenAvailable: Boolean,
    backendUrl: String,
    isExpanded: Boolean
  },
  methods: {
    /**
     * Perform a login with the input credentials of an administrator role.
     */
    adminLogin() {
      if (
          !this.adminUserName ||
          this.adminUserName === '' ||
          !this.adminUserPassword ||
          this.adminUserPassword === ''
      ) {
        this.errorMsg = true
        setTimeout(() => {
          this.errorMsg = false
        }, 5000)
        return
      }
      this.requestInProgress = true
      const url = this.backendUrl + '/api/v1/auth/login'
      const request = {
        actorAccountName: this.adminUserName,
        password: this.adminUserPassword
      }
      axios.post(url, request).then((data) => {
        const token = data.data.token
        // Check for the correct role
        const roles = JSON.parse(atob(token?.split('.')?.[1]))?.roles
        if (roles?.includes('ADMIN')) {
          this.administrationStore.adminToken = token
          this.adminUserName = ''
          this.adminUserPassword = ''
          this.requestInProgress = false
        } else {
          this.errorMsg = true
          setTimeout(() => {
            this.errorMsg = false
          }, 5000)
        }
      },
      () => {
        this.errorMsg = true
        setTimeout(() => {
          this.errorMsg = false
        }, 5000)
      })
      setTimeout(() => {
        this.requestInProgress = false
      }, 2500)
    },
    adminLogout() {
      if (this.adminTokenAvailable && confirm('Sind Sie sich sicher, dass Sie sich ausloggen wollen?')) {
        this.requestInProgress = true
        this.administrationStore.adminToken = ''
        setTimeout(() => {
          this.requestInProgress = false
        }, 2500)
      }
    }
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
      <hr>
      <h2>
        Administrator-Login
        <font-awesome-icon
          class="icon"
          icon="circle-info"
          size="md"
          title="Dadurch werden erweiterte Einstellungen sichtbar, wie das Monitoring von Assistenzprozessen."
        />
      </h2>
      <div class="setting">
        <div class="mt-4" v-if="!adminTokenAvailable">
          <div class="alert alert-info" v-if="!errorMsg">Es ist noch kein Admin-Token hinterlegt. Bitte loggen Sie sich ein, wenn Sie über diese Rechte verfügen.</div>
          <div class="alert alert-warning" v-if="errorMsg">Der Login war nicht erfolgreich. Bitte überprüfen Sie Ihre Eingabe.</div>
          <div class="form-group">
            <label for="adminUserName" class="control-label">Admin-Username</label>
            <input
                id="adminUserName"
                class="form-control"
                type="text"
                v-model="adminUserName"
                :disabled="requestInProgress"
            />
          </div>
          <div class="form-group">
            <label for="adminUserPassword" class="control-label">Admin-Passwort</label>
            <input
                id="adminUserPassword"
                class="form-control"
                type="password"
                v-model="adminUserPassword"
                :disabled="requestInProgress"
            />
          </div>
          <div class="form-group">
            <button class="btn btn-primary" @click="adminLogin()" :disabled="requestInProgress">Einloggen</button>
          </div>
        </div>
        <div v-else>
          <div class="mt-4 alert alert-info">Sie sind aktuell als Administrator eingeloggt.</div>
          <button class="btn btn-primary" @click="adminLogout()" :disabled="requestInProgress">Ausloggen</button>
        </div>
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
