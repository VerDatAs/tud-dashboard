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
import CodeEditor from '@/components/Query/CodeEditor.vue'
import QueryBuilder from '@/components/Query/QueryBuilder.vue'
import { aggregationOperators, comparisonOperators } from '@/util/QueryHelpers'
import axios from 'axios'

export default {
  name: 'QueryView',
  components: {
    QueryBuilder,
    CodeEditor
  },
  data: () => ({
    comparisonOperators,
    aggregationOperators,
    filterAttributes: [],
    operationAttributes: [],
    queryOutput: null,
    queryResult: null,
    errorMessages: [],
    showCode: false,
    showIntro: false,
    introViewName: '',
    queryFromBuilder: ''
  }),
  props: {
    backendUrl: String,
    isExpanded: Boolean,
    token: String
  },
  created() {
    // Call this function to fetch the current schema at the creation time of this component
    this.fetchSchema()
  },
  mounted() {
    // Event listener to close the list of suggestions for the attribute value, if the user clicks outside of it
    document.getElementById('query-view').addEventListener('click', (event) => {
      if (event.target.getAttribute('name') === 'filter-input') {
        return
      }
      const suggestionList = document.getElementsByClassName('autocomplete-items')
      if (suggestionList.length > 0) {
        for (const list of suggestionList) {
          list.classList.add('hide')
        }
      }
    })
  },
  methods: {
    /**
     * Fetch the current schema for the xAPI attributes.
     */
    fetchSchema() {
      const url = this.backendUrl + '/api/v2/statement/schema'

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      axios
        .get(url, { headers: authHeader })
        .then((result) => {
          console.log('Fetch xAPI statements schema', result)

          this.filterAttributes = result.data

          // Iterate over the attribute list from the backend
          for (const attribute of result.data) {
            if (attribute.type === 'number' || attribute.type === 'integer') {
              // Unify the 'number' and 'integer' types, since we do not need to differentiate between those two
              attribute.type = 'number'
              // Currently, only attributes with the 'number' type are available for the operations
              this.operationAttributes.push(attribute)
            }
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    /**
     * Send a given query to the backend.
     *
     * @param input
     */
    sendQuery(input) {
      // Call a separate function to check, whether the query is valid
      const validQuery = this.validateQuery(input)

      // If the query is not valid, it is not send to the backend
      if (!validQuery) {
        this.queryResult = null
        return
      }

      // Prepare the general request
      const queryUrl = this.backendUrl + '/api/v2/statement/query'
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      // Signalize to the user that the query is being processed in the backend
      this.queryResult = 'Suchen...'

      axios
        .post(queryUrl, input, { headers: authHeader })
        .then((result) => {
          console.log('Query result', result)

          let resultObject = result.data

          // If the result contains an 'aggregate' part, set this as the result, otherwise delete it from the query
          if (resultObject['aggregate']) {
            resultObject = resultObject['aggregate']
          } else {
            delete resultObject['aggregate']
          }
          this.queryResult = resultObject
        })
        .catch((err) => {
          console.error(err)
          this.queryResult = err
        })
    },
    /**
     * Validate the query syntax.
     *
     * @param query
     */
    validateQuery(query) {
      this.errorMessages = []

      // Check, if the 'search' part is an object
      if (typeof query.search !== 'object') {
        this.errorMessages.push('Das search Feld sollte ein Objekt sein.')
        return false
      }

      // Check, if the 'operations' part is an array
      if (!Array.isArray(query.operations)) {
        this.errorMessages.push('Das operations Feld sollte eine Liste sein.')
        return false
      }

      // If the search object has any filters, check them
      if (Object.keys(query.search).length > 0) {
        this.validateFilters(query.search)
      }

      // If the operations array has entries, check them
      if (query.operations.length > 0) {
        this.validateOperations(query.operations)
      }

      return this.errorMessages.length === 0
    },
    /**
     * Validate given filters.
     *
     * @param filter
     */
    validateFilters(filter) {
      // Check, if the object has only one top-level entry
      if (Object.keys(filter).length === 1) {
        const filterProperty = Object.keys(filter)[0]
        const validConnections = ['$and', '$or']

        // Check, if the connection is valid
        if (validConnections.indexOf(filterProperty) > -1) {
          // Check, if the value of the connection is an array
          if (!Array.isArray(filter[filterProperty])) {
            this.errorMessages.push('Die ' + filterProperty + ' Verknüpfung sollte eine List sein.')
            return
          }

          // Recursively call the function for every element in the array
          for (const element of filter[filterProperty]) {
            this.validateFilters(element)
          }
        } else {
          // If the element is not a connection, check, if it is a valid attribute
          let found = this.isValidAttribute(filterProperty)
          if (!found) {
            this.errorMessages.push('Die Eingabe ' + filterProperty + ' im search Feld is nicht korrekt.')
            return
          }

          let propertyValue = filter[filterProperty]
          let comparisonOperator = null
          // Check, if the property value is an object
          if (typeof propertyValue === 'object') {
            // Check, if the comparison operator is valid
            comparisonOperator = Object.keys(propertyValue)[0]
            found = this.isValidComparisonOperator(comparisonOperator)
            if (!found) {
              this.errorMessages.push('Der verwendete Vergleichsoperator ' + comparisonOperator + '  ist nicht gültig.')
              return
            }

            propertyValue = propertyValue[comparisonOperator]
          }

          // Check, if the specified value is valid
          const validValue = this.isValidAttributeValue(filterProperty, propertyValue, comparisonOperator)
          if (!validValue) {
            console.log('Die spezifizierte Wert ist nicht valide.')
            return
          }
        }
      } else {
        this.errorMessages.push('Element ' + filter + ' sollte nur einen Eintrag haben.')
      }
    },
    /**
     * Validate given operations.
     *
     * @param operations
     */
    validateOperations(operations) {
      for (const operation of operations) {
        if ('$skip' in operation) {
          // If the operation is $skip, then check, if the value is a number and greater than or equal zero
          if (!isNaN(operation['$skip']) && operation['$skip'] >= 0) {
            operation['$skip'] = Number(operation['$skip'])
          } else {
            this.errorMessages.push(
              'Eingabe ' + operation['$skip'] + ' vom $skip Feld sollte gültig und eine positive Nummer sein'
            )
          }
        }

        if ('$limit' in operation) {
          // If the operation is $limit, then check, if the value is a number and greater than or equal one
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
          // If the operation is $group, then check, if the '_id' attribute is specified
          if ('_id' in groupObject) {
            // Split value, since it is specified with the MongoDB prefix
            const idValue = groupObject['_id'].split('$')[1]
            // Check, if the value for '_id' attribute is a valid attribute
            const found = this.isValidAttribute(idValue)
            if (!found && groupObject['_id'] !== '') {
              this.errorMessages.push('Eingabe ' + idValue + ' für das _id Feld im $group Feld ist nicht gültig.')
            }
          } else {
            this.errorMessages.push('Das _id Feld für das $group Feld fehlt.')
          }

          // Iterate over the properties of the $group object
          for (const element in groupObject) {
            if (element !== '_id') {
              // Create a list with valid operations
              const validOperations = this.aggregationOperators.map((element) => element.value)

              // Check that the $group object only has one entry
              if (Object.keys(groupObject[element]).length > 1) {
                this.errorMessages.push('Das Feld ' + element + ' sollte nur einen Eintrag haben.')
              } else {
                const aggregationOperator = Object.keys(groupObject[element])[0]

                // Check, if a specified operation is valid
                if (validOperations.indexOf(aggregationOperator) > -1) {
                  // Split attribute, since it is specified with the MongoDB prefix
                  const rawAttribute = groupObject[element][aggregationOperator].split('$')[1]
                  // Check, if it is a valid attribute
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
          const sortObject = operation['$sort']

          // Since the $sort object can have multiple entries, iterate over them
          for (const sortElement in sortObject) {
            // Check, if the attribute is valid
            const found = this.isValidAttribute(sortElement)
            if (!found) {
              this.errorMessages.push('Das Attribut ' + sortElement + ' für das $sort Feld is nicht gültig.')
            }

            // Check, if the value is 1 or -1 to specify the sort direction
            if (sortObject[sortElement] !== 1 && sortObject[sortElement] !== -1) {
              this.errorMessages.push(
                'Die Eingabe für das $sort Feld kann nur 1 oder -1, nicht ' + sortObject[sortElement] + ' sein.'
              )
            }
          }
        }
      }
    },
    /**
     * Check, if the specified value for an attribute is valid.
     *
     * @param attribute
     * @param value
     * @param operator
     */
    isValidAttributeValue(attribute, value, operator) {
      const attributeObject = this.getAttribute(attribute)[0]

      // TODO: Check special case if attribute = timestamp

      // Special case for these operators ($in, $nin), since they require a comma separated list as a value
      if (operator === '$in' || operator === '$nin') {
        // Check, if the value is an array
        if (Array.isArray(value)) {
          // Check, whether the elements of the array have the correct type
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

      // Check, if the value has the correct type
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
    /**
     * Retrieve an attribute from the attribute list (containing the attributes type as well).
     *
     * @param attribute
     */
    getAttribute(attribute) {
      return this.filterAttributes.filter((element) => element.attribute === attribute)
    },
    /**
     * Check, if a given attribute is in the attribute list.
     *
     * @param attribute
     */
    isValidAttribute(attribute) {
      return this.filterAttributes.find((element) => element.attribute === attribute)
    },
    /**
     * Check, if the operator is in the comparison operator list.
     *
     * @param operator
     */
    isValidComparisonOperator(operator) {
      return this.comparisonOperators.find((element) => element.value === operator)
    },
    /**
     * Open the introduction with the current view name.
     *
     * @param viewName
     */
    openIntro(viewName) {
      this.showIntro = true
      this.introViewName = viewName
      // Scroll to the top of the view and deactivate scrolling
      document.getElementById('query-view').scrollTop = 0
      document.getElementById('query-view').style.overflow = 'hidden'
    },
    /**
     * Close the introduction and activate scrolling again.
     */
    closeIntro() {
      this.showIntro = false
      document.getElementById('query-view').style.overflow = 'auto'
    },
    /**
     * Forward to the Code Editor.
     *
     * @param input
     */
    forwardQueryToCodeEditor(input) {
      this.showCode = true
      // Send the current query syntax from the Code Builder to the Code Editor
      this.queryFromBuilder = JSON.stringify(input, null, 2)
    },
    /**
     * Set a given result as the current query result.
     *
     * @param result
     */
    setResult(result) {
      this.queryResult = result
    },
    /**
     * Set given messages as the current error messages.
     *
     * @param messages
     */
    setErrorMessages(messages) {
      this.errorMessages = messages
    },
    /**
     * Remove an error message with a given index.
     *
     * @param index
     */
    removeErrorMessage(index) {
      this.errorMessages.splice(index, 1)
    }
  }
}
</script>

<template>
  <div id="query-view" :class="`${isExpanded ? 'is-expanded' : ''}`">
    <div id="query-view-content" class="container py-4">
      <div id="query-view-header" class="py-2">
        <h2 class="bold-heading" style="display: inline">
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

      <!-- Introductions -->
      <div v-if="showIntro" id="intro-backdrop">
        <div id="intro">
          <div id="intro-close">
            <font-awesome-icon
              id="intro-close-icon"
              class="icon"
              size="lg"
              icon="xmark"
              @click="closeIntro()"
              style="padding: 10px"
              title="Schließen"
            />
          </div>
          <div id="intro-text">
            <div v-if="introViewName === 'builder'">
              Im Rahmen des Forschungsprojekts VerDatAs entwickelt und erprobt die TU Dresden ein tutoriellen
              Assistenzsystems (TAS), um Lernende in ihrem individuellen Lernprozess zu unterstützen. Die Grundlage
              dieses TAS bildet die Erfassung von Lernverlaufsdaten mittels xAPI Statements, die genutzt werden, um
              Lernenden personalisierte Assistenzangebote zur Verfügung zu stellen. Diese Assistenzangebote sind oft
              vordefiniert und damit hat der Lehrende keine Einsicht, welche Lernverlaufsdaten dafür verwendet werden.
              Im Rahmen meiner Diplomarbeit wurde ein Konzept entwickelt, mit dem Lehrende in der Lage sein sollen,
              solche Lernverlaufsdaten selbständig abzufragen und zu aggregieren. Auf Basis dieses Konzepts wurde dieser
              Prototyp erstellt.

              <h3 class="bold-heading">Query Builder</h3>

              Der <b>Query Builder</b> ist eine Ansicht für unerfahrene Nutzer bzw. um schnell Abfragen zu erstellen.
              Hier können Abfragen einfach zusammengeklickt werden. Um zum <b>Code Editor</b> zu wechsel kann dieser
              Button <button style="width: 40px"><font-awesome-icon size="sm" icon="code" /></button> geklickt werden.
            </div>

            <div v-if="introViewName === 'filter'">
              <h5 class="bold-heading">Filter</h5>

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

            <div v-if="introViewName === 'options'">
              <h6 class="bold-heading">Weiter Filteroptionen</h6>

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

            <div v-if="introViewName === 'operations'">
              <h5 class="bold-heading">Operationen</h5>

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

            <div v-if="introViewName === 'query'">
              <h6 class="bold-heading">Syntax</h6>

              Mit einem Klick auf <font-awesome-icon icon="chevron-right" size="md" /> neben der
              <b>Syntax</b> Überschrift kann die generierte Abfrage angezeigt werden können. Mit einem weiteren Klick
              auf
              <font-awesome-icon icon="share" size="md" />
              wird diese Abfrage in den <b>Code Editor</b> kopiert und kann dort verwendet bzw. angepasst werden.
            </div>

            <div v-if="introViewName === 'code'">
              <h3 class="bold-heading">Code Editor</h3>

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

      <!-- Error Messages -->
      <div v-show="errorMessages.length > 0" class="my-4">
        <div v-for="(message, index) in errorMessages" :key="index" class="flex-center error-message my-2">
          <span>{{ message }}</span>
          <font-awesome-icon
            class="icon"
            size="sm"
            icon="xmark"
            @click="removeErrorMessage(index)"
            style="margin-left: auto"
          />
        </div>
      </div>

      <!-- Available Views -->
      <CodeEditor
        v-show="showCode"
        :backendUrl="backendUrl"
        :token="token"
        :queryFromBuilder="queryFromBuilder"
        @sendQuery="sendQuery"
        @setResult="setResult"
      />
      <QueryBuilder
        v-show="!showCode"
        :backendUrl="backendUrl"
        :token="token"
        :filterAttributes="filterAttributes"
        :operationAttributes="operationAttributes"
        @sendQuery="sendQuery"
        @openIntro="openIntro"
        @forwardQueryToCodeEditor="forwardQueryToCodeEditor"
        @setErrorMessages="setErrorMessages"
      />

      <!-- Query Result -->
      <div id="result" class="py-2">
        <h5 class="bold-heading">Ergebnis:</h5>
        <pre>{{ queryResult }}</pre>
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

:deep(label) {
  margin-right: 10px;
}

:deep(textarea) {
  width: 100%;
  resize: vertical;
  padding: 15px;
  border-radius: 10px;
  border: solid 1px #e5e5e5;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
  height: 200px;
}

:deep(textarea:hover, input:hover, textarea:focus, input:focus) {
  border-color: #c9c9c9;
}

:deep(input) {
  padding: 10px;
  border: solid 1px #e5e5e5;
  box-shadow: 0 0 15px 4px rgba(0, 0, 0, 0.06);
  border-radius: 5px;
  height: 35px;
}

:deep(select) {
  max-width: 250px;
  min-width: 200px;
  padding: 5px;
  border-radius: 5px;
  height: 35px;
  background-color: white;
}

:deep(button) {
  padding: 6px;
  border: none;
  background-color: var(--dark);
  color: white;
  font-weight: 600;
  border-radius: 5px;
  height: 35px;
}

#query-view {
  position: absolute;
  top: 10px;
  left: calc(1rem + 32px + 10px);
  height: calc(100% - 20px);
  width: calc(100% - (1rem + 32px) - 20px);
  background: #eee;
  border: 1px solid #ccc;
  overflow-y: scroll;
}

#query-view.is-expanded {
  left: calc(var(--sidebar-width) + 10px);
  width: calc(100% - var(--sidebar-width) - 20px);
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
  height: calc(100% - 25%);
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

.error-message {
  padding: 10px;
  border-radius: 5px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid rgb(167, 163, 163);
  background-color: #ffcccc;
}

:deep(.bold-heading) {
  font-weight: 600;
}

:deep(.float-right) {
  float: right;
}

:deep(.icon) {
  cursor: pointer;
  color: var(--dark);
}

:deep(.flex-center) {
  display: flex;
  align-items: center;
  gap: 1%;
}
</style>
