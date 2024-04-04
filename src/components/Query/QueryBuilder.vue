<script>
import axios from 'axios'
import { comparisonOperators, aggregationOperators, Connections } from '@/util/QueryHelpers'

export default {
  data: () => ({
    comparisonOperators,
    aggregationOperators,
    connections: Connections,
    currentConnection: Connections.AND,
    filterBuilder: [],
    operationBuilder: [],
    showQuery: false,
    queryGroup: '',
    queryLimit: '',
    querySkip: '',
    querySort: { selectedAttribute: '', selectedDirection: '' },
    queryOutput: null,
    showAdvancedFilterOptions: false,
  }),
  props: {
    backendUrl: String,
    token: String,
    filterAttributes: Array,
    operationAttributes: Array
  },
  methods: {
    adjustFilterStructure(attribute, index) {

      // Function to adjust the filter on attribute select

      // reset some things
      this.filterBuilder[index].comparisonOperators = comparisonOperators
      if (attribute === '') this.inputType[index] = 'string'

      const attributeType = this.filterAttributes.find((element) => element.attribute === attribute).type

      // declare and input type and comparison operators based on the attributes types
      if (attributeType === 'number') {
        this.filterBuilder[index].inputType = 'number'
      } else if (attribute === 'timestamp') {
        this.filterBuilder[index].inputType = 'datetime-local'
        this.filterBuilder[index].comparisonOperators = comparisonOperators.filter(
          (operator) => operator.value !== '$in' && operator.value !== '$nin'
        )
      } else if (attributeType === 'boolean') {
        this.filterBuilder[index].inputType = 'boolean'
        this.filterBuilder[index].comparisonOperators = comparisonOperators.filter(
          (operator) => operator.value === '$eq' || operator.value === '$ne'
        )
      } else {
        this.filterBuilder[index].inputType = 'string'
        this.filterBuilder[index].comparisonOperators = comparisonOperators.filter(
          (operator) =>
            operator.value !== '$lt' &&
            operator.value !== '$lte' &&
            operator.value !== '$gt' &&
            operator.value !== '$gte'
        )
      }
      this.filterBuilder[index].selectedComparison = ''
      this.filterBuilder[index].selectedValueFilter = null
    },
    queryBuilder() {

      // Function to build the query from the user inputs

      // reset some things
      this.queryOutput = null
      const errorMessages = []

      // basic structure query
      let input = {
        search: {},
        operations: []
      }

      // iterate over the filters created by the user
      for (const filter of this.filterBuilder) {
        // look if filter is completely specified
        if (
          filter.selectedAttribute === '' ||
          filter.selectedComparison === '' ||
          filter.selectedValueFilter === '' ||
          filter.selectedValueFilter === undefined
        ) {
          const currentIndex = this.filterBuilder.indexOf(filter)
          errorMessages.push(
            'Der ' +
              (currentIndex + 1) +
              '. Filter ist nicht völlständig. Bitte vervollständigen oder Filter komplett entfernen!'
          )
        }

        // set the current connection for the filter
        const connectionKey = this.currentConnection
        if (!input.search[connectionKey]) input.search[connectionKey] = []

        // special case for these operators
        if (filter.selectedComparison === '$in' || filter.selectedComparison === '$nin') {
          // convert user input for these operators to ana rray
          const convertedValue = filter.selectedValueFilter.split(',').map((element) => {
            if (!isNaN(element)) {
              return Number(element)
            } else {
              return element.trim()
            }
          })
          // create an adjusted filter object
          const adjustedFilter = {
            selectedAttribute: filter.selectedAttribute,
            selectedComparison: filter.selectedComparison,
            selectedValueFilter: convertedValue
          }
          input.search[connectionKey].push(this.buildFilterQueryObject(adjustedFilter))
        } else {
          input.search[connectionKey].push(this.buildFilterQueryObject(filter))
        }
      }

      // look if skip was specified by user and if yes add it to the query
      if (this.querySkip !== '') {
        const skipObject = {
          ['$skip']: Number(this.querySkip)
        }
        input.operations.push(skipObject)
      }

      // look if limit was specified by user and if yes add it to the query
      if (this.queryLimit !== '') {
        const limitObject = {
          ['$limit']: Number(this.queryLimit)
        }
        input.operations.push(limitObject)
      }

      // look if group was specified by user and if yes add it to the query      
      let groupOperationExists = false
      if (this.queryGroup !== '') {
        const groupObject = {
          ['$group']: {
            _id: '$' + this.queryGroup
          }
        }
        input.operations.push(groupObject)
        groupOperationExists = true
      }

      // look if sort was specified by user and if yes add it to the query  
      if (this.querySort.selectedAttribute !== '' && this.querySort.selectedDirection !== '') {
        const sortObject = {
          ['$sort']: {
            [this.querySort.selectedAttribute]: Number(this.querySort.selectedDirection)
          }
        }
        input.operations.push(sortObject)
      }

      // iterate over the operations created by the user
      for (const operation of this.operationBuilder) {
        // look if operation is completely specified
        if (operation.selectedOperation === '' || operation.selectedAttribute === '') {
          const currentIndex = this.operationBuilder.indexOf(operation)
          errorMessages.push(
            'Die ' +
              (currentIndex + 1) +
              '. Operation ist nicht völlständig. Bitte vervollständigen oder Operation komplett entfernen!'
          )
        }

        // add operation to query based on whether the group object already exists or not
        if (groupOperationExists) {
          input.operations.forEach((element) => {
            if ('$group' in element) {
              Object.assign(element['$group'], this.buildOperationQueryObject(operation))
            }
          })
        } else {
          const newOperation = this.buildOperationQueryObject(operation)
          const groupObject = {
            ['$group']: {
              _id: '',
              ...newOperation
            }
          }
          input.operations.push(groupObject)
          groupOperationExists = true
        }
      }

      // return from function when errors were found
      if(errorMessages.length > 0) {
        this.$emit('setErrorMessages', errorMessages)
        return
      }

      this.$emit("sendQuery", input)
    },
    buildFilterQueryObject(filter) {

      // Function to build an object for a filter  

      let filterValue = filter.selectedValueFilter

      // if value is not an array and an number, then convert it to a number
      if (!Array.isArray(filterValue) && !isNaN(filterValue)) {
        filterValue = Number(filterValue)
      }

      // if attribute for the filter is 'timestamp' then convert value to date
      if (filter.selectedAttribute === 'timestamp') {
        filterValue = new Date(filterValue).toISOString().substring(0, 16)
      }

      // if filter has input type boolean then convert to boolean
      if (filter.inputType === 'boolean') {
        filterValue = Boolean(filterValue)
      }

      const filterObject = {
        [filter.selectedAttribute]: {
          [filter.selectedComparison]: filterValue
        }
      }
      return filterObject
    },
    buildOperationQueryObject(operation) {

     // Function to build an object for an operation  

      const prefix = operation.selectedOperation.split('$')[1]
      const operationObject = {
        [prefix + 'Value']: {
          [operation.selectedOperation]: '$' + operation.selectedAttribute
        }
      }

      return operationObject
    },
    addOperationBuilder() {
      this.operationBuilder.push({ selectedOperation: '', selectedAttribute: '' })
    },
    removeOperationBuilder(index) {
      this.operationBuilder.splice(index, 1)
    },
    addFilterBuilder(index = 0, connection = Connections.AND) {
      this.currentConnection = connection
      this.filterBuilder.push({
        selectedAttribute: '',
        selectedComparison: '',
        comparisonOperators: this.comparisonOperators,
        suggestions: []
      })
      // add the connection as a text in the UI for the user to see
      if (this.filterBuilder.length > 1)
        document.getElementById('filter-connection' + index).innerHTML = connection === Connections.AND ? 'AND' : 'OR'
    },
    removeFilterBuilder(index) {
      this.filterBuilder.splice(index, 1)
      // remove text with filter connection from UI
      if (this.filterBuilder.length > 0) document.getElementById('filter-connection' + (index - 1)).innerHTML = ''
    },
    getAttribute(attribute) {
      return this.filterAttributes.filter((element) => element.attribute === attribute)
    },
    getSuggestions(filter) {

      // Function to fetch suggestion for an attribute from the backend  

      // Omit some cases where no suggestions should be fetched
      if (!filter.selectedAttribute) return
      if (filter.selectedAttribute === 'timestamp') return
      if (
        this.getAttribute(filter.selectedAttribute)[0].type === 'number' ||
        this.getAttribute(filter.selectedAttribute)[0].type === 'boolean'
      )
        return

      const currentFilterValue = filter.selectedValueFilter ? filter.selectedValueFilter : ''
      const url =
        this.backendUrl + '/api/v2/statement/' + filter.selectedAttribute + '/suggestions?suggest=' + currentFilterValue

      filter.suggestions = []

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      axios
        //.get(url, { auth: { username: this.authUser, password: this.authPassword } })
        .get(url, { headers: authHeader })
        .then((result) => {
          console.log('Fetch suggestions for xAPI statement attribute', result)
          filter.suggestions = result.data
        })

        .catch((err) => {
          console.error(err)
        })
    },
    setSuggestion(filter, suggestion) {
      // Function to set the selected suggestion and hide the suggestion list  
      filter.selectedValueFilter = suggestion
      document.getElementById('suggestions' + this.filterBuilder.indexOf(filter)).classList.add('hide')
    }
  }
}
</script>

<template>
   <form class="py-2" autocomplete="off" @submit.prevent="onSubmit">
        <h4 class="bold-heading">
          Filter
          <font-awesome-icon
            class="icon"
            size="sm"
            icon="circle-info"
            title="Klicke hier für eine Erklärung"
            @click="$emit('openIntro', 'filter')"
          />
        </h4>

        <div
          class="add-builder"
          title="Filter hinzufügen"
          v-show="filterBuilder.length === 0"
          @click="addFilterBuilder()"
        >
          <font-awesome-icon class="icon" icon="circle-plus" size="xl" />
        </div>

        <div v-for="(filter, index) in filterBuilder" :key="index" :id="'filter' + index">
          <div class="flex-center">
            <select v-model="filter.selectedAttribute" @change="adjustFilterStructure(filter.selectedAttribute, index)">
              <option value="" disabled selected>Auswahl Attribut</option>
              <option v-for="(attribute, index) in filterAttributes" :key="index" :value="attribute.attribute">
                {{ attribute.attribute }}
              </option>
            </select>

            <select v-model="filter.selectedComparison">
              <option value="" disabled selected>Auswahl Vergleichsoperator</option>
              <option v-for="(operator, index) in filter.comparisonOperators" :key="index" :value="operator.value">
                {{ operator.displayName }}
              </option>
            </select>

            <div v-if="filter.inputType === 'boolean'">
              <select v-model="filter.selectedValueFilter">
                <option value="" disabled selected></option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>

            <div v-else class="autocomplete">
              <input
                name="filter-input"
                @keyup="getSuggestions(filter)"
                @focus="getSuggestions(filter)"
                v-model="filter.selectedValueFilter"
                :type="
                  filter.selectedComparison === '$in' || filter.selectedComparison === '$nin'
                    ? 'string'
                    : filter.inputType
                "
                :step="filter.inputType === 'number' ? 'any' : ''"
                :min="filter.inputType === 'number' ? 0 : ''"
                placeholder="Eingabe Attributwert..."
              />

              <div
                :class="filter.suggestions.length > 0 ? 'autocomplete-items' : 'autocomplete-items hide'"
                :id="'suggestions' + index"
              >
                <div
                  class="autocomplete-item"
                  v-for="(suggestion, index) in filter.suggestions"
                  :key="index"
                  @click="setSuggestion(filter, suggestion)"
                >
                  {{ suggestion }}
                </div>
              </div>
            </div>

            <button
              class="add-connection"
              v-show="index === 0 && filterBuilder.length === 1"
              @click="addFilterBuilder(index)"
              title="Filter durch AND-Verbindungen verknüpfen"
            >
              AND
            </button>
            <button
              class="add-connection"
              v-show="index === 0 && filterBuilder.length === 1"
              @click="addFilterBuilder(index, connections.OR)"
              title="Filter durch OR-Verbindungen verknüpfen"
            >
              OR
            </button>

            <div
              title="Filter entfernen"
              v-show="index === filterBuilder.length - 1"
              @click="removeFilterBuilder(index)"
            >
              <font-awesome-icon class="icon" icon="circle-xmark" size="xl" />
            </div>

            <div
              title="Filter hinzufügen"
              v-show="index === filterBuilder.length - 1 && index !== 0"
              @click="addFilterBuilder(index, currentConnection)"
            >
              <font-awesome-icon class="icon" icon="circle-plus" size="xl" />
            </div>
          </div>
          <div class="py-1" v-show="filter.selectedComparison === '$in' || filter.selectedComparison === '$nin'">
            Bei diesem Operator muss eine Liste nach folgendem Schema angegeben werden: Tom, Tim, Thomas, ...
          </div>
          <div class="py-1" :id="'filter-connection' + index"></div>
        </div>

        <div class="py-2">
          <div class="flex-center">
            <div>
              <span class="title-with-info">Weitere Filter Optionen</span>
              <font-awesome-icon
                class="icon"
                size="sm"
                icon="circle-info"
                title="Klicke hier für eine Erklärung"
                @click="$emit('openIntro', 'options')"
              />
            </div>

            <font-awesome-icon
              class="icon"
              :icon="showAdvancedFilterOptions ? 'chevron-down' : 'chevron-right'"
              :title="
                showAdvancedFilterOptions
                  ? 'Klicke hier um weitere Filter Optionen zu schließen'
                  : 'Klicke hier um weitere Filter Optionen anzuzeigen'
              "
              @click="showAdvancedFilterOptions = !showAdvancedFilterOptions"
            />
          </div>

          <div v-show="showAdvancedFilterOptions">
            <div class="flex-center py-2">
              <div>
                <label for="sort-select">Sort:</label>
                <select id="sort-select" v-model="querySort.selectedAttribute">
                  <option value="" selected></option>
                  <option v-for="(attr, index) in filterAttributes" :key="index" :value="attr.attribute">
                    {{ attr.attribute }}
                  </option>
                </select>
              </div>

              <select v-model="querySort.selectedDirection">
                <option value="" selected></option>
                <option value="1">aufsteigend</option>
                <option value="-1">absteigend</option>
              </select>
            </div>

            <div class="flex-center py-2">
              <div>
                <label for="queryLimit">Limit:</label>
                <input id="queryLimit" type="number" min="1" v-model="queryLimit" />
              </div>
              <div>
                <label for="querySkip">Skip:</label>
                <input id="querySkip" type="number" min="0" v-model="querySkip" />
              </div>
            </div>

            <div>
              <label for="group-select">Group:</label>
              <select id="group-select" v-model="queryGroup">
                <option value="" selected></option>
                <option v-for="(attr, index) in filterAttributes" :key="index" :value="attr.attribute">
                  {{ attr.attribute }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="py-2">
          <h4 class="bold-heading">
            Operationen
            <font-awesome-icon
              class="icon"
              size="sm"
              icon="circle-info"
              title="Klicke hier für eine Erklärung"
              @click="$emit('openIntro', 'operations')"
            />
          </h4>

          <div
            class="add-builder"
            title="Operation hinzufügen"
            v-show="operationBuilder.length === 0"
            @click="addOperationBuilder()"
          >
            <font-awesome-icon class="icon" icon="circle-plus" size="xl" />
          </div>

          <div
            class="flex-center py-2"
            v-for="(operation, index) in operationBuilder"
            :key="index"
            :id="'operation' + index"
          >
            <select v-model="operation.selectedOperation">
              <option value="" disabled selected></option>
              <option v-for="(aggregation, index) in aggregationOperators" :key="index" :value="aggregation.value">
                {{ aggregation.displayName }}
              </option>
            </select>

            <select v-model="operation.selectedAttribute">
              <option value="" disabled selected></option>
              <option v-for="(attribute, index) in operationAttributes" :key="index" :value="attribute.attribute">
                {{ attribute.attribute }}
              </option>
            </select>

            <div title="Operation entfernen" @click="removeOperationBuilder(index)">
              <font-awesome-icon class="icon" icon="circle-xmark" size="xl" />
            </div>

            <div
              title="Operation hinzufügen"
              v-show="index === operationBuilder.length - 1"
              @click="addOperationBuilder()"
            >
              <font-awesome-icon class="icon" icon="circle-plus" size="xl" />
            </div>
          </div>
        </div>

        <div class="py-3">
          <button title="Absenden der erstellten Abfrage" class="float-right" @click="queryBuilder()">Suche</button>
        </div>

        <div class="py-2">
          <div class="flex-center">
            <div>
              <span class="title-with-info">Syntax</span>
              <font-awesome-icon
                class="icon"
                size="sm"
                icon="circle-info"
                title="Klicke hier für eine Erklärung"
                @click="$emit('openIntro', 'query')"
              />
            </div>

            <font-awesome-icon
              class="icon"
              :icon="showQuery ? 'chevron-down' : 'chevron-right'"
              :title="
                showQuery
                  ? 'Klicke hier um die aktuelle Abfrage zu verstecken'
                  : 'Klicke hier um die aktuelle Abfrage anzuzeigen'
              "
              @click="showQuery = !showQuery"
            />
          </div>

          <div v-show="showQuery">
            <font-awesome-icon
              id="share"
              icon="share"
              size="lg"
              title="Kopiere aktuelle Abfrage in den Code Editor"
              @click="$emit('forwardQueryToCodeEditor', this.queryOutput)"
            />
            <pre id="current-query">{{ queryOutput }}</pre>
          </div>
        </div>
      </form>
</template>

<style scoped>
#current-query {
  width: 100%;
}

#share {
  cursor: pointer;
  position: relative;
  float: right;
  top: 20px;
  right: 4px;
}

div[id^='filter-connection'] {
  width: 75%;
  font-weight: 900;
  text-align: center;
}

.add-connection {
  width: 45px;
}

.add-builder {
  display: inline-block;
}

.title-with-info {
  font-weight: 600;
  margin-right: 3px;
}
.autocomplete {
  position: relative;
  display: inline-block;
}

.autocomplete-items {
  z-index: 1;
  position: absolute;
  border: 1px solid #d4d4d4;
  border-top: none;
  left: 0;
  min-width: 100%;
}

.autocomplete-item {
  padding: 10px;
  cursor: pointer;
  background-color: #fff;
  border-bottom: 1px solid #d4d4d4;
}

.autocomplete-item :hover {
  background-color: #fff;
}

.hide {
  display: none;
}
</style>
