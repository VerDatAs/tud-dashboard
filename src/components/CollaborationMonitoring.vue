<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)

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
import { useCollaborationsStore } from '@/stores/collaborations'
import axios from 'axios'

export default {
  data: () => ({
    collaborationStore: useCollaborationsStore(),
    adminTokenNotAvailable: false,
    assistanceId: '',
    addAssistanceIdFormVisible: false,
    collaborationUserName: '',
    collaborationUserPassword: '',
    loginInProgress: false,
    collaborationsMap: {}
  }),
  props: {
    backendUrl: String,
    isExpanded: Boolean
  },
  computed: {
    /**
     * Return a stored admin token, if it is not yet expired.
     */
    adminToken() {
      const adminToken = this.collaborationStore.adminToken
      if (adminToken && adminToken !== '') {
        // Check expire date: https://stackoverflow.com/a/69058154
        const expiry = JSON.parse(atob(adminToken?.split('.')?.[1]))?.exp
        const isTokenExpired = expiry ? Math.floor(new Date().getTime() / 1000) >= expiry : true
        if (isTokenExpired) {
          // eslint-disable-next-line
          this.collaborationStore.adminToken = ''
        }
        return this.collaborationStore.adminToken ?? ''
      }
      return ''
    },
    /**
     * Return the stored collaborations.
     */
    collaborations() {
      return this.collaborationStore.collaborations ?? []
    },
    /**
     * Return, whether at least one stored collaboration exists.
     */
    collaborationsExist() {
      return this.collaborations.length > 0
    }
  },
  created() {
    this.initCollaborationMonitoring()
  },
  methods: {
    /**
     * Initialize the collaboration monitoring by retrieving further information on the stored collaborations,
     * if an admin token exists.
     */
    initCollaborationMonitoring() {
      if (!this.collaborationsExist) {
        return
      }
      if (this.adminToken !== '') {
        this.adminTokenNotAvailable = false
        const authHeader = {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: 'Bearer ' + this.adminToken
        }
        this.collaborations.forEach((relatedId) => {
          const assistanceUrl = this.backendUrl + '/api/v1/assistance/' + relatedId
          axios.get(assistanceUrl, { headers: authHeader }).then((data) => {
            this.collaborationsMap[relatedId] = data.data
          })
        })
      } else {
        this.adminTokenNotAvailable = true
      }
    },
    /**
     * Manually add an assistance ID to the stored collaborations.
     */
    addAssistanceId() {
      if (this.assistanceId && this.assistanceId !== '') {
        this.collaborationStore.collaborations.push(this.assistanceId)
        this.assistanceId = ''
        this.initCollaborationMonitoring()
      }
    },
    /**
     * Remove a collaboration with a given assistance ID from the stored collaborations.
     *
     * @param assistanceId
     */
    removeAssistanceId(assistanceId) {
      if (assistanceId && assistanceId !== '') {
        if (confirm('Wollen Sie diese Assistenz-ID wirklich aus dem Monitoring löschen?')) {
          const index = this.collaborationStore.collaborations.indexOf(assistanceId)
          if (index > -1) {
            this.collaborationStore.collaborations.splice(index, 1)
          }
          this.initCollaborationMonitoring()
        }
      }
    },
    /**
     * Perform a login with the input credentials of an administrator role.
     */
    adminLogin() {
      if (
        !this.collaborationUserName ||
        this.collaborationUserName === '' ||
        !this.collaborationUserPassword ||
        this.collaborationUserPassword === ''
      ) {
        return
      }
      this.loginInProgress = true
      const url = this.backendUrl + '/api/v1/auth/login'
      const request = {
        actorAccountName: this.collaborationUserName,
        password: this.collaborationUserPassword
      }
      axios.post(url, request).then((data) => {
        this.collaborationStore.adminToken = data.data.token
        this.loginInProgress = false
        this.initCollaborationMonitoring()
      })
      setTimeout(() => {
        this.loginInProgress = false
      }, 2000)
    }
  }
}
</script>

<template>
  <div id="collaboration-monitoring" :class="`${isExpanded ? 'is-expanded' : ''}`">
    <div class="container py-4 mw-100">
      <h2>
        Monitoring der Kollaborationen
        <span v-if="collaborationsExist">({{ collaborations.length }})</span>
        <button class="btn btn-primary ms-2" @click="addAssistanceIdFormVisible = !addAssistanceIdFormVisible">
          <template v-if="!addAssistanceIdFormVisible">
            <font-awesome-icon class="icon" icon="plus" />
          </template>
          <template v-else>
            <font-awesome-icon class="icon" icon="minus" />
          </template>
        </button>
        <button class="btn btn-secondary ms-2 pull-right" @click="initCollaborationMonitoring">Aktualisieren</button>
      </h2>
      <div class="mt-4" v-if="addAssistanceIdFormVisible">
        <div class="form-group">
          <label for="assistanceId" class="control-label"> Assistance-ID </label>
          <input id="assistanceId" class="form-control" type="text" v-model="assistanceId" />
        </div>
        <div class="form-group">
          <button class="btn btn-primary mt-2" type="button" @click="addAssistanceId()">Hinzufügen</button>
        </div>
      </div>
      <div class="mt-4" v-if="adminTokenNotAvailable">
        <div class="alert alert-info">Es ist noch kein Admin-Token hinterlegt. Bitte loggen Sie sich ein.</div>
        <div class="form-group">
          <label for="collborationUser" class="control-label"> Admin-Username </label>
          <input id="collborationUser" class="form-control" type="text" v-model="collaborationUserName" />
        </div>
        <div class="form-group">
          <label for="collborationPassword" class="control-label"> Admin-Passwort </label>
          <input id="collborationPassword" class="form-control" type="password" v-model="collaborationUserPassword" />
        </div>
        <div class="form-group">
          <button class="btn btn-primary mt-2" type="button" @click="adminLogin()" :disabled="loginInProgress">
            Login
          </button>
        </div>
      </div>
      <template v-if="!adminTokenNotAvailable">
        <div v-if="collaborationsExist">
          <div v-for="(collaboration, index) in collaborations" :key="'collaboration' + index">
            <hr />
            <h3>
              AssistanceID: {{ collaboration }}
              <button class="pull-right" @click="removeAssistanceId(collaboration)">&times;</button>
            </h3>
            <ul v-if="collaborationsMap[collaboration]">
              <li v-if="collaborationsMap[collaboration].assistanceState">
                {{ collaborationsMap[collaboration].assistanceState.step }} (Phase:
                {{ collaborationsMap[collaboration].assistanceState.phase }})
              </li>
              <template
                v-if="
                  collaborationsMap[collaboration].parameters &&
                  collaborationsMap[collaboration].parameters.find((param) => param.key === 'related_user_ids')
                "
              >
                <li
                  v-for="(user, userIndex) in collaborationsMap[collaboration].parameters.find(
                    (param) => param.key === 'related_user_ids'
                  ).value"
                  :key="'related_user_id' + userIndex"
                >
                  Benutzer {{ userIndex + 1 }}:
                  <ul>
                    <li>ID: {{ user }}</li>
                    <li
                      v-if="
                        collaborationsMap[collaboration].parameters.find((param) => param.key === 'user_states') &&
                        collaborationsMap[collaboration].parameters.find((param) => param.key === 'user_states')
                          .value &&
                        collaborationsMap[collaboration].parameters.find((param) => param.key === 'user_states').value[
                          user
                        ]
                      "
                    >
                      {{
                        collaborationsMap[collaboration].parameters.find((param) => param.key === 'user_states').value[
                          user
                        ].step
                      }}
                      (Phase:
                      {{
                        collaborationsMap[collaboration].parameters.find((param) => param.key === 'user_states').value[
                          user
                        ].phase
                      }})
                    </li>
                    <li>Lösung:</li>
                  </ul>
                  <div
                    style="list-style: none"
                    v-if="
                      collaborationsMap[collaboration].parameters.find((param) => param.key === 'final_solutions') &&
                      collaborationsMap[collaboration].parameters.find((param) => param.key === 'final_solutions')
                        .value &&
                      collaborationsMap[collaboration].parameters.find((param) => param.key === 'final_solutions')
                        .value[user]
                    "
                  >
                    <p class="solution">
                      {{
                        collaborationsMap[collaboration].parameters.find((param) => param.key === 'final_solutions')
                          .value[user]
                      }}
                    </p>
                  </div>
                  <div v-else>
                    <p class="solution">Es wurde noch keine finale Lösung eingereicht.</p>
                  </div>
                </li>
              </template>
            </ul>
            <template v-else> Die Informationen zur Kollaboration konnten nicht abgerufen werden. </template>
          </div>
        </div>
        <div class="alert alert-info" v-else>
          Es konnte keine gestartete Kollaboration gefunden werden. Sie haben jedoch die Möglichkeit über [+] die ID
          einer Kollaboration manuell hinzuzufügen.
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#collaboration-monitoring {
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

  .solution {
    white-space: pre-line;
    padding: 7px 14px;
    background: #fff;
  }
}
</style>
