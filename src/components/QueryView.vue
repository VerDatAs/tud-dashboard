<script>
import axios from 'axios'
import { comparisonOperators, aggregationOperators, queryExamples, Connections } from '@/util/QueryHelpers'

//Maybe transform eq and new to $in ?
//erstmal beim builder nur bauen und dann eine Funktion zu Validerung von Builder/Code
//--> dafür wäre aber die generelle Struktur nötig?
//timestamp in code wie dargestllt bzw wie ein Hinweis?

export default {
  data: () => ({
    comparisonOperators,
    aggregationOperators,
    queryExamples,
    currentComparisonOperators: comparisonOperators,
    connections: Connections,
    currenConnection: Connections.AND,
    filterBuilder: [],
    operationBuilder: [],
    textareaInput: null,
    filterAttributes: [],
    operationAttributes: [],
    selectedAttribute: null,
    selectedComparison: null,
    selectedValueFilter: null,
    queryGroup: '',
    queryLimit: '',
    querySkip: '',
    querySort: { selectedAttribute: '', selectedDirection: '' },
    queryOutput: null,
    result: null,
    showAdvancedFilterOptions: false,
    errorMessages: [],
    inputType: ['string'],
    //inputStep: 'string',
    showCode: false,
    showQuery: false
  }),
  props: {
    backendUrl: String,
    token: String
  },
  created() {
    this.fetchSchema()
  },
  methods: {
    adjustInputOptions(attribute, index) {
      this.currentComparisonOperators = comparisonOperators

      if (attribute === '') this.inputType[index] = 'string'

      const attributeType = this.filterAttributes.find((element) => element.attribute === attribute).type

      if (attributeType === 'number') {
        this.inputType[index] = 'number'
        //this.inputStep = 'any'
      } else if (attribute === 'timestamp') {
        this.inputType[index] = 'datetime-local'
        this.currentComparisonOperators = comparisonOperators.filter(
          (operator) => operator.value !== '$in' && operator.value !== '$nin'
        )
      } else {
        this.inputType[index] = 'string'
        //TODO: Determine if helpful or not
        this.currentComparisonOperators = comparisonOperators.filter(
          (operator) =>
            operator.value !== '$lt' &&
            operator.value !== '$lte' &&
            operator.value !== '$gt' &&
            operator.value !== '$gte'
        )
      }
      this.filterAttributes[index].selectedComparison = ''
      this.filterAttributes[index].selectedValueFilter = null
    },
    userHints() {
      filterBuilder[index].selectedComparison === '$in' || filterBuilder[index].selectedComparison === '$nin'
        ? 'Bei diesem Operator muss eine Liste nach folgendem Schema angegeben werden: Tom, Tim, Thomas, ...'
        : ''
    },
    fetchSchema() {
      const backendUrl = 'http://127.0.0.1:8000' //this.backendUrl
      const url = backendUrl + '/api/v1/attributes-statements'

      //is later changed to Bearer Authentication with this.token
      const auth = {
        username: 'testuser',
        password: 'test123'
      }

      axios
        .get(url, { auth: auth })
        .then((result) => {
          console.log('Fetch xAPI statements schema', result)
          this.filterAttributes = result.data

          for (const attribute of result.data) {
            if (attribute.type === 'number' || attribute.type === 'integer') {
              attribute.type = 'number'
              this.operationAttributes.push(attribute)
            }
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    queryBuilder() {
      console.log('Filter Builder: ', this.filterBuilder)
      console.log('Operation Builder: ', this.operationBuilder)

      this.result = null
      this.queryOutput = null
      this.errorMessages = []

      let input = {
        search: {},
        operations: []
      }

      for (const filter of this.filterBuilder) {
        if (
          filter.selectedAttribute === '' ||
          filter.selectedComparison === '' ||
          filter.selectedValueFilter === '' ||
          filter.selectedValueFilter === undefined
        ) {
          const currentIndex = this.filterBuilder.indexOf(filter)
          this.errorMessages.push(
            'Der ' +
              (currentIndex + 1) +
              '. Filter ist nicht völlständig. Bitte vervollständigen oder Filter komplett entfernen!'
          )
          return
        }

        const connectionKey = this.currenConnection
        if (!input.search[connectionKey]) input.search[connectionKey] = []

        if (filter.selectedComparison === '$in' || filter.selectedComparison === '$nin') {
          const convertedValue = filter.selectedValueFilter.split(',').map((element) => {
            if (!isNaN(element)) {
              return Number(element)
            } else {
              return element.trim()
            }
          })
          const adjustedFilter = {
            selectedAttribute: filter.selectedAttribute,
            selectedComparison: filter.selectedComparison,
            selectedValueFilter: convertedValue
          }
          console.log(this.buildFilterQueryObject(adjustedFilter))
          input.search[connectionKey].push(this.buildFilterQueryObject(adjustedFilter))
        } else {
          input.search[connectionKey].push(this.buildFilterQueryObject(filter))
        }
      }

      console.log(input.search)

      if (this.querySkip !== '') {
        const skipObject = {
          ['$skip']: Number(this.querySkip)
        }
        input.operations.push(skipObject)
      }

      if (this.queryLimit !== '') {
        const limitObject = {
          ['$limit']: Number(this.queryLimit)
        }
        input.operations.push(limitObject)
      }

      //TODO: check which things shouldnt be in a query together --> for example no operations when limit, skip etc.

      //needed to perform aggregation operations like min, max etc. in the aggregation pipeline of MongoDB

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

      if (this.querySort.selectedAttribute !== '' && this.querySort.selectedDirection !== '') {
        const sortObject = {
          ['$sort']: {
            [this.querySort.selectedAttribute]: Number(this.querySort.selectedDirection)
          }
        }
        input.operations.push(sortObject)
      }

      for (const operation of this.operationBuilder) {
        if (operation.selectedOperation === '' || operation.selectedAttribute === '') {
          const currentIndex = this.operationBuilder.indexOf(operation)
          this.errorMessages.push(
            'Die ' +
              (currentIndex + 1) +
              '. Operation ist nicht völlständig. Bitte vervollständigen oder Operation komplett entfernen!'
          )
          return
        }

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

      this.queryOutput = input

      this.query(input)
    },
    buildFilterQueryObject(filter) {
      let filterValue = filter.selectedValueFilter

      console.log(filterValue)
      if (!Array.isArray(filterValue) && !isNaN(filterValue)) {
        filterValue = Number(filterValue)
      }

      if (filter.selectedAttribute === 'timestamp') {
        filterValue = new Date(filterValue).toISOString().substring(0, 16)
      }

      console.log(filterValue)

      const filterObject = {
        [filter.selectedAttribute]: {
          [filter.selectedComparison]: filterValue
        }
      }
      return filterObject
    },
    buildOperationQueryObject(operation) {
      const prefix = operation.selectedOperation.split('$')[1]
      const operationObject = {
        [prefix + 'Value']: {
          [operation.selectedOperation]: '$' + operation.selectedAttribute
        }
      }

      return operationObject
    },
    queryCode(input) {
      //hier irgendwann vielleicht Transformationen für den User damit nicht komplett die MongoDB Syntax hier genutzt werden muss
      this.query(JSON.parse(input))
    },
    query(input) {
      const validQuery = this.validateQuery(input)

      if (!validQuery) {
        this.result = null
        return
      }

      const backendUrl = 'http://0.0.0.0:8000' //needs to be changed later http://0.0.0.0:8000
      const queryUrl = backendUrl + '/api/v1/query-statements'
      const auth = {
        username: 'testuser',
        password: 'test123'
      }

      this.result = 'Searching...'

      axios
        .post(queryUrl, input, {
          auth: auth
        })
        .then((result) => {
          console.log('Query result', result)

          //TODO: make more pretty
          let queryResult = result.data
          if (queryResult['aggregate']) {
            /*delete queryResult['aggregate'][0]['_id']
            queryResult = queryResult['aggregate'][0]*/
            queryResult = queryResult['aggregate']
          } else {
            delete queryResult['aggregate']
          }
          this.result = queryResult
        })
        .catch((err) => {
          console.error(err)
          this.result = err
        })
    },
    getAttribute(attribute) {
      return this.filterAttributes.filter((element) => element.attribute === attribute)
    },
    isValidAttribute(attribute) {
      return this.filterAttributes.find((element) => element.attribute === attribute)
    },
    isValidComparisonOperator(value) {
      return this.comparisonOperators.find((element) => element.value === value)
    },
    isValidValue(value, attribute, operator) {
      //theoretisch kein check auf null weil davor schon geschaut ob valides Attribut?
      const attributeObject = this.getAttribute(attribute)[0]

      //TODO: check special case if attribute = timestamp

      if (operator === '$in' || operator === '$nin') {
        console.log('in')
        if (Array.isArray(value)) {
          for (const el of value) {
            if (typeof el !== attributeObject.type) {
              this.errorMessages.push('Value ' + el + ' is not of the right type. Should be ' + attributeObject.type)
              return false
            }
          }
          return true
        } else {
          this.errorMessages.push('Value ' + value + ' is not of the right type. Should be a list.')
          return false
        }
      }

      if (typeof value !== attributeObject.type) {
        this.errorMessages.push('Value ' + value + ' is not of the right type. Should be ' + attributeObject.type)
        return false
      }

      return true
    },
    validateFilters(filter) {
      console.log(filter)
      if (Object.keys(filter).length === 1) {
        const filterElement = Object.keys(filter)[0]
        const validConnections = ['$and', '$or']

        if (validConnections.indexOf(filterElement) > -1) {
          if (!Array.isArray(filter[filterElement])) {
            this.errorMessages.push('The ' + filterElement + ' connection should be an array.')
            return
          }

          for (const element of filter[filterElement]) {
            this.validateFilters(element)
          }
        } else {
          let found = this.isValidAttribute(filterElement)
          if (!found) {
            this.errorMessages.push('The value ' + filterElement + ' in the search object is not valid.')
            return
          }

          let value = filter[filterElement]
          let comparisonOperator
          if (typeof filter[filterElement] === 'object') {
            comparisonOperator = Object.keys(filter[filterElement])[0]
            found = this.isValidComparisonOperator(comparisonOperator)
            if (!found) {
              this.errorMessages.push('The used comparison operator ' + comparisonOperator + '  is not valid.')
              return
            }

            value = filter[filterElement][comparisonOperator]
          }

          const validValue = this.isValidValue(value, filterElement, comparisonOperator)
          if (!validValue) return
        }
      } else {
        this.errorMessages.push('Element ' + filter + ' should only have one entry.')
      }
    },
    validateQuery(query) {
      this.errorMessages = []

      if (typeof query.search !== 'object') {
        this.errorMessages.push('The search key should be an object.')
        return false
      }

      if (!Array.isArray(query.operations)) {
        this.errorMessages.push('The operation key should be a list.')
        return false
      }

      //theoretisch wenn man mongodb beherrscht und weiß wann in filter rein kommt kann ier alles geschrieben werden
      if (Object.keys(query.search).length > 0) {
        this.validateFilters(query.search)
      }

      //Pürfung Operationen
      for (const operation of query.operations) {
        if ('$skip' in operation) {
          if (!isNaN(operation['$skip']) && operation['$skip'] >= 0) {
            operation['$skip'] = Number(operation['$skip'])
          } else {
            this.errorMessages.push(
              'The value ' + operation['$skip'] + ' of the $skip key should be a valid and positive number'
            )
          }
        }

        if ('$limit' in operation) {
          if (!isNaN(operation['$limit']) && operation['$limit'] >= 0) {
            operation['$limit'] = Number(operation['$limit'])
          } else {
            this.errorMessages.push(
              'The value ' + operation['$limit'] + ' of the $limit key should be a valid and positive number'
            )
          }
        }

        if ('$group' in operation) {
          const groupObject = operation['$group']
          if ('_id' in groupObject) {
            const idValue = groupObject['_id'].split('$')[1]
            const found = this.isValidAttribute(idValue)
            if (!found && groupObject['_id'] !== '')
              this.errorMessages.push('The value ' + idValue + ' for the _id key in $group is not valid.')
          } else {
            this.errorMessages.push('The _id key-value pair for the $group key is missing.')
          }

          for (const element in groupObject) {
            if (element !== '_id') {
              const validKeys = this.aggregationOperators.map((element) => element.value)

              if (Object.keys(groupObject[element]).length > 1) {
                this.errorMessages.push('The key ' + element + ' should only have one entry.')
              } else {
                const aggregationOperator = Object.keys(groupObject[element])[0]

                if (validKeys.indexOf(aggregationOperator) > -1) {
                  const rawAttribute = groupObject[element][aggregationOperator].split('$')[1]
                  const found = this.isValidAttribute(rawAttribute)
                  if (!found)
                    this.errorMessages.push(
                      'The attribute ' + rawAttribute + ' used for the ' + aggregationOperator + ' key is not valid.'
                    )
                } else {
                  this.errorMessages.push(
                    'The key ' + Object.keys(groupObject[element])[0] + ' is not allowed in this context'
                  )
                }
              }
            }
          }
        }

        if ('$sort' in operation) {
          //sort can have multiple elements --> think about saying that or not?
          const sortObject = operation['$sort']

          for (const sortElement in sortObject) {
            const found = this.isValidAttribute(sortElement)
            if (!found)
              this.errorMessages.push('The attribute ' + sortElement + ' used for the $sort key is not valid.')

            if (sortObject[sortElement] !== 1 && sortObject[sortElement] !== -1) {
              this.errorMessages.push('The value of the $sort key can only be 1 or -1, not ' + sortObject[sortElement])
            }
          }
        }
      }

      return this.errorMessages.length === 0
    },
    saveQueryToTextarea() {
      this.textareaInput = JSON.stringify(this.queryOutput, null, 2)
      this.showCode = true
    },
    setQueryExample(index) {
      this.textareaInput = JSON.stringify(this.queryExamples[index].query, null, 2)
    },
    addOperationBuilder() {
      this.operationBuilder.push({ selectedOperation: '', selectedAttribute: '' })
    },
    removeOperationBuilder(index) {
      this.operationBuilder.splice(index, 1)
    },
    addFilterBuilder(index, connection = Connections.AND) {
      this.currenConnection = connection
      this.filterBuilder.push({ selectedAttribute: '', selectedComparison: '' })
      if (this.filterBuilder.length > 1)
        document.getElementById('connection' + index).innerHTML = connection === Connections.AND ? 'AND' : 'OR'
    },
    removeFilterBuilder(index) {
      this.filterBuilder.splice(index, 1)
      if (this.filterBuilder.length > 0) document.getElementById('connection' + (index - 1)).innerHTML = ''
    }
  }
}
</script>

<template>
  <div id="query">
    <div id="queryContent" class="container py-4">
      <h2>
        {{ showCode ? 'Query Code' : 'Query Builder' }}
        <button
          @click="showCode = !showCode"
          id="toggleQueryView"
          :title="showCode ? 'Wechsel zum Query Builder' : 'Wechsel zum Code Editor'"
        >
          <font-awesome-icon size="sm" :icon="showCode ? 'list' : 'code'" />
        </button>
      </h2>

      <div id="errorMessages">
        <p v-for="(message, index) in errorMessages" :key="index">{{ message }}</p>
      </div>

      <div v-show="showCode" id="code">
        <textarea id="textareaCode" placeholder="Schreibe deine Suche hier rein..." v-model="textareaInput"></textarea>
        <div>
          <label for="exampleSelect">Beispiele:</label>
          <select id="exampleSelect" v-model="currentQueryExample" @change="setQueryExample(currentQueryExample)">
            <option v-for="(example, index) in queryExamples" :key="index" :value="index">
              {{ example.name }}
            </option>
          </select>
          <button title="Query xAPI statements" id="queryCodeButton" @click="queryCode(textareaInput)">Suche</button>
        </div>
      </div>

      <div v-show="!showCode" id="builder">
        <h4>
          Filter
          <font-awesome-icon
            class="icon"
            icon="circle-info"
            size="md"
            title="Hier können Filter zum filtern der xAPI Statements hinzugefügt werden."
          />
        </h4>

        <div title="Filter hinzufügen" v-show="filterBuilder.length === 0" @click="addFilterBuilder(index)">
          <font-awesome-icon class="icon" icon="circle-plus" size="lg" />
        </div>

        <div class="filter-builder" v-for="(builder, index) in filterBuilder" :key="index">
          <div class="builder" :id="'filter' + index">
            <select
              class="selectAttributes"
              v-model="filterBuilder[index].selectedAttribute"
              @change="adjustInputOptions(filterBuilder[index].selectedAttribute, index)"
            >
              <option value="" disabled selected>Auswahl Attribut</option>
              <option v-for="(attribute, index) in filterAttributes" :key="index" :value="attribute.attribute">
                {{ attribute.attribute }}
              </option>
            </select>

            <select v-model="filterBuilder[index].selectedComparison">
              <option value="" disabled selected>Auswahl Vergleichsoperator</option>
              <option v-for="(operator, index) in currentComparisonOperators" :key="index" :value="operator.value">
                {{ operator.displayName }}
              </option>
            </select>

            <input
              class="textinput"
              v-model="filterBuilder[index].selectedValueFilter"
              :type="
                filterBuilder[index].selectedComparison === '$in' || filterBuilder[index].selectedComparison === '$nin'
                  ? 'string'
                  : inputType[index]
              "
              :step="inputType[index] === 'number' ? 'any' : ''"
              :min="inputType[index] === 'number' ? 0 : ''"
              placeholder="Eingabe Attributwert..."
            />

            <div class="filterActions">
              <div
                title="Filter hinzufügen"
                v-show="index === filterBuilder.length - 1 && index !== 0"
                @click="addFilterBuilder(index, currenConnection)"
              >
                <font-awesome-icon class="icon" icon="circle-plus" size="lg" />
              </div>

              <button
                v-show="index === 0 && filterBuilder.length === 1"
                @click="addFilterBuilder(index)"
                title="Filter durch AND-Verbindungen verknüpfen"
              >
                AND
              </button>
              <button
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
                <font-awesome-icon class="icon" icon="circle-xmark" size="lg" />
              </div>
            </div>
          </div>
          <div>
            {{
              filterBuilder[index].selectedComparison === '$in' || filterBuilder[index].selectedComparison === '$nin'
                ? 'Bei diesem Operator muss eine Liste nach folgendem Schema angegeben werden: Tom, Tim, Thomas, ...'
                : ''
            }}
          </div>
          <p class="filter-connection" :id="'connection' + index"></p>
        </div>

        <div>
          <h6>
            Weitere Filter Optionen
            <font-awesome-icon
              class="icon"
              :icon="showAdvancedFilterOptions ? 'chevron-down' : 'chevron-right'"
              size="md"
              :title="
                showAdvancedFilterOptions
                  ? 'Klicke hier um weitere Filter Optionen zu verstecken'
                  : 'Klicke hier um weitere Filter Optionen zu öffnen'
              "
              @click="showAdvancedFilterOptions = !showAdvancedFilterOptions"
            />
          </h6>

          <div id="advancedFilter" v-show="showAdvancedFilterOptions">
            <div class="sort-builder">
              <label for="sort-select">Sort:</label>
              <select class="selectAttributes" id="sort-select" v-model="querySort.selectedAttribute">
                <option value="" selected></option>
                <option v-for="(attr, index) in filterAttributes" :key="index" :value="attr.attribute">
                  {{ attr.attribute }}
                </option>
              </select>
              <select v-model="querySort.selectedDirection">
                <option value="" selected></option>
                <option value="1">aufsteigend</option>
                <option value="-1">absteigend</option>
              </select>
            </div>

            <div>
              <label for="queryLimit">Limit:</label>
              <input id="queryLimit" type="number" min="1" v-model="queryLimit" />
              <label for="querySkip">Skip:</label>
              <input id="querySkip" type="number" min="0" v-model="querySkip" />
            </div>

            <label for="group-select">Group:</label>
            <select class="selectAttributes" id="group-select" v-model="queryGroup">
              <option value="" selected></option>
              <option v-for="(attr, index) in filterAttributes" :key="index" :value="attr.attribute">
                {{ attr.attribute }}
              </option>
            </select>
          </div>
        </div>

        <h4>
          Operationen
          <font-awesome-icon
            class="icon"
            icon="circle-info"
            size="md"
            title="Hier können verschieden Operationen zur Aggregation von Daten aus den xAPI Statements hinzugefügt werden."
          />
        </h4>

        <div
          id="addOperation"
          title="Operation hinzufügen"
          v-show="operationBuilder.length === 0"
          @click="addOperationBuilder()"
        >
          <font-awesome-icon class="icon" icon="circle-plus" size="lg" />
        </div>

        <div class="operation-builder" v-for="(builder, index) in operationBuilder" :key="index">
          <div class="builder" :id="'operation' + index">
            <select v-model="operationBuilder[index].selectedOperation">
              <option value="" disabled selected></option>
              <option v-for="(operation, index) in aggregationOperators" :key="index" :value="operation.value">
                {{ operation.displayName }}
              </option>
            </select>

            <select class="selectAttributes" v-model="operationBuilder[index].selectedAttribute">
              <option value="" disabled selected></option>
              <option v-for="(attribute, index) in operationAttributes" :key="index" :value="attribute.attribute">
                {{ attribute.attribute }}
              </option>
            </select>
            <div class="filterActions">
              <div
                title="Operation hinzufügen"
                v-show="index === operationBuilder.length - 1"
                @click="addOperationBuilder()"
              >
                <font-awesome-icon class="icon" icon="circle-plus" size="lg" />
              </div>

              <div title="Operation entfernen" @click="removeOperationBuilder(index)">
                <font-awesome-icon class="icon" icon="circle-xmark" size="lg" />
              </div>
            </div>
          </div>
        </div>

        <div id="queryBuilder">
          <button class="queryButton" title="Query xAPI statements" @click="queryBuilder()">Suche</button>
        </div>
        <div>
          <h6>
            Query
            <font-awesome-icon
              class="icon"
              :icon="showQuery ? 'chevron-down' : 'chevron-right'"
              size="md"
              :title="showQuery ? 'Klicke hier um Query zu verstecken' : 'Klicke hier um Query zu anzuzeigen'"
              @click="showQuery = !showQuery"
            />
          </h6>
          <div>
            <font-awesome-icon
              v-show="showQuery"
              id="share"
              icon="share"
              size="md"
              title="Setze aktuelle Query in Code Editor"
              @click="saveQueryToTextarea()"
            />
          </div>
          <div>
            <pre v-show="showQuery">{{ queryOutput }}</pre>
          </div>
        </div>
      </div>

      <div id="result">
        <p>Ergebnis:</p>
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
#query {
  z-index: 8;
  position: absolute;
  top: 7%;
  left: 7%;
  height: calc(100% - 12%);
  width: calc(100% - 12%);
  background: #eee;
  border: 1px solid #ccc;
  overflow: auto;
}

#queryContent {
  max-width: 100%;
  height: 100%;
}

#code {
  height: 60%;
}

#textareaCode {
  height: 100%;
  width: 100%;
  resize: none;
}

#toggleQueryView {
  float: right;
}

#queryCodeButton {
  float: right;
}

#queryBuilder {
  text-align: right;
}

#result {
  margin-top: 5%;
}

#addOperation {
  max-width: 30px;
}

#share {
  cursor: pointer;
  float: right;
}

.builder {
  white-space: nowrap;
}

.builder > * {
  margin-right: 5px;
  height: 23px;
}

.operation-builder {
  margin-top: 10px;
}

.filterActions {
  display: inline-block;
  white-space: nowrap;
}

.filterActions > * {
  height: 100%;
  margin-right: 5px;
  display: inline-block;
}

.icon {
  cursor: pointer;
}

.filter-connection {
  text-align: center;
}

.selectAttributes {
  width: 20%;
}
</style>
