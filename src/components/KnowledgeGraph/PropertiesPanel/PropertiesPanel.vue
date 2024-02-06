<script>
import axios from 'axios'
import { markRaw } from 'vue'
import VueMultiselect from 'vue-multiselect'
import BasicTypes from './BasicTypes.vue'
import { basicTypes, customTypes, excludedParameters, nonSelectableElements } from '@/util/GraphHelpers'
import { useCollaborationsStore } from '@/stores/collaborations'

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
    referencedTestValue: null,
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
  emits: [
    'changeInput'
  ],
  created() {
    this.collaborationMembers = this.members;
    // select all members by default
    this.selectedCollaborationMembers = this.members.map((member) => member.id);
  },
  watch: {
    // whenever the selected element changes, do something
    elementSelected(newElementSelected, oldElementSelected) {
      if (newElementSelected?.id && !this.canViewOnly) {
        this.retrieveParameters(newElementSelected)
        // load priorKnowledgeElements
        // TODO: Redrawing the diagram will create new ID's and invalidate the parameters set
        // As a solution, maybe use the objectId
        this.parametrizedElement = newElementSelected
        const priorKnowledgeElements =
          this.parametrizedElement?.businessObject?.priorKnowledgeElements?.map(
            (priorKnowledgeElement) => priorKnowledgeElement?.elementId
          ) ?? []
        this.priorKnowledgeValue = markRaw(
          this.allGraphElements.filter((element) => priorKnowledgeElements.includes(element.businessObject.objectId))
        )
        // load referencedTests
        const referencedTestElements =
          this.parametrizedElement?.businessObject?.referencedTests?.map(
            (referencedTest) => referencedTest?.elementId
          ) ?? []
        this.referencedTestValue = markRaw(
          this.allTests.filter((element) => referencedTestElements.includes(element.objectId))
        )
      }
    }
  },
  computed: {
    allGraphElements() {
      return (
        this.diagram
          ?.get('elementRegistry')
          ?.getAll()
          ?.filter((element) => !nonSelectableElements.includes(element.type)) ?? []
      )
    },
    allTests() {
      return this.diagram?.get('canvas')?.getRootElement()?.businessObject?.tests ?? []
    }
  },
  methods: {
    /**
     * Retrieve and return parameter names of a given type definition
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
     * Display the properties panel, insert title, display inputs
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

      // Retrieve parameters of element's type
      this.parameters = []
      this.parameters = this.iterateProperties(typeDefinition, this.parameters)
    },
    // Emitted event of BasicType
    changeInput(parameterName, newValue) {
      this.$emit('changeInput', parameterName, newValue)
    },
    // Custom label for multiselect
    customLabel(element) {
      // This option is used for priorKnowledge, as the elements are displayed in the diagram (.businessObject)
      return element.businessObject.name ? element.businessObject.name : element.businessObject.objectId
    },
    // Update the priorKnowledge multiselect value
    updateSelectedPriorKnowledge(selectedElements, parameterName) {
      // markRaw is necessary at this point
      // related issue: https://github.com/vuejs/core/issues/3024
      this.priorKnowledgeValue = markRaw(selectedElements)
      // TODO: Updating only works with businessObjects, e.g.,
      // const element = this.diagram.get('moddle').create('verDatAs:InteractiveTask')
      // const element = this.diagram.get('elementRegistry').find((element) => element.id === 'InteractiveTask_0k3e3zy').businessObject
      // this.changeInput('priorKnowledgeElements', [element])
      const priorKnowledgeElements = []
      this.priorKnowledgeValue.forEach((elem) => {
        const element = this.diagram.get('moddle').create('verDatAs:PriorKnowledge', {
          elementId: elem.businessObject.objectId
        })
        priorKnowledgeElements.push(element)
      })
      this.changeInput(parameterName, priorKnowledgeElements)
    },
    // Update the referenced test multiselect value
    updateSelectedReferencedTest(selectedElements, parameterName) {
      this.referencedTestValue = markRaw(selectedElements)
      const referencedTestElements = []
      this.referencedTestValue.forEach((elem) => {
        const element = this.diagram.get('moddle').create('verDatAs:ReferencedTest', {
          // Note: In this case, no businessObject exists
          elementId: elem.objectId
        })
        referencedTestElements.push(element)
      })
      this.changeInput(parameterName, referencedTestElements)
    },
    startCollaboration() {
      if (!this.collaborationUserName || this.collaborationUserName === '' || !this.collaborationUserPassword || this.collaborationUserPassword === '') {
        return
      }
      this.startCollaborationInProgress = true
      const url = this.backendUrl + '/api/v1/auth/login'
      const request = {
        actorAccountName: this.collaborationUserName,
        password: this.collaborationUserPassword
      }
      axios.post(url, request).then((data) => {
        console.log('Admin login', data)
        const token = data.data.token
        // store token for usage in collaboration monitoring
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
        axios.post(assistanceUrl, assistanceRequest, { headers: authHeader }).then((data) => {
          console.log('Started collaboration', data)
          const startedAssistanceArray = data?.data?.assistance
          startedAssistanceArray?.forEach((assistance) => {
            if (assistance.aId) {
              this.collaborationStore.collaborations.push(assistance.aId)
            }
          })
          // TODO: Handle error cases (e.g., wrong password)
          this.collaborationStartSuccessfully = true
          setTimeout(() => {
            this.startCollaborationInProgress = false
            this.collaborationStartSuccessfully = false
          }, 20000)
        });
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
                  <!-- .map((element) => element.businessObject)" -->
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
              <template v-if="parameter.type === 'verDatAs:ReferencedTest'">
                <div class="col-xs-12">
                  <label :for="parameter.name" class="control-label">
                    {{ elementSelected.type === 'verDatAs:Topic' ? 'finalTests' : parameter.name }}
                  </label>
                </div>
                <div class="col-xs-12">
                  <!-- Options retrieved from https://vue-multiselect.js.org/#sub-custom-option-template -->
                  <!-- As a businessObject does not exist, a customLabel is not necessary -->
                  <VueMultiselect
                    label="title"
                    track-by="objectId"
                    placeholder="Select referenced test"
                    :model-value="referencedTestValue"
                    :id="parameter.name"
                    :name="parameter.name"
                    :multiple="true"
                    :options="allTests"
                    @update:model-value="updateSelectedReferencedTest($event, parameter.name)"
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
                    class="mt-2 ps-5"
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
            <div class="col-xs-12" v-if="!basicTypes.includes(parameter.type) && !customTypes.includes(parameter.type)">
              <p class="alert alert-info py-3 mb-2">The parameter {{ parameter.name }} will be supported soon.</p>
            </div>
          </div>
        </div>
        <div class="form-horizontal row" v-if="members && members.length > 0">
          <hr>
          <div class="col-xs-12">
            <h6>
              Kollaboration starten ({{ selectedCollaborationMembers.length }} Nutzer)
            </h6>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <label for="collborationUser" class="control-label">
                Admin-Username
              </label>
              <input id="collborationUser" class="form-control" type="text" v-model="collaborationUserName" />
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <label for="collborationPassword" class="control-label">
                Admin-Passwort
              </label>
              <input id="collborationPassword" class="form-control" type="password" v-model="collaborationUserPassword" />
            </div>
          </div>
          <div class="form-group">
            <div class="col-xs-12">
              <div class="form-check" v-for="member in collaborationMembers" :key="member.id">
                <input :id="'member_' + member.id" class="form-check-input" type="checkbox" v-model="selectedCollaborationMembers" :value="member.id"/>
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
              <button class="btn btn-primary mt-2" type="button" @click="startCollaboration()" :disabled="startCollaborationInProgress">Bestätigen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#propertiesPanel {
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
