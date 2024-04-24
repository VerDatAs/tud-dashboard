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
import { codeQueryExamples } from '@/util/QueryHelpers'
import axios from 'axios'

export default {
  data: () => ({
    codeQuery: null,
    codeQueryExamples,
    currentCodeQueryExampleIndex: null
  }),
  props: {
    backendUrl: String,
    token: String,
    queryFromBuilder: String
  },
  watch: {
    /**
     * Watch for prop change in case the user wants to copy the current query from the Query Builder to the Code Editor.
     */
    queryFromBuilder(testNew) {
      this.codeQuery = testNew
    }
  },
  methods: {
    /**
     * Prepare the input to be sent as a query.
     *
     * @param input
     */
    prepareCodeQuery(input) {
      // Parse textarea input to an object for further modifications
      input = JSON.parse(input)

      const isCalculation = this.calculationQuery(input)

      // Do not send this query forward, if calculations are detected, since this is currently encapsulated from the standard query sequence and handled here
      if (!isCalculation) {
        this.$emit('sendQuery', input)
      }
    },
    /**
     * Function that currently handles calculations specified in the query,
     * mostly experimental and probably will change in the future.
     * Furthermore, nothing is validated here (--> no feedback to the user).
     *
     * @param input
     */
    calculationQuery(input) {
      let isCalculation = false

      // The currently available arithmetic operations
      const availableArithmeticOperators = ['add', 'subtract', 'divide', 'multiply']

      // Iterate over elements specified in the 'operations' part of the query
      for (const operation of input.operations) {
        const arithmeticOperation = Object.keys(operation)[0]
        // Check, if the extracted key for the operations is one of the supported arithmetic operations
        if (availableArithmeticOperators.indexOf(arithmeticOperation) !== -1) {
          // Calculation was detected in this query
          isCalculation = true

          // Variable that specifies whether this is a calculation with dates (this is later important for the actual calculation)
          let isDate = false

          // The object containing all the operands for the calculation
          const operandList = Object.values(operation)[0]

          // Array that will hold the request for every single operand of the calculation
          const requests = []

          // Prepare the general request
          const queryUrl = this.backendUrl + '/api/v2/statement/query'
          const authHeader = {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: 'Bearer ' + this.token
          }

          // Iterate over the operand list
          for (const operand of operandList) {
            // Prepare the general structure of a query
            let input = {
              search: {},
              operations: []
            }

            // Check, if a filter is specified for the operand 'and'
            // If yes, add it to our query
            if ('filter' in operand && operand.filter) {
              input.search = { ...operand.filter }
            }

            // Check, if a select is specified for the operand and equals the 'timestamp' attribute
            // If yes, set isDate variable to true, so we know for our calculation later that dates are involved
            // If yes, add it to our query but as the 'originalTimestamp' attribute
            // The reason for this adjustment is the current handling of dates for our query (no seconds available),
            // but since we need the dates to be precise to the seconds and this is set in the backend in the 'originalTimestamp' attribute
            if ('select' in operand && operand.select && operand.select === 'timestamp') {
              operand.select = 'originalTimestamp'
              isDate = true
            }

            let operation = null

            // Check, if an operation is specified for the operand
            if ('operation' in operand && operand.operation) {
              // $count operations need to be handled a little bit different than the other operations (max, min, avg, sum)
              if (operand.operation === '$count') {
                operation = { $count: 'value' }
              } else {
                operation = { $group: { _id: '', value: { [operand.operation]: '$' + operand.select } } }
              }
            } else {
              // If no operation is given, add a new operation which will only fetch the field specified in 'operand.select' for the query
              operation = { $project: { _id: '', value: '$' + operand.select } }
            }

            input.operations.push(operation)

            // Create a request for this operand and add it to the request list
            requests.push(axios.post(queryUrl, input, { headers: authHeader }))
          }

          // Run all the created requests
          axios.all(requests).then(
            // Spread the results of the request in a list
            axios.spread((...results) => {
              let calculationResult = null

              // Simply take the first element that is returned by MongoDB
              // Currently, no validation exist, so this might lead to errors
              const operands = results.map((result) => {
                // Convert all results into dates, if the variable was set to true
                if (isDate) {
                  return new Date(result.data.aggregate[0].value)
                } else {
                  return result.data.aggregate[0].value
                }
              })

              // Calculate a result based on the arithmetic operation that was specified in the query
              switch (arithmeticOperation) {
                case 'add':
                  calculationResult = operands.reduce((accumulator, currentValue) => accumulator + currentValue)
                  break
                case 'subtract':
                  calculationResult = operands.reduce((accumulator, currentValue) => accumulator - currentValue)
                  break
                case 'divide':
                  calculationResult = operands.reduce((accumulator, currentValue) => accumulator / currentValue)
                  break
                default:
                  calculationResult = operands.reduce((accumulator, currentValue) => accumulator * currentValue)
              }

              // Emit an event to set this result
              this.$emit('setResult', calculationResult)
            })
          )
        }
      }
      return isCalculation
    },
    /**
     * Set a selected example into the textarea.
     *
     * @param index
     */
    setCodeQueryExample(index) {
      this.codeQuery = JSON.stringify(this.codeQueryExamples[index].query, null, 2)
    }
  }
}
</script>

<template>
  <div class="py-4">
    <textarea placeholder="Schreibe deine Suche hier rein..." v-model="codeQuery"></textarea>
    <div class="py-2">
      <label for="exampleSelect">Beispiele:</label>
      <select
        id="exampleSelect"
        v-model="currentCodeQueryExampleIndex"
        @change="setCodeQueryExample(currentCodeQueryExampleIndex)"
      >
        <option v-for="(example, index) in codeQueryExamples" :key="index" :value="index">
          {{ example.name }}
        </option>
      </select>
      <button title="Absenden der erstellten Abfrage" class="float-right" @click="prepareCodeQuery(codeQuery)">
        Suche
      </button>
    </div>
  </div>
</template>
