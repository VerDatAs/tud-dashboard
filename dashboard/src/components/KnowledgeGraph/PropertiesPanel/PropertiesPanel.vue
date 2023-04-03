<script>
import VueMultiselect from 'vue-multiselect'
import BasicTypes from './BasicTypes.vue'
import { basicTypes, customTypes, excludedParameters, nonSelectableElements } from '@/util/GraphHelpers'

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
    referencedTestValue: null
  }),
  props: {
    diagram: Object,
    elementSelected: Object,
    metamodel: Object,
    viewOnly: Boolean
  },
  watch: {
    // whenever the selected element changes, do something
    elementSelected(newElementSelected, oldElementSelected) {
      if (newElementSelected?.id && !this.viewOnly) {
        this.retrieveParameters(newElementSelected)
        // load priorKnowledgeElements
        // TODO: Redrawing the diagram will create new ID's and invalidate the parameters set
        // As a solution, maybe use the objectId
        this.parametrizedElement = newElementSelected
        const priorKnowledgeElements =
          this.parametrizedElement?.businessObject?.priorKnowledgeElements?.map(
            (priorKnowledgeElement) => priorKnowledgeElement?.elementId
          ) ?? []
        this.priorKnowledgeValue = this.allGraphElements.filter((element) =>
          priorKnowledgeElements.includes(element.businessObject.objectId)
        )
        // load referencedTests
        const referencedTestElements =
          this.parametrizedElement?.businessObject?.referencedTests?.map(
            (referencedTest) => referencedTest?.elementId
          ) ?? []
        this.referencedTestValue = this.allTests.filter((element) => referencedTestElements.includes(element.objectId))
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
    closeTileView() {
      this.$emit('closeTileView', true)
    },
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
      this.priorKnowledgeValue = selectedElements
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
      this.referencedTestValue = selectedElements
      const referencedTestElements = []
      this.referencedTestValue.forEach((elem) => {
        const element = this.diagram.get('moddle').create('verDatAs:ReferencedTest', {
          // Note: In this case, no businessObject exists
          elementId: elem.objectId
        })
        referencedTestElements.push(element)
      })
      this.changeInput(parameterName, referencedTestElements)
    }
  }
}
</script>

<template>
  <div id="propertiesPanel" v-if="elementSelected && elementSelected.id && !viewOnly">
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
                  <label :for="parameter.name" class="control-label">{{
                    elementSelected.type === 'verDatAs:Topic' ? 'finalTests' : parameter.name
                  }}</label>
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
            </template>
            <div class="col-xs-12" v-if="!basicTypes.includes(parameter.type) && !customTypes.includes(parameter.type)">
              <p class="alert alert-info py-3 mb-2 fs-5">The parameter {{ parameter.name }} will be supported soon.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TODO: This might be more dynamic in the future -->
      <!-- However, for the moment, we want to allow having "custom" inputs -->
      <!-- 'id', 'name', 'objectId', 'objectLink', 'priorKnowledgeElements', 'level',
        'learningPathElements', 'selfRatingElements', 'modules', 'learningPaths',
        'processingTime', 'structure', 'chapters', 'contentPages', 'interactiveTasks', 'concludeModule' -->
      <!-- <input id="name" class="form-control" type="text" placeholder="name for graph (TODO)" style="display: none;" /> -->

      <!-- text -->
      <!--      <label id="objectIdLabel" for="objectId">objectId</label>-->
      <!--      <input id="objectId" name="objectId" class="form-control" type="text" placeholder="ID (object.id)" style="display: none;" />-->

      <!--      <label id="objectLinkLabel" for="objectLink">objectLink</label>-->
      <!--      <input id="objectLink" name="objectLink" class="form-control" type="text" placeholder="Link (object.moreInfo)" style="display: none;" />-->

      <!--      <hr>-->

      <!--      &lt;!&ndash; number &ndash;&gt;-->
      <!--      <label id="processingTimeLabel" for="processingTime">processingTime</label>-->
      <!--      <input id="processingTime" name="processingTime" class="form-control" type="number" placeholder="processing time in s" style="display: none;" />-->

      <!--      &lt;!&ndash; array &ndash;&gt;-->
      <!--      <label id="selfRatingElementsLabel" for="selfRatingElements">selfRatingElements</label>-->
      <!--      <input id="selfRatingElements" name="selfRatingElements" class="form-control" type="text" placeholder="['ID1', 'ID2']" style="display: none;" />-->

      <!--      <label id="priorKnowledgeElementsLabel" for="priorKnowledgeElements">priorKnowledgeElements</label>-->
      <!--      <input id="priorKnowledgeElements" name="priorKnowledgeElements" class="form-control" type="text" placeholder="['ID1', 'ID2']" style="display: none;" />-->

      <!--      <label id="contentPagesLabel" for="contentPages">contentPages</label>-->
      <!--      <input id="contentPages" name="contentPages" class="form-control" type="text" placeholder="['ID1', 'ID2']" style="display: none;" />-->

      <!--      &lt;!&ndash; select (boolean, enum) &ndash;&gt;-->
      <!--      <label id="levelLabel" for="level">level</label>-->
      <!--      <select id="level" name="level" class="form-control" style="display: none;">-->
      <!--        <option value="">&#45;&#45; level of difficulty &#45;&#45;</option>-->
      <!--        <option value="beginner">beginner</option>-->
      <!--        <option value="experienced">experienced</option>-->
      <!--        <option value="expert">expert</option>-->
      <!--      </select>-->

      <!--      <label id="concludeModuleLabel" for="concludeModule">concludeModule</label>-->
      <!--      <select id="concludeModule" name="concludeModule" class="form-control" style="display: none;">-->
      <!--        <option value="">&#45;&#45; conclude module? &#45;&#45;</option>-->
      <!--        <option value="true">true</option>-->
      <!--        <option value="false">false</option>-->
      <!--      </select>-->

      <!--      &lt;!&ndash; other parameters: TODO &ndash;&gt;-->
      <!--      <label id="structureLabel" for="structure">structure</label>-->
      <!--      <input id="structure" name="structure" class="form-control" type="text" placeholder="TODO" style="display: none;" disabled />-->

      <!--      <label id="learningPathsLabel" for="learningPaths">learningPaths</label>-->
      <!--      <input id="learningPaths" name="learningPaths" class="form-control" type="text" placeholder="TODO" style="display: none;" disabled />-->
    </div>
  </div>
</template>

<style scoped>
#propertiesPanel {
  position: absolute;
  top: 20px;
  right: 20px;
  height: calc(100% - 40px);
  width: 250px;
  padding: 10px;
  color: #333333;
  background: #fafafa;
  border: 1px solid #ccc;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
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
}

.form-horizontal .control-label {
  min-height: unset;
}
</style>
