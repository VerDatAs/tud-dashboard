<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Niklas Harbig)

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
import { aggregationOperators, comparisonOperators, Connections } from '@/util/QueryHelpers'
import axios from 'axios'

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
    showAdvancedFilterOptions: false
  }),
  props: {
    backendUrl: String,
    token: String,
    filterAttributes: Array,
    operationAttributes: Array
  },
  methods: {
    /**
     * Adjust the filter on attribute selection.
     *
     * @param attribute
     * @param index
     */
    adjustFilterStructure(attribute, index) {
      // Reset several variables
      this.filterBuilder[index].comparisonOperators = comparisonOperators
      if (attribute === '') {
        this.inputType[index] = 'string'
      }

      const attributeType = this.filterAttributes.find((element) => element.attribute === attribute).type

      // Declare an input type and comparison operators based on the attribute types
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
    /**
     * Build the query from the user input.
     */
    queryBuilder() {
      // Reset several variables
      this.queryOutput = null
      const errorMessages = []

      // Basic structure of the query
      let input = {
        search: {},
        operations: []
      }

      // Iterate over the filters created by the user
      for (const filter of this.filterBuilder) {
        // Check, if the filter is completely specified
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

        // Set the current connection for the filter
        const connectionKey = this.currentConnection
        if (!input.search[connectionKey]) {
          input.search[connectionKey] = []
        }

        // Special case for specific operators ($in, $nin)
        if (filter.selectedComparison === '$in' || filter.selectedComparison === '$nin') {
          // Convert the user input for these operators to an array
          const convertedValue = filter.selectedValueFilter.split(',').map((element) => {
            if (!isNaN(element)) {
              return Number(element)
            } else {
              return element.trim()
            }
          })
          // Create an adjusted filter object
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

      // Check, if skip was specified by the user and if yes, add it to the query
      if (this.querySkip !== '') {
        const skipObject = {
          ['$skip']: Number(this.querySkip)
        }
        input.operations.push(skipObject)
      }

      // Check, if limit was specified by the user and if yes, add it to the query
      if (this.queryLimit !== '') {
        const limitObject = {
          ['$limit']: Number(this.queryLimit)
        }
        input.operations.push(limitObject)
      }

      // Check, if group was specified by the user and if yes, add it to the query
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

      // Check, if sort was specified by the user and if yes, add it to the query
      if (this.querySort.selectedAttribute !== '' && this.querySort.selectedDirection !== '') {
        const sortObject = {
          ['$sort']: {
            [this.querySort.selectedAttribute]: Number(this.querySort.selectedDirection)
          }
        }
        input.operations.push(sortObject)
      }

      // Iterate over the operations created by the user
      for (const operation of this.operationBuilder) {
        // Check, if the operation is completely specified
        if (operation.selectedOperation === '' || operation.selectedAttribute === '') {
          const currentIndex = this.operationBuilder.indexOf(operation)
          errorMessages.push(
            'Die ' +
              (currentIndex + 1) +
              '. Operation ist nicht völlständig. Bitte vervollständigen oder Operation komplett entfernen!'
          )
        }

        // Add the operation to the query based on whether the group object already exists or not
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

      // Return, when errors were found
      if (errorMessages.length > 0) {
        this.$emit('setErrorMessages', errorMessages)
        return
      }

      this.$emit('sendQuery', input)
    },
    /**
     * Build an object for a filter.
     *
     * @param filter
     */
    buildFilterQueryObject(filter) {
      let filterValue = filter.selectedValueFilter

      // If the value is not an array, but a number, then convert it into a number
      if (!Array.isArray(filterValue) && !isNaN(filterValue)) {
        filterValue = Number(filterValue)
      }

      // If the attribute for the filter is 'timestamp', then convert the value into a date
      if (filter.selectedAttribute === 'timestamp') {
        filterValue = new Date(filterValue).toISOString().substring(0, 16)
      }

      // If the filter has the input type boolean, then convert into a boolean
      if (filter.inputType === 'boolean') {
        filterValue = Boolean(filterValue)
      }

      return {
        [filter.selectedAttribute]: {
          [filter.selectedComparison]: filterValue
        }
      }
    },
    /**
     * Build an object for an operation.
     *
     * @param operation
     */
    buildOperationQueryObject(operation) {
      const prefix = operation.selectedOperation.split('$')[1]
      return {
        [prefix + 'Value']: {
          [operation.selectedOperation]: '$' + operation.selectedAttribute
        }
      }
    },
    /**
     * Add an operation.
     */
    addOperationBuilder() {
      this.operationBuilder.push({ selectedOperation: '', selectedAttribute: '' })
    },
    /**
     * Remove an operation.
     */
    removeOperationBuilder(index) {
      this.operationBuilder.splice(index, 1)
    },
    /**
     * Add a filter with a specific index and connection type.
     *
     * @param index
     * @param connection
     */
    addFilterBuilder(index = 0, connection = Connections.AND) {
      this.currentConnection = connection
      this.filterBuilder.push({
        selectedAttribute: '',
        selectedComparison: '',
        comparisonOperators: this.comparisonOperators,
        suggestions: []
      })
      // Add the connection as a text in the UI
      if (this.filterBuilder.length > 1) {
        document.getElementById('filter-connection' + index).innerHTML = connection === Connections.AND ? 'AND' : 'OR'
      }
    },
    /**
     * Remove a filter with a specific index.
     *
     * @param index
     */
    removeFilterBuilder(index) {
      this.filterBuilder.splice(index, 1)
      // Remove text with filter connection from the UI
      if (this.filterBuilder.length > 0) {
        document.getElementById('filter-connection' + (index - 1)).innerHTML = ''
      }
    },
    /**
     * Retrieve an attribute from the attribute list.
     *
     * @param attribute
     */
    getAttribute(attribute) {
      return this.filterAttributes.filter((element) => element.attribute === attribute)
    },
    /**
     * Fetch suggestion for an attribute from the backend.
     *
     * @param filter
     */
    getSuggestions(filter) {
      // Omit some cases where no suggestions should be fetched
      if (
        !filter.selectedAttribute ||
        filter.selectedAttribute === 'timestamp' ||
        this.getAttribute(filter.selectedAttribute)[0].type === 'number' ||
        this.getAttribute(filter.selectedAttribute)[0].type === 'boolean'
      ) {
        return
      }

      // Prepare the request
      const currentFilterValue = filter.selectedValueFilter ? filter.selectedValueFilter : ''
      const url =
        this.backendUrl + '/api/v2/statement/' + filter.selectedAttribute + '/suggestions?suggest=' + currentFilterValue

      filter.suggestions = []

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      axios
        .get(url, { headers: authHeader })
        .then((result) => {
          console.log('Fetch suggestions for xAPI statement attribute', result)
          filter.suggestions = result.data
        })

        .catch((err) => {
          console.error(err)
        })
    },
    /**
     * Set the selected suggestion and hide the suggestion list.
     *
     * @param filter
     * @param suggestion
     */
    setSuggestion(filter, suggestion) {
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

    <div class="add-builder" title="Filter hinzufügen" v-show="filterBuilder.length === 0" @click="addFilterBuilder()">
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
              filter.selectedComparison === '$in' || filter.selectedComparison === '$nin' ? 'string' : filter.inputType
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

        <div title="Filter entfernen" v-show="index === filterBuilder.length - 1" @click="removeFilterBuilder(index)">
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

        <div title="Operation hinzufügen" v-show="index === operationBuilder.length - 1" @click="addOperationBuilder()">
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
