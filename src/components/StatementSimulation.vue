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
import exampleStatements from '@/assets/example-statements.json'
import ConfirmationDialog from '@/components/shared/ConfirmationDialog.vue'
import { useAdministrationStore } from '@/stores/administration'
import axios from 'axios'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { createConfirmDialog } from 'vuejs-confirm-dialog'

export default {
  data: () => ({
    showCode: false,
    selectedStatement: null,
    selectedStatementIndex: -1,
    modalView: 'text',
    errorMsg: '',
    dialog: null,
    statements: exampleStatements,
    requestInProgress: false,
    administrationStore: useAdministrationStore(),
    adminTokenNotAvailable: false,
    adminUserName: '',
    adminUserPassword: '',
    userId: null,
    timeFactor: null,
    simulationStarted: false,
    assistanceTypeKeys: [],
    supportedAssistanceTypes: [],
    checkInput: false
  }),
  components: {
    VueJsonPretty
  },
  props: {
    backendUrl: String,
    isExpanded: Boolean
  },
  computed: {
    /**
     * Return a stored admin token, if it is not yet expired.
     */
    adminToken() {
      const adminToken = this.administrationStore.adminToken
      if (adminToken && adminToken !== '') {
        // Check expire date: https://stackoverflow.com/a/69058154
        const expiry = JSON.parse(atob(adminToken?.split('.')?.[1]))?.exp
        const isTokenExpired = expiry ? Math.floor(new Date().getTime() / 1000) >= expiry : true
        if (isTokenExpired) {
          // eslint-disable-next-line
          this.administrationStore.adminToken = ''
        }
        return this.administrationStore.adminToken ?? ''
      }
      return ''
    },
    /**
     * Return, whether an error was detected.
     */
    errorDetected() {
      return this.errorMsg !== ''
    },
    /**
     * Return, whether the statements variable contains a valid array with at least one entry.
     */
    isValidStatementsArrayWithAtLeastOneEntry() {
      return Array.isArray(this.statements) && this.statements.length >= 1
    }
  },
  created() {
    this.switchView(true)
    this.initStatementSimulation()
  },
  methods: {
    /**
     * Initialize the statement simulation by retrieving the assistance type keys, if an admin token exists.
     */
    initStatementSimulation() {
      if (this.adminToken !== '') {
        this.adminTokenNotAvailable = false
        // Only request the assistance types once
        if (this.assistanceTypeKeys?.length === 0) {
          this.requestInProgress = true
          const authHeader = {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: 'Bearer ' + this.adminToken
          }
          const url = this.backendUrl + '/api/v1/assistance/types'
          axios.get(url, { headers: authHeader }).then((data) => {
            const assistanceTypesResponse = data.data
            this.assistanceTypeKeys = assistanceTypesResponse.map((assistanceType) => {
              return { key: assistanceType.key }
            })
            this.supportedAssistanceTypes = this.assistanceTypeKeys
            this.requestInProgress = false
          })
        }
      } else {
        this.adminTokenNotAvailable = true
      }
    },
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
          this.requestInProgress = false
          this.initStatementSimulation()
        }
      })
      setTimeout(() => {
        this.requestInProgress = false
      }, 2000)
    },
    /**
     * Update the statements variable, if an input change on the textarea was detected.
     *
     * @param event
     */
    updateStatements(event) {
      if (event?.target?.value) {
        this.statements = event.target.value
      }
    },
    /**
     * When changing the file during import, display a confirmation dialog to confirm that changes will be made.
     *
     * @param event
     */
    changeFile(event) {
      if (event?.target?.files?.length > 0) {
        const fileReader = new FileReader()

        fileReader.onload = (e) => {
          this.dialog = createConfirmDialog(ConfirmationDialog, {
            title: 'Statements importieren',
            question:
              'Sind Sie sich sicher, dass Sie die Statements importieren wollen? Die vorhandenen Statements gehen dadurch verloren.',
            confirmTxt: 'Bestätigen',
            cancelTxt: 'Abbrechen'
          })
          this.dialog.reveal()
          this.dialog.onConfirm(() => {
            const result = JSON.parse(e.target.result)
            this.statements = this.showCode ? JSON.stringify(result, null, 2) : result
            document.getElementById('json-upload').value = null
          })
          this.dialog.onCancel(() => {
            this.dialog.close()
            document.getElementById('json-upload').value = null
          })
        }

        fileReader.readAsText(event.target.files[0])
      }
    },
    /**
     * Download the list of created statements as a JSON file.
     */
    downloadStatements() {
      const statements = Array.isArray(this.statements) ? JSON.stringify(this.statements, null, 4) : this.statements
      const filename = Math.floor(Date.now() / 1000) + '_statements.json'
      const blob = new Blob([statements], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.textContent = 'Download ' + filename
      a.click()
    },
    /**
     * Switch the current view into a given view name.
     *
     * @param newView
     */
    switchView(newView) {
      this.showCode = newView
      if (this.showCode) {
        if (Array.isArray(this.statements)) {
          this.statements = JSON.stringify(this.statements, null, 4)
        } else {
          this.errorMsg =
            'Beim Wechsel auf die Code-Ansicht wurde festgestellt, dass die Statements bereits als Text vorliegen.'
          setTimeout(() => {
            this.errorMsg = ''
          }, 8000)
        }
      } else if (!this.showCode) {
        if (this.isJsonString(this.statements)) {
          this.statements = JSON.parse(this.statements)
        } else {
          this.errorMsg = 'Beim Parsing der Statements ist ein Fehler aufgetreten.'
          setTimeout(() => {
            this.errorMsg = ''
          }, 8000)
        }
      }
    },
    /**
     * Open a modal for a selected statement in order to edit it.
     *
     * @param statement
     * @param index
     */
    openStatementModal(statement, index) {
      this.selectModalView('text', statement)
      this.selectedStatementIndex = index
      this.modalView = 'text'
    },
    /**
     * Switch between two different views within the modal of the selected statement.
     *
     * @param modalView
     * @param statement
     */
    selectModalView(modalView, statement) {
      if (modalView === 'text' && this.isObject(statement)) {
        this.selectedStatement = JSON.stringify(statement, null, 4)
        this.modalView = modalView
      } else if (modalView === 'viewer' && !this.isObject(statement)) {
        if (this.isJsonString(statement)) {
          this.selectedStatement = JSON.parse(statement)
          this.modalView = modalView
        } else {
          this.checkInput = true
          setTimeout(() => {
            this.checkInput = false
          }, 10000)
        }
      }
    },
    /**
     * Close the modal of the selected statement.
     */
    closeStatementModal() {
      this.statements[this.selectedStatementIndex] = !this.isObject(this.selectedStatement)
        ? JSON.parse(this.selectedStatement)
        : this.selectedStatement
      this.selectedStatement = null
      this.selectedStatementIndex = -1
    },
    /**
     * Remove a statement with a given index from the list of statements.
     *
     * @param index
     */
    removeStatement(index) {
      this.dialog = createConfirmDialog(ConfirmationDialog, {
        title: 'Statement löschen',
        question:
          'Sind Sie sich sicher, dass Sie das Statement löschen wollen? Dies kann nicht rückgängig gemacht werden.',
        confirmTxt: 'Bestätigen',
        cancelTxt: 'Abbrechen'
      })
      this.dialog.reveal()
      this.dialog.onConfirm(() => {
        this.statements.splice(index, 1)
      })
      this.dialog.onCancel(() => {
        this.dialog.close()
      })
    },
    /**
     * Retrieve the name of the actor account.
     *
     * @param actor
     */
    getActorAccountName(actor) {
      return actor?.account?.name || 'Unknown'
    },
    /**
     * Retrieve the name of the verb.
     *
     * @param verb
     */
    getVerbName(verb) {
      return verb?.id?.split('/verbs/')?.[1] ?? 'Unknown'
    },
    /**
     * Retrieve a reduced name of the object.
     *
     * @param object
     */
    getObjectName(object) {
      if (object?.id?.split('goto.php?')?.length > 1) {
        return '…' + object.id.split('goto.php?')[1]
      }
      return object?.id ?? 'Unknown'
    },
    /**
     * Start the simulation process.
     */
    startSimulation() {
      if (this.adminToken === '') {
        return
      }
      this.requestInProgress = true
      const simulationUrl = this.backendUrl + '/api/v1/simulation'
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.adminToken
      }
      const statements = this.showCode ? JSON.parse(this.statements) : this.statements
      const simulationRequest = {
        statements,
        supportedAssistanceTypes: this.supportedAssistanceTypes
      }
      if (this.userId) {
        simulationRequest.userId = this.userId
      }
      if (this.timeFactor) {
        simulationRequest.timeFactor = this.timeFactor
      }

      axios.post(simulationUrl, simulationRequest, { headers: authHeader }).then(() => {
        this.simulationStarted = true
        setTimeout(() => {
          this.requestInProgress = false
          this.simulationStarted = false
        }, 10000)
      })
    },
    /**
     * Helper function to swap two array elements.
     *
     * @param array
     * @param indexA
     * @param indexB
     */
    swapArrayElements(array, indexA, indexB) {
      const temp = array[indexA]
      array[indexA] = array[indexB]
      array[indexB] = temp
    },
    /**
     * Check, whether a given variable is an object.
     *
     * @param x
     */
    isObject(x) {
      return typeof x === 'object' && !Array.isArray(x) && x !== null
    },
    /**
     * Check, whether a given input string is a valid JSON string.
     *
     * @param inputString
     */
    isJsonString(inputString) {
      try {
        JSON.parse(inputString)
      } catch (e) {
        return false
      }
      return true
    }
  }
}
</script>

<template>
  <div
    id="statement-simulation"
    :class="[`${isExpanded ? 'is-expanded' : ''}`, `${!!selectedStatement ? 'no-overflow' : ''}`]"
  >
    <div class="container py-4 mw-100">
      <h2 class="d-inline">
        Statement Simulation
        <label for="json-upload" class="ms-1 custom-file-upload">
          <font-awesome-icon size="xs" icon="upload" />
        </label>
        <input
          id="json-upload"
          type="file"
          @change="changeFile($event)"
          :disabled="requestInProgress"
          accept="application/json"
        />
        <button id="json-download" class="ms-1" @click="downloadStatements()" :disabled="requestInProgress">
          <font-awesome-icon size="xs" icon="download" />
        </button>
        <button
          id="switch-view"
          @click="switchView(!showCode)"
          :disabled="requestInProgress"
          class="pull-right px-2"
          :title="showCode ? 'Wechsel zum Listenansicht' : 'Wechsel zur Textansicht'"
        >
          <font-awesome-icon size="sm" :icon="showCode ? 'list' : 'code'" />
        </button>
      </h2>
      <div class="mt-4">
        <template v-if="showCode">
          <div class="alert alert-danger" v-if="errorDetected">{{ errorMsg }}</div>
          <textarea
            placeholder="Kopieren Sie hier den Inhalt Ihrer JSON-Datei als Liste hinein."
            @change="updateStatements"
            :value="statements"
            :disabled="requestInProgress"
          ></textarea>
        </template>
        <template v-else>
          <div class="alert alert-danger" v-if="errorDetected">{{ errorMsg }}</div>
          <div v-if="isValidStatementsArrayWithAtLeastOneEntry">
            <table class="table">
              <tr>
                <th></th>
                <th>Nr.</th>
                <th>Actor</th>
                <th>Verb</th>
                <th>Object</th>
                <th>Aktionen</th>
              </tr>
              <tr v-for="(statement, index) in statements" :key="'statement' + index">
                <td class="text-center">
                  <button
                    class="action"
                    :disabled="index === 0 || requestInProgress"
                    @click="swapArrayElements(statements, index, index - 1)"
                  >
                    <font-awesome-icon size="xs" icon="chevron-up" />
                  </button>
                  <button
                    class="action ms-1"
                    :disabled="index === statements.length - 1 || requestInProgress"
                    @click="swapArrayElements(statements, index, index + 1)"
                  >
                    <font-awesome-icon size="xs" icon="chevron-down" />
                  </button>
                </td>
                <td>#{{ index + 1 }}</td>
                <td>{{ getActorAccountName(statement.actor) }}</td>
                <td>{{ getVerbName(statement.verb) }}</td>
                <td>{{ getObjectName(statement.object) }}</td>
                <td class="text-center">
                  <button class="action" @click="openStatementModal(statement, index)" :disabled="requestInProgress">
                    <font-awesome-icon size="xs" icon="pencil" />
                  </button>
                  <button
                    class="action ms-1"
                    @click="statements.splice(index, 0, statement)"
                    :disabled="requestInProgress"
                  >
                    <font-awesome-icon size="xs" icon="copy" />
                  </button>
                  <span class="ms-1">|</span>
                  <button class="action ms-1" @click="removeStatement(index)" :disabled="requestInProgress">
                    <font-awesome-icon size="xs" icon="xmark" />
                  </button>
                </td>
              </tr>
            </table>
          </div>
          <div class="alert alert-danger" v-else>
            Das Format konnte entweder nicht als Array gelesen werden oder der Eintrag ist nicht komplett.
          </div>
        </template>
        <hr />
        <div class="mt-4" v-if="adminTokenNotAvailable">
          <div class="alert alert-info">Es ist noch kein Admin-Token hinterlegt. Bitte loggen Sie sich ein.</div>
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
            <button class="btn" @click="adminLogin()" :disabled="requestInProgress">Einloggen</button>
          </div>
        </div>
        <template v-else>
          <div class="form-group">
            <label for="userId" class="control-label">(Optional) Benutzer-ID</label>
            <input id="userId" class="form-control" type="text" v-model="userId" :disabled="requestInProgress" />
          </div>
          <div class="form-group">
            <label for="timeFactor" class="control-label">(Optional) Zeitfaktor</label>
            <input
              id="timeFactor"
              class="form-control"
              type="number"
              v-model="timeFactor"
              :disabled="requestInProgress"
            />
          </div>
          <div class="form-group">
            <label class="control-label mb-2">Unterstützte Assistenztypen</label>
            <div
              class="ms-1 mb-1"
              v-for="(assistanceType, index) in assistanceTypeKeys"
              :key="'assistance-type-key-' + index"
            >
              <input
                :id="'assistanceType' + index"
                class="checkbox-input"
                type="checkbox"
                :value="assistanceType"
                v-model="supportedAssistanceTypes"
                :disabled="requestInProgress"
              />
              <label class="ms-1" :for="'assistanceType' + index">{{ assistanceType.key }}</label>
            </div>
          </div>
          <div class="alert alert-success" v-if="simulationStarted">Die Simulation wurde erfolgreich gestartet.</div>
          <div class="form-group">
            <button class="btn" @click="startSimulation()" :disabled="requestInProgress">Simulation starten</button>
          </div>
        </template>
      </div>
      <div v-if="!!selectedStatement" class="modal-backdrop">
        <div class="modal-container">
          <div class="modal-header">
            <button
              class="btn btn-group-left"
              :class="modalView === 'viewer' ? 'btn-gray' : ''"
              @click="selectModalView('text', selectedStatement)"
            >
              Text
            </button>
            <button
              class="btn btn-group-right"
              :class="modalView === 'text' ? 'btn-gray' : ''"
              @click="selectModalView('viewer', selectedStatement)"
            >
              Viewer
            </button>
            <div class="modal-close">
              <font-awesome-icon
                class="icon modal-close-icon"
                size="lg"
                icon="xmark"
                @click="closeStatementModal()"
                title="Schließen"
              />
            </div>
          </div>
          <div class="modal-text">
            <template v-if="modalView === 'text'">
              <textarea v-model="selectedStatement"></textarea>
            </template>
            <template v-else>
              <vue-json-pretty
                v-model:data="selectedStatement"
                :editable="true"
                :show-double-quotes="false"
                :show-icon="true"
                :show-line-number="true"
              />
            </template>
          </div>
          <div class="modal-footer">
            <span class="alert alert-warning py-2 px-3 pull-left" v-if="checkInput">
              Der Text konnte nicht geparst werden. Bitte überprüfen Sie Ihre Eingabe.
            </span>
            <button class="btn pull-right" @click="closeStatementModal">Speichern</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#statement-simulation {
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

  &.no-overflow {
    overflow-y: hidden;
  }

  :deep(h2) {
    font-weight: 600;
  }

  :deep(button) {
    padding: 6px;
    border: none;
    background-color: var(--dark);
    color: white;
    font-weight: 600;
    border-radius: 5px;
    height: 35px;

    &:disabled {
      cursor: not-allowed;
      background-color: var(--dark-alt);
    }

    &.action {
      padding-top: 2px;
      padding-bottom: 2px;
      height: unset;
    }
  }

  .btn-gray {
    background-color: var(--light);
    color: var(--dark);
    border: 1px solid var(--dark);
  }

  .btn-group-left {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .btn-group-right {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  input[type='file'] {
    display: none;
  }

  #switch-view {
    width: 40px;
  }

  .custom-file-upload {
    padding: 3px 6px;
    border: none;
    background-color: var(--dark);
    color: white;
    font-weight: 600;
    border-radius: 5px;
  }

  #json-download {
    height: inherit;
    padding: 3px 6px;
  }

  :deep(textarea) {
    width: 100%;
    resize: vertical;
    padding: 15px;
    border-radius: 5px;
    border: solid 1px #cecece;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
    min-height: 250px;
    height: 100%;
  }

  :deep(input) {
    border-radius: 5px;
    border: solid 1px #cecece;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
    height: 30px;
  }

  :deep(textarea:hover, input:hover, textarea:focus, input:focus) {
    border-color: #c9c9c9;
  }

  .checkbox-input {
    height: inherit;
  }

  table {
    th {
      font-weight: 600;
    }
    th,
    td {
      padding: 5px 10px;
      border: 1px solid #bbb;
    }
  }

  .modal-backdrop {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: grey;
  }

  .modal-container {
    z-index: 8;
    position: relative;
    top: 50px;
    left: 50px;
    height: calc(100% - 100px);
    width: calc(100% - 100px);
    border-radius: 10px;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
    border: 1px solid grey;
    background-color: white;
  }

  .modal-header {
    padding: 7px;
    height: 50px;
  }

  .modal-text {
    padding: 20px;
    height: calc(100% - 100px);
    overflow: auto;
  }

  .modal-footer {
    padding: 7px;
    height: 50px;
  }

  .modal-close {
    cursor: pointer;
    position: absolute;
    top: 10px;
    right: 30px;
  }

  .modal-close-icon {
    position: fixed;
  }
}
</style>
