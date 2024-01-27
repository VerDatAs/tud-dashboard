<script>
import axios from 'axios'
import { comparisonOperators, aggregationOperators, queryExamples, Connections } from '@/util/QueryHelpers'

export default {
  data: () => ({
    comparisonOperators,
    aggregationOperators,
    queryExamples,
    connections: Connections,
    currentConnection: Connections.AND,
    //backendUrl: 'http://127.0.0.1:8000', //needs to be changed later
    //authUser: 'testuser', //later changed to Bearer Authorization with token
    //authPassword: 'test123',
    filterBuilder: [],
    operationBuilder: [],
    textareaInput: null,
    filterAttributes: [],
    operationAttributes: [],
    queryGroup: '',
    queryLimit: '',
    querySkip: '',
    querySort: { selectedAttribute: '', selectedDirection: '' },
    queryOutput: null,
    result: null,
    showAdvancedFilterOptions: false,
    errorMessages: [],
    showCode: false,
    showQuery: false,
    showIntro: false,
    introView: 'builder',
    currentQueryExample: null
  }),
  props: {
    backendUrl: String,
    token: String,
  },
  created() {
    this.fetchSchema()
  },
  mounted() {
    document.getElementById('query-view').addEventListener('click', () => {
      const suggestionList = document.getElementsByClassName('autocomplete-items')
      if (suggestionList.length > 0) {
        for (const list of suggestionList) {
          list.classList.add('hide')
        }
      }
    })
  },
  methods: {
    adjustInputOptions(attribute, index) {
      this.filterBuilder[index].comparisonOperators = comparisonOperators

      if (attribute === '') this.inputType[index] = 'string'

      const attributeType = this.filterAttributes.find((element) => element.attribute === attribute).type

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
    fetchSchema() {
      const url = this.backendUrl + '/api/v2/statement/schema'

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      axios
        //.get(url, { auth: { username: this.authUser, password: this.authPassword } })
        .get(url, { headers: authHeader })
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

        const connectionKey = this.currentConnection
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
          input.search[connectionKey].push(this.buildFilterQueryObject(adjustedFilter))
        } else {
          input.search[connectionKey].push(this.buildFilterQueryObject(filter))
        }
      }

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

      if (!Array.isArray(filterValue) && !isNaN(filterValue)) {
        filterValue = Number(filterValue)
      }

      if (filter.selectedAttribute === 'timestamp') {
        filterValue = new Date(filterValue).toISOString().substring(0, 16)
      }

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

      input = JSON.parse(input)

      //Math Mode

      const supportedOperations = ['add', 'subtract', 'divide', 'multiply']

      let mathMode = false

      for (const operation of input.operations) {
        const arithmeticOperation = Object.keys(operation)[0]
        if (supportedOperations.indexOf(arithmeticOperation) !== -1) {
          mathMode = true
          let isDate = false

          const mathObject = Object.values(operation)[0]

          const requests = []
          const queryUrl = this.backendUrl + '/api/v2/statement/query'

          for (const query of mathObject) {
            let input = {
              search: {},
              operations: []
            }

            if ('filter' in query && query.filter) {
              input.search = { ...query.filter }
            }

            if ('select' in query && query.select && query.select === 'timestamp') {
              query.select = 'originalTimestamp'
              isDate = true
            }

            let operation = null
            if ('operation' in query && query.operation) {
              if (query.operation === '$count') {
                operation = { $count: 'value' }
              } else {
                operation = { $group: { _id: '', value: { [query.operation]: '$' + query.select } } }
              }
            } else {
              operation = { $project: { _id: '', value: '$' + query.select } }
            }

            input.operations.push(operation)

            const authHeader = {
              'Content-Type': 'application/json;charset=UTF-8',
              Authorization: 'Bearer ' + this.token
            }

            requests.push(
              /* axios.post(queryUrl, input, {
                auth: { username: this.authUser, password: this.authPassword }
              }) */
              axios.post(queryUrl, input, { headers: authHeader })
            )
          }

          axios.all(requests).then(
            axios.spread((...results) => {
              //shoudl only have one statement per result

              let res = null
              //immer das erste element in aggregate --> vlt mal noch Validerung etc.
              const operands = results.map((result) => result.data.aggregate[0].value)
              switch (arithmeticOperation) {
                case 'add':
                  res = operands.reduce((accumulator, currentValue) => accumulator + currentValue)
                  break
                case 'subtract':
                  if (isDate) {
                    const date1 = new Date(operands[0])
                    const date2 = new Date(operands[1])
                    const diffTime = Math.abs(date2 - date1)
                    res = diffTime + ' ms'
                    break
                  }

                  res = operands.reduce((accumulator, currentValue) => accumulator - currentValue)
                  break
                case 'divide':
                  res = operands.reduce((accumulator, currentValue) => accumulator / currentValue)
                  break
                default:
                  res = operands.reduce((accumulator, currentValue) => accumulator * currentValue)
              }

              this.result = res
            })
          )
        }
      }

      if (!mathMode) this.query(input)
    },
    query(input) {
      const validQuery = this.validateQuery(input)

      if (!validQuery) {
        this.result = null
        return
      }

      const queryUrl = this.backendUrl + '/api/v2/statement/query'
      this.result = 'Suchen...'

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      axios
        /* .post(queryUrl, input, {
          auth: { username: this.authUser, password: this.authPassword }
        }) */
        .post(queryUrl, input, { headers: authHeader })
        .then((result) => {
          console.log('Query result', result)

          //TODO: make more pretty
          let queryResult = result.data
          if (queryResult['aggregate']) {
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
        if (Array.isArray(value)) {
          for (const el of value) {
            if (typeof el !== attributeObject.type) {
              this.errorMessages.push(
                'Eingabe ' +
                  el +
                  ' ist nicht vom richtigen Typ. Sollte ' +
                  attributeObject.type +
                  ' und nicht ' +
                  typeof el +
                  ' sein.'
              )
              return false
            }
          }
          return true
        } else {
          this.errorMessages.push('Eingabe ' + value + ' ist nicht vom richtigen Typ. Sollte eine List sein.')
          return false
        }
      }

      if (typeof value !== attributeObject.type) {
        this.errorMessages.push(
          'Eingabe ' +
            value +
            ' ist nicht vom richtigen Typ. Sollte ' +
            attributeObject.type +
            ' und nicht ' +
            typeof el +
            ' sein.'
        )
        return false
      }

      return true
    },
    validateFilters(filter) {
      if (Object.keys(filter).length === 1) {
        const filterElement = Object.keys(filter)[0]
        const validConnections = ['$and', '$or']

        if (validConnections.indexOf(filterElement) > -1) {
          if (!Array.isArray(filter[filterElement])) {
            this.errorMessages.push('Die ' + filterElement + ' Verknüpfung sollte eine List sein.')
            return
          }

          for (const element of filter[filterElement]) {
            this.validateFilters(element)
          }
        } else {
          let found = this.isValidAttribute(filterElement)
          if (!found) {
            this.errorMessages.push('Die Eingabe ' + filterElement + ' im search Feld is nicht korrekt.')
            return
          }

          let value = filter[filterElement]
          let comparisonOperator
          if (typeof filter[filterElement] === 'object') {
            comparisonOperator = Object.keys(filter[filterElement])[0]
            found = this.isValidComparisonOperator(comparisonOperator)
            if (!found) {
              this.errorMessages.push('Der verwendete Vergleichsoperator ' + comparisonOperator + '  ist nicht gültig.')
              return
            }

            value = filter[filterElement][comparisonOperator]
          }

          const validValue = this.isValidValue(value, filterElement, comparisonOperator)
          if (!validValue) return
        }
      } else {
        this.errorMessages.push('Element ' + filter + ' sollte nur einen Eintrag haben.')
      }
    },
    validateQuery(query) {
      this.errorMessages = []

      if (typeof query.search !== 'object') {
        this.errorMessages.push('Das search Feld sollte ein Objekt sein.')
        return false
      }

      if (!Array.isArray(query.operations)) {
        this.errorMessages.push('Das operations Feld sollte eine Liste sein.')
        return false
      }

      //theoretisch wenn man mongodb beherrscht und weiß wann in filter rein kommt kann hier alles geschrieben werden
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
              'Eingabe ' + operation['$skip'] + ' vom $skip Feld sollte gültig und eine positive Nummer sein'
            )
          }
        }

        if ('$limit' in operation) {
          if (!isNaN(operation['$limit']) && operation['$limit'] >= 1) {
            operation['$limit'] = Number(operation['$limit'])
          } else {
            this.errorMessages.push(
              'Eingabe ' + operation['$limit'] + ' vom $limit Feld sollte gültig und eine positive Nummer sein'
            )
          }
        }

        if ('$group' in operation) {
          const groupObject = operation['$group']
          if ('_id' in groupObject) {
            const idValue = groupObject['_id'].split('$')[1]
            const found = this.isValidAttribute(idValue)
            if (!found && groupObject['_id'] !== '')
              this.errorMessages.push('Eingabe ' + idValue + ' für das _id Feld im $group Feld ist nicht gültig.')
          } else {
            this.errorMessages.push('Das _id Feld für das $group Feld fehlt.')
          }

          for (const element in groupObject) {
            if (element !== '_id') {
              const validKeys = this.aggregationOperators.map((element) => element.value)

              if (Object.keys(groupObject[element]).length > 1) {
                this.errorMessages.push('Das Feld ' + element + ' sollte nur einen Eintrag haben.')
              } else {
                const aggregationOperator = Object.keys(groupObject[element])[0]

                if (validKeys.indexOf(aggregationOperator) > -1) {
                  const rawAttribute = groupObject[element][aggregationOperator].split('$')[1]
                  const found = this.isValidAttribute(rawAttribute)
                  if (!found)
                    this.errorMessages.push(
                      'Das Attribut ' +
                        rawAttribute +
                        ' benutzt für das ' +
                        aggregationOperator +
                        ' Feld is nicht gültig.'
                    )
                } else {
                  this.errorMessages.push(
                    'Das Feld ' + Object.keys(groupObject[element])[0] + ' ist in diesem Kontext nicht erlaubt.'
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
            if (!found) this.errorMessages.push('Das Attribut ' + sortElement + ' für das $sort Feld is nicht gültig.')

            if (sortObject[sortElement] !== 1 && sortObject[sortElement] !== -1) {
              this.errorMessages.push(
                'Die Eingabe für das $sort Feld kann nur 1 oder -1, nicht ' + sortObject[sortElement] + ' sein.'
              )
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
    addFilterBuilder(index = 0, connection = Connections.AND) {
      this.currentConnection = connection
      this.filterBuilder.push({
        selectedAttribute: '',
        selectedComparison: '',
        comparisonOperators: this.comparisonOperators,
        suggestions: []
      })
      if (this.filterBuilder.length > 1)
        document.getElementById('filter-connection' + index).innerHTML = connection === Connections.AND ? 'AND' : 'OR'
    },
    removeFilterBuilder(index) {
      this.filterBuilder.splice(index, 1)
      if (this.filterBuilder.length > 0) document.getElementById('filter-connection' + (index - 1)).innerHTML = ''
    },
    getSuggestions(filter) {
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
      filter.selectedValueFilter = suggestion
      document.getElementById('suggestions' + this.filterBuilder.indexOf(filter)).classList.add('hide')
    },
    removeErrorMessage(event, index) {
      this.errorMessages.splice(index, 1)
      event.target.closest('.error-message').remove()
    },
    openIntro(viewName) {
      this.showIntro = true
      this.introView = viewName
    }
  }
}
</script>

<template>
  <div id="query-view">
    <div id="query-view-content" class="container py-4">
      <div id="query-view-header" class="py-2">
        <h2 style="display: inline">
          {{ showCode ? 'Code Editor' : 'Query Builder' }}
          <font-awesome-icon
            class="icon"
            size="sm"
            icon="circle-info"
            title="Klicke hier für eine Erklärung"
            @click="openIntro(showCode ? 'code' : 'builder')"
          />
        </h2>
        <button
          @click="showCode = !showCode"
          class="float-right px-2"
          :title="showCode ? 'Wechsel zum Query Builder' : 'Wechsel zum Code Editor'"
          style="width: 40px"
        >
          <font-awesome-icon size="sm" :icon="showCode ? 'list' : 'code'" />
        </button>
      </div>

      <div v-if="showIntro" id="intro-backdrop">
        <div id="intro">
          <div id="intro-close">
            <font-awesome-icon
              id="intro-close-icon"
              class="icon"
              size="lg"
              icon="xmark"
              @click="showIntro = false"
              style="padding: 10px"
              title="Schließen"
            />
          </div>
          <div id="intro-text">
            <div v-if="introView === 'builder'">
              Im Rahmen des Forschungsprojekts VerDatAs entwickelt und erprobt die TU Dresden ein tutoriellen
              Assistenzsystems (TAS), um Lernende in ihrem individuellen Lernprozess zu unterstützen. Die Grundlage
              dieses TAS bildet die Erfassung von Lernverlaufsdaten mittels xAPI Statements, die genutzt werden, um
              Lernenden personalisierte Assistenzangebote zur Verfügung zu stellen. Diese Assistenzangebote sind oft
              vordefiniert und damit hat der Lehrende keine Einsicht, welche Lernverlaufsdaten dafür verwendet werden.
              Im Rahmen meiner Diplomarbeit wurde ein Konzept entwickelt, mit dem Lehrende in der Lage sein sollen,
              solche Lernverlaufsdaten selbständig abzufragen und zu aggregieren. Auf Basis dieses Konzepts wurde dieser
              Prototyp erstellt.

              <h3>Query Builder</h3>

              Der <b>Query Builder</b> ist eine Ansicht für unerfahrene Nutzer bzw. um schnell Abfragen zu erstellen.
              Hier können Abfragen einfach zusammengeklickt werden. Um zum <b>Code Editor</b> zu wechsel kann dieser
              Button <button style="width: 40px"><font-awesome-icon size="sm" icon="code" /></button> geklickt werden.
            </div>

            <div v-if="introView === 'filter'">
              <h5>Filter</h5>

              Mithilfe des Plus Button <font-awesome-icon class="icon" icon="circle-plus" size="xl" /> unter der
              <i>Filter</i> Überschrift kann ein Filter für die xAPI Statements hinzugefügt werden. Die Filter können
              dazu genutzt werden um nur nach bestimmten Daten zu suchen bzw. Daten von der Suche auszuschließen. Ein
              Filter besteht aus einem Attribut, einem Vergleichsoperator und einem Attributwert. Für die Attributwerte
              gibt es teilweise Vorschläge damit das Filtern leichter ist. Außerdem gibt es die Möglichkeit mehrere
              Filter anzulegen. Nach Anlegen des 1. Filters erscheinen zwei Buttons die genutzt werden können, um
              weitere Filter anzulegen. Der <button>AND</button> Button wird alle weiteren Filter UND verknüpfen,
              während der <button>OR</button> Button alle ODER verknüpft. Danach können weiter Filter über
              <font-awesome-icon class="icon" icon="circle-plus" size="lg" /> hinzugefügt bzw. über
              <font-awesome-icon class="icon" icon="circle-xmark" size="lg" /> wieder entfernt werden.
            </div>

            <div v-if="introView === 'options'">
              <h6>Weiter Filteroptionen</h6>

              Unter den angelegten Filtern gibt es auch noch weitere Filteroptionen die mit einem Klick auf
              <font-awesome-icon class="icon" icon="chevron-right" size="md" /> aufgeklappt werden können. Hier kann das
              Verhalten der Suche und wie die xAPI Statements gefiltert werden sollen noch weiter definiert werden.

              <p>
                <b>Sort:</b> Hier kann eine Attribut und die Richtung in welche sortiert werden soll ausgewählt werden.
              </p>

              <p>
                <b>Limit:</b> Hiermit kann die Anzahl an xAPI Statements die geholt werden sollen beschränkt werden.
              </p>

              <p>
                <b>Skip:</b> Mit dieser Option kann die Anzahl der xAPI Statements die übersprungen werden sollen
                definiert werden. Ähnlich zum Wechseln zu einer neuen Seiten im Online-Shop können damit quasi die
                nächsten 'Seite' an xAPI Statement geholt werden.
              </p>

              <p>
                <b>Group:</b> Hier wird ein Attribut ausgewählt mit dem die xAPI Statements gruppiert werden. Das kann
                unter anderem in Kombination mit den Operationen verwendet werden. Zum Beispiel könnte man so für jeden
                Kurs (<i>object.id</i>) das höchste erzielte Ergebnis (<i>result.score.raw</i>) der Lernenden anzeigen
                lassen.
              </p>
            </div>

            <div v-if="introView === 'operations'">
              <h5>Operationen</h5>

              Mit einem Klick auf <font-awesome-icon icon="circle-plus" size="lg" /> unter der
              <i>Operationen</i> Überschrift kann eine Operation für die xAPI Statements hinzugefügt werden. Eine
              Operation besteht immer aus einem Attribut und der Operation die darauf ausgeführt werden soll. Vorher
              angelegte Filter oder Filteroptionen schränken die xAPI Statements ein auf denen die Operationen
              ausgeführt werden. Mit einem Klick auf <font-awesome-icon class="icon" icon="circle-xmark" size="lg" />
              kann eine Operation wieder entfernt werden. Aktuell unterstützt der Prototyp folgende Operationen:

              <p>
                <b>max:</b> Findet den höchsten Wert für dieses Attribut in allen oder den gefilterten xAPI Statements.
              </p>

              <p>
                <b>min:</b> Findet den niedrigsten Wert für dieses Attribut in allen oder den gefilterten xAPI
                Statements.
              </p>

              <p>
                <b>avg:</b> Berechnet den durchschnittlichen Wert für dieses Attribut in allen oder den gefilterten xAPI
                Statements.
              </p>

              <p><b>sum:</b> Summiert alle Werte dieses Attributs in allen oder den gefilterten xAPI Statements.</p>
            </div>

            <div v-if="introView === 'query'">
              <h6>Syntax</h6>

              Mit einem Klick auf <font-awesome-icon icon="chevron-right" size="md" /> neben der
              <b>Syntax</b> Überschrift kann die generierte Abfrage angezeigt werden können. Mit einem weiteren Klick
              auf
              <font-awesome-icon icon="share" size="md" />
              wird diese Abfrage in den <b>Code Editor</b> kopiert und kann dort verwendet bzw. angepasst werden.
            </div>

            <div v-if="introView === 'code'">
              <h3>Code Editor</h3>

              Der <b>Code Editor</b> richtet sich an erfahrerene Nutzer, die sich schon etwas mit der Syntax der
              Abfragesprache auskennen. Unter dem Textfeld, das zum Schreiben einer eigenen Abfrage genutzt werden kann,
              befindet sich ein Dropdown-Menü mit vorgefertigten Beispielen die verwendet bzw. angepasst werden können.
              Um zurück zum <b>Query Builder</b> zu kommen kann auf diesen Button
              <button style="width: 40px"><font-awesome-icon size="sm" icon="list" /></button> in der oberen rechten
              Ecke geklickt werden.
            </div>
          </div>
        </div>
      </div>

      <div v-show="errorMessages.length > 0" class="my-4">
        <div v-for="(message, index) in errorMessages" :key="index" class="flex-center error-message py-2">
          <span>{{ message }}</span>
          <font-awesome-icon
            class="icon"
            size="sm"
            icon="xmark"
            @click="removeErrorMessage($event, index)"
            style="margin-left: auto"
          />
        </div>
      </div>

      <div v-show="showCode" class="py-4">
        <textarea placeholder="Schreibe deine Suche hier rein..." v-model="textareaInput"></textarea>
        <div class="py-2">
          <label for="exampleSelect">Beispiele:</label>
          <select id="exampleSelect" v-model="currentQueryExample" @change="setQueryExample(currentQueryExample)">
            <option v-for="(example, index) in queryExamples" :key="index" :value="index">
              {{ example.name }}
            </option>
          </select>
          <button title="Absenden der erstellten Abfrage" class="float-right" @click="queryCode(textareaInput)">
            Suche
          </button>
        </div>
      </div>

      <form class="py-2" autocomplete="off" v-show="!showCode" @submit.prevent="onSubmit">
        <h4>
          Filter
          <font-awesome-icon
            class="icon"
            size="sm"
            icon="circle-info"
            title="Klicke hier für eine Erklärung"
            @click="openIntro('filter')"
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
            <select v-model="filter.selectedAttribute" @change="adjustInputOptions(filter.selectedAttribute, index)">
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
                @click="openIntro('options')"
              />
            </div>

            <font-awesome-icon
              class="icon"
              :icon="showAdvancedFilterOptions ? 'chevron-down' : 'chevron-right'"
              size="md"
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
          <h4>
            Operationen
            <font-awesome-icon
              class="icon"
              size="sm"
              icon="circle-info"
              title="Klicke hier für eine Erklärung"
              @click="openIntro('operations')"
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
                @click="openIntro('query')"
              />
            </div>

            <font-awesome-icon
              class="icon"
              :icon="showQuery ? 'chevron-down' : 'chevron-right'"
              size="md"
              :title="
                showQuery
                  ? 'Klicke hier um die aktuelle Abfrage zu verstecken'
                  : 'Klicke hier um die aktuelle Abfrage anzuzeigen'
              "
              @click="showQuery = !showQuery"
            />
          </div>

          <div>
            <font-awesome-icon
              v-show="showQuery"
              id="share"
              icon="share"
              size="lg"
              title="Kopiere aktuelle Abfrage in den Code Editor"
              @click="saveQueryToTextarea()"
            />
            <pre id="current-query" v-show="showQuery">{{ queryOutput }}</pre>
          </div>
        </div>
      </form>

      <div id="result" class="py-2">
        <h5>Ergebnis:</h5>
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 8px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #c2c9d2;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 600;
}

label {
  margin-right: 10px;
}

input {
  padding: 10px;
  border: solid 1px #e5e5e5;
  box-shadow: 0 0 15px 4px rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  height: 35px;
}

textarea {
  width: 100%;
  resize: vertical;
  padding: 15px;
  border-radius: 10px;
  border: solid 1px #e5e5e5;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
  height: 200px;
}

input:hover,
textarea:hover,
input:focus,
textarea:focus {
  border-color: #c9c9c9;
}

select {
  max-width: 250px;
  min-width: 200px;
  padding: 5px;
  border-radius: 5px;
  height: 35px;
  background-color: white;
}

button {
  padding: 6px;
  border: none;
  background-color: var(--dark);
  color: white;
  font-weight: 600;
  border-radius: 5px;
  height: 35px;
}

#query-view {
  z-index: 8;
  position: absolute;
  top: 7%;
  left: 7%;
  height: calc(100% - 12%);
  width: calc(100% - 12%);
  border-radius: 10px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid grey;
  overflow: auto;
}

#query-view-content {
  max-width: 100%;
  height: 100%;
}

#query-view-header {
  display: inline;
  text-align: right;
}

#intro-backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: grey;
}

#intro {
  z-index: 8;
  position: absolute;
  top: 10%;
  left: 10%;
  height: calc(100% - 20%);
  width: calc(100% - 20%);
  border-radius: 10px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid grey;
  overflow: auto;
  background-color: white;
}

#intro-text {
  padding: 5%;
}

#intro-close {
  text-align: right;
  margin-right: 5%;
}

#intro-close-icon {
  position: fixed;
}

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

.error-message {
  padding: 10px;
  border-radius: 5px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid rgb(167, 163, 163);
  background-color: #ffcccc;
}

.float-right {
  float: right;
}

.icon {
  cursor: pointer;
  color: var(--dark);
}

.flex-center {
  display: flex;
  align-items: center;
  gap: 1%;
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
