<script>
import axios from 'axios'
import { codeQueryExamples } from '@/util/QueryHelpers'

export default {
  data: () => ({
    codeQuery: null,
    codeQueryExamples,
    currentCodeQueryExampleIndex: null,
  }),
  props: {
    backendUrl: String,
    token: String,
    queryFromBuilder: String
  },
  watch: {
    // watch for prop change in case the user wants to copy the current query from the Query Builder to the Code Editor
    queryFromBuilder(testNew) {
        this.codeQuery = testNew
    }
  },
  methods: {
    prepareCodeQuery(input) {

      // parse textarea input to an object for further modifications
      input = JSON.parse(input)

      const isCalculation = this.calculationQuery(input)

      // don't send this query forward if calculations are detected since this is currently encapsulated from the standard query sequence and handled here
      if (!isCalculation) this.$emit("sendQuery", input)
    },
    calculationQuery(input) {

        // function that currently handles calculations specified in the query
        // mostly experimental and probably will change in the future
        // furthermore, nothing is validated here (--> no feedback to the user)

        let isCalculation = false

        // the currently available arithmetic operations
        const availableArithmeticOperators = ['add', 'subtract', 'divide', 'multiply']

        // iterate over elements specified in the 'operations' part of the query
        for (const operation of input.operations) {

            const arithmeticOperation = Object.keys(operation)[0]
            // check if the extracted key for the operations is one of the supported arithmetic operations
            if (availableArithmeticOperators.indexOf(arithmeticOperation) !== -1) {

                // calculation was detected in this query
                isCalculation = true

                // variable that specifies if this is a calculation with dates (is later important for the actual calculation)
                let isDate = false

                // the object containing all the operand for the calculation
                const operandList = Object.values(operation)[0]

                // array that will hold the request for every single operand of the calculation
                const requests = []

                // general information for the request
                const queryUrl = this.backendUrl + '/api/v2/statement/query'
                const authHeader = {
                    'Content-Type': 'application/json;charset=UTF-8',
                    Authorization: 'Bearer ' + this.token
                }

                // iterate over the operand list
                for (const operand of operandList) {

                    // prepare the general structure of a query
                    let input = {
                        search: {},
                        operations: []
                    }

                    // check if a filter is specified for the operand and 
                    // if yes add it to our query
                    if ('filter' in operand && operand.filter) {
                        input.search = { ...operand.filter }
                    }

                    // check if a select is specified for the operand and equals the 'timestamp' attribute
                    // if yes set isDate variable to true, so we know for our calculation later that dates are involved
                    // if yes add it to our query but as the 'originalTimestamp' attribute
                    // the reason for this adjustment is the current handling of dates for our query (no seconds available)
                    // but since we need the dates to be precise to the seconds and this is set in the backend in the 'originalTimestamp' attribute
                    if ('select' in operand && operand.select && operand.select === 'timestamp') {
                        operand.select = 'originalTimestamp'
                        isDate = true
                    }

                    let operation = null

                    // check if an operation is specified for the operand
                    if ('operation' in operand && operand.operation) {
                        // $count operations needs to be handled a littler different than the other operations (max, min, avg, sum)
                        if (operand.operation === '$count') {
                            operation = { $count: 'value' }
                        } else {
                            operation = { $group: { _id: '', value: { [operand.operation]: '$' + operand.select } } }
                        }
                    } else {
                        // if no operations is given, add a new operation which will only fetch the field specified in 'operand.select' for the query
                        operation = { $project: { _id: '', value: '$' + operand.select } }
                    }

                    input.operations.push(operation)

                    // create a request for this operand and add it to our request list
                    requests.push(
                        /* axios.post(queryUrl, input, {
                            auth: { username: this.authUser, password: this.authPassword }
                        }) */
                        axios.post(queryUrl, input, { headers: authHeader })
                    )
                }

                // run all the created requests
                axios.all(requests).then(
                    // spread the results of the request in a list
                    axios.spread((...results) => {

                        let calculationResult = null
                        
                        // simply take the first element that is returned by MongoDB
                        // currently no validation so might lead to errors!
                        const operands = results.map((result) => {
                            // convert all results to date if the variable was set to true
                            if(isDate) {
                                return new Date(result.data.aggregate[0].value )
                            } else {
                                return result.data.aggregate[0].value 
                            }
                        })

                        // calculate a result based on the arithmetic operations that was specified in the query
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

                        // emit an event to set this result
                        this.$emit('setResult', calculationResult)
                    })
                )
                }
      }
      return isCalculation
    },
    setCodeQueryExample(index) {
      // stringify and set the selected example in the textarea
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
            <select id="exampleSelect" v-model="currentCodeQueryExampleIndex" @change="setCodeQueryExample(currentCodeQueryExampleIndex)">
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