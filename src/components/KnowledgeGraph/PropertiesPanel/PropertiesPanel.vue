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
import BasicTypes from '@/components/KnowledgeGraph/PropertiesPanel/BasicTypes.vue'
import { useCollaborationsStore } from '@/stores/collaborations'
import { basicTypes, customTypes, excludedParameters, nonSelectableElements } from '@/util/GraphHelpers'
import axios from 'axios'
import { markRaw } from 'vue'
import VueMultiselect from 'vue-multiselect'

export default {
  name: 'PropertiesPanel',
  components: {
    BasicTypes,
    VueMultiselect
  },
  data: () => ({
    basicTypes,
    customTypes,
    parameters: [],
    parametrizedElement: null,
    priorKnowledgeValue: null,
    collaborationType: 'peer_collaboration',
    collaborationUserName: '',
    collaborationUserPassword: '',
    collaborationMembers: [],
    selectedCollaborationMembers: [],
    startCollaborationInProgress: false,
    collaborationStartSuccessfully: false,
    collaborationStore: useCollaborationsStore()
  }),
  props: {
    backendUrl: String,
    diagram: Object,
    elementSelected: Object,
    metamodel: Object,
    canViewOnly: Boolean,
    members: Array
  },
  emits: ['changeInput'],
  created() {
    // Set the input members as the initial collaboration members to be modified
    this.collaborationMembers = this.members
    // Select all members by default
    this.selectedCollaborationMembers = this.members.map((member) => member.id)
  },
  watch: {
    /**
     * Whenever the selected element changes, do something.
     */
    elementSelected(newElementSelected) {
      if (newElementSelected?.id && !this.canViewOnly) {
        this.retrieveParameters(newElementSelected)
        // Load the prior knowledge elements
        // TODO: Redrawing the diagram will create new IDs and invalidate the parameters set
        // As a solution, we might use the objectId in the future
        this.parametrizedElement = newElementSelected
        const priorKnowledgeElements =
          this.parametrizedElement?.businessObject?.priorKnowledgeElements?.map(
            (priorKnowledgeElement) => priorKnowledgeElement?.elementId
          ) ?? []
        this.priorKnowledgeValue = markRaw(
          this.allGraphElements.filter((element) => priorKnowledgeElements.includes(element.businessObject.objectId))
        )
      }
    }
  },
  computed: {
    /**
     * Return all graph elements except for non-selectable elements.
     */
    allGraphElements() {
      return (
        this.diagram
          ?.get('elementRegistry')
          ?.getAll()
          ?.filter((element) => !nonSelectableElements.includes(element.type)) ?? []
      )
    }
  },
  methods: {
    /**
     * Retrieve and return parameter names of a given type definition.
     *
     * @param typeDefinition a type definition from the metamodel
     * @param fullElementParameters a list of already existing parameters that should be extended
     * @returns {string[]} array of parameters defined by the type
     */
    iterateProperties(typeDefinition, fullElementParameters) {
      if (!fullElementParameters) {
        fullElementParameters = []
      }
      if (typeDefinition.properties?.length > 0) {
        typeDefinition.properties
          .map((prop) => {
            return { name: prop.name.split(':')[1], type: prop.type }
          })
          .forEach((propToAdd) => {
            if (
              !excludedParameters.includes(propToAdd.name) &&
              !fullElementParameters.find((param) => param.name === propToAdd.name)
            ) {
              fullElementParameters.push(propToAdd)
            }
          })
      }
      if (typeDefinition.superClass?.length > 0) {
        typeDefinition.superClass.forEach((superClassName) => {
          const superTypeDefinition = this.metamodel.types.find((type) => type.name === superClassName)
          fullElementParameters = this.iterateProperties(superTypeDefinition, fullElementParameters)
        })
      }
      return fullElementParameters
    },
    /**
     * Display the properties panel, insert title and display inputs.
     *
     * @param element
     */
    retrieveParameters(element) {
      const hasMetamodelTypes = this.metamodel.types?.length > 0
      const hasElementType = element.type?.split(':')?.length > 0
      if (!hasMetamodelTypes || !hasElementType) {
        return
      }

      const typeString = element.type.split(':')[1]
      const typeDefinition = this.metamodel.types.find((type) => type.name === typeString)
      if (!typeDefinition) {
        return
      }

      // Retrieve parameters of the element's type
      this.parameters = []
      this.parameters = this.iterateProperties(typeDefinition, this.parameters)
    },
    /**
     * Emit an event that the input was changed.
     *
     * @param parameterName
     * @param newValue
     */
    changeInput(parameterName, newValue) {
      this.$emit('changeInput', parameterName, newValue)
    },
    /**
     * Define a custom label for the multiselect.
     */
    customLabel(element) {
      // This option is used for priorKnowledge, as the elements are displayed in the diagram (.businessObject)
      return element.businessObject.name ? element.businessObject.name : element.businessObject.objectId
    },
    /**
     * Update the value of the priorKnowledge multiselect.
     */
    updateSelectedPriorKnowledge(selectedElements, parameterName) {
      // markRaw is necessary at this point
      // Related issue: https://github.com/vuejs/core/issues/3024
      this.priorKnowledgeValue = markRaw(selectedElements)
      const priorKnowledgeElements = []
      this.priorKnowledgeValue.forEach((elem) => {
        const element = this.diagram.get('moddle').create('verDatAs:PriorKnowledge', {
          elementId: elem.businessObject.objectId
        })
        priorKnowledgeElements.push(element)
      })
      this.changeInput(parameterName, priorKnowledgeElements)
    },
    /**
     * Attempt to start a collaboration.
     */
    startCollaboration() {
      if (
        !this.collaborationUserName ||
        this.collaborationUserName === '' ||
        !this.collaborationUserPassword ||
        this.collaborationUserPassword === ''
      ) {
        return
      }
      this.startCollaborationInProgress = true
      const url = this.backendUrl + '/api/v1/auth/login'
      const request = {
        actorAccountName: this.collaborationUserName,
        password: this.collaborationUserPassword
      }
      // Retrieve a token for the administrator
      axios.post(url, request).then((data) => {
        const token = data.data.token
        // Store token for the usage in the collaboration monitoring
        this.collaborationStore.adminToken = token
        const authHeader = {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: 'Bearer ' + token
        }
        const assistanceUrl = this.backendUrl + '/api/v1/assistance'
        const assistanceRequest = {
          type: 'peer_collaboration',
          language: 'de',
          parameters: [
            {
              key: 'initiator',
              value: this.collaborationUserName
            },
            {
              key: 'collaborators',
              value: this.selectedCollaborationMembers
            }
          ]
        }
        // Request to start the collaboration
        axios.post(assistanceUrl, assistanceRequest, { headers: authHeader }).then((data) => {
          const startedAssistanceArray = data?.data?.assistance
          startedAssistanceArray?.forEach((assistance) => {
            if (assistance.aId) {
              this.collaborationStore.collaborations.push(assistance.aId)
            }
          })
          this.collaborationStartSuccessfully = true
          setTimeout(() => {
            this.startCollaborationInProgress = false
            this.collaborationStartSuccessfully = false
          }, 20000)
        })
      })
    }
  }
}
</script>

<template>
  <div id="propertiesPanel" v-if="elementSelected && elementSelected.id && !canViewOnly">
    <!-- NOTE: Removed .row as we do not use Bootstrap within the editor template -->
    <div class="row">
      <div class="col-xs-12">
        <h2 class="mb-3">
          {{
            elementSelected.businessObject && elementSelected.businessObject.name
              ? elementSelected.businessObject.name
              : elementSelected.id
          }}
        </h2>
        <hr />

        <div class="form-horizontal row">
          <template v-if="parameters && parameters.length > 0">
            <div class="form-group" v-for="(parameter, index) in parameters" :key="'parameterInput' + index">
              <template v-if="basicTypes.includes(parameter.type)">
                <div class="col-xs-12">
                  <label :for="parameter.name" class="control-label">{{ parameter.name }}</label>
                </div>
                <div class="col-xs-12">
                  <BasicTypes
                    :element="elementSelected"
                    :parameter="parameter"
                    v-if="basicTypes.includes(parameter.type)"
                    @changeInput="changeInput"
                  ></BasicTypes>
                </div>
              </template>
              <template v-if="customTypes.includes(parameter.type)">
                <template v-if="parameter.type === 'verDatAs:PriorKnowledge'">
                  <div class="col-xs-12">
                    <label :for="parameter.name" class="control-label">{{ parameter.name }}</label>
                  </div>
                  <div class="col-xs-12">
                    <!-- Options retrieved from https://vue-multiselect.js.org/#sub-custom-option-template -->
                    <VueMultiselect
                      label="id"
                      track-by="id"
                      placeholder="Select prior knowledge"
                      :model-value="priorKnowledgeValue"
                      :id="parameter.name"
                      :name="parameter.name"
                      :multiple="true"
                      :options="allGraphElements"
                      :custom-label="customLabel"
                      :show-labels="false"
                      @update:model-value="updateSelectedPriorKnowledge($event, parameter.name)"
                    >
                    </VueMultiselect>
                  </div>
                </template>
                <template v-if="parameter.type === 'verDatAs:ContentPage'">
                  <div class="col-xs-12">
                    <label :for="parameter.name" class="control-label">{{ parameter.name }}</label>
                  </div>
                  <div class="col-xs-12">
                    <ul
                      class="mt-2 ps-4"
                      v-if="
                        elementSelected &&
                        elementSelected.businessObject &&
                        elementSelected.businessObject[parameter.name] &&
                        elementSelected.businessObject[parameter.name].length > 0
                      "
                    >
                      <li
                        v-for="(contentPage, pageIndex) in elementSelected.businessObject[parameter.name]"
                        :key="'contentPage' + pageIndex"
                      >
                        {{ contentPage.title ? contentPage.title : 'ContentPage ' + (pageIndex + 1) }}
                      </li>
                    </ul>
                  </div>
                </template>
              </template>
              <div
                class="col-xs-12"
                v-if="!basicTypes.includes(parameter.type) && !customTypes.includes(parameter.type)"
              >
                <p class="alert alert-info py-3 mt-0 mb-2">
                  Der Parameter <span style="font-style: italic">{{ parameter.name }}</span> wird bald unterstützt.
                </p>
              </div>
            </div>
          </template>
          <div class="col-xs-12" v-else>
            <div class="alert alert-info">Für dieses Element können keine Attribute definiert werden.</div>
          </div>
        </div>
        <div class="form-horizontal row" v-if="members && members.length > 0">
          <hr />
          <div class="col-xs-12">
            <h6>Kollaboration starten ({{ selectedCollaborationMembers.length }} Nutzer)</h6>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <label for="collborationUser" class="control-label"> Admin-Username </label>
              <input id="collborationUser" class="form-control" type="text" v-model="collaborationUserName" />
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <label for="collborationPassword" class="control-label"> Admin-Passwort </label>
              <input
                id="collborationPassword"
                class="form-control"
                type="password"
                v-model="collaborationUserPassword"
              />
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <div class="form-check" v-for="member in collaborationMembers" :key="member.id">
                <input
                  :id="'member_' + member.id"
                  class="form-check-input"
                  type="checkbox"
                  v-model="selectedCollaborationMembers"
                  :value="member.id"
                />
                <label :for="'member_' + member.id">{{ member.username }}</label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <div class="alert alert-success mb-0" v-if="collaborationStartSuccessfully">
                Die Kollaboration wurde erfolgreich gestartet.
              </div>
            </div>
            <div class="col-xs-12">
              <button
                class="btn btn-primary mt-2"
                type="button"
                @click="startCollaboration()"
                :disabled="startCollaborationInProgress"
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#propertiesPanel {
  z-index: 6;
  position: absolute;
  top: 45px;
  right: 0;
  height: calc(100% - 90px);
  width: 250px;
  padding: 10px;
  color: #333;
  background: #fafafa;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  overflow-x: hidden;
  overflow-y: scroll;
}

#propertiesPanel h2 {
  text-align: center;
  font-size: 130%;
}

#propertiesPanel label {
  margin-left: 5px;
  margin-bottom: 1px;
  font-size: 85%;
}

.form-horizontal {
  background: none;
  margin-bottom: 0;
}

.form-horizontal .control-label {
  min-height: unset;
}
</style>
