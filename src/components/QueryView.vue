<script>
import axios from 'axios'

//TODO
//math expression
//Grouping
//was wenn man zb sort nicht haben will --> kann ja nicht löschen das erste element?
//alles auf deutsch machen
//add useful/better examples
//possible extensions; autocomplete, standard deveiation as operator...

//probably best to fetch all possible attributes from the mongoDB
const attr = [  
  { displayName: "timestamp", value: "timestamp"},
  { displayName: "actor.name", value: "actor.name"},
  { displayName: "verb", value: "verb"},
  { displayName: "object", value: "object"},
]

const comp = [
  { displayName: "equal", value: "$eq"},
  { displayName: "not equal", value: "$ne"},
  { displayName: "greater than", value: "$gt"},
  { displayName: "greater than or equal", value: "$gte" },
  { displayName: "less than", value: "$lt" },
  { displayName: "less than or equal", value: "$lte" },
  { displayName: "in", value: "$in" },
  { displayName: "not in", value: "$nin" },
]

const ops = [
  { displayName: "min", value: "$min" },
  { displayName: "max", value: "$max" },
  { displayName: "avg", value: "$avg" },
  { displayName: "sum", value: "$sum" },
]

const examples = [
    {
      name: "Einfaches Filter Beispiel",
      query: {
        search: {
            timestamp: {
                $eq: "2023-06-27T09:47:36.000000+02:00"
            }
        },
        operations: []
      }  
    },
    {
      name: "Filter Beispiel mit AND-Verknüpfung",
      query: {
        search: {
            $or: [
                { timestamp : {$eq : '2023-06-27T09:46:51.000000+02:00'} },
                { timestamp : {$eq : '2023-06-27T09:47:37.000000+02:00'} },
            ]
        },
        operations: []
      }
    },
    {
      name: "Einfaches Operationen Beispiel",
      query: {
        search: {},
        operations: [
            {
                $min: {
                    path: "eqw"
                }
            }
        ]
      }
    },
]

export default {
  data: () => ({
    filterBuilder: [{ selectedAttribute: "", selectedComparison: "" }],
    operationBuilder: [{ selectedOperation: "" }],
    sortBuilder: [{ selectedAttribute: "", selectedDirection: "" }],
    textareaInput: null,
    attributes: attr,
    comparison: comp,
    selectedAttribute: null,
    selectedComparison: null,
    selectedValueFilter: null,
    operations: ops,
    selectedOperation: null,
    selectedValueOperation: null,
    andConnection: true,
    queryGroup: "",
    queryLimit: 0,
    querySkip: 0,
    queryOutput: null,
    result: null,
    queryExamples: examples,
    firstOperandFilterAttribute: "",
    firstOperandFilterComparison: "",
    firstOperandFilterValue: "",
    secondOperandFilterAttribute: "",
    secondOperandFilterComparison: "",
    secondOperandFilterValue: "",
    mathArithmeticOperator: "",
    firstOperandValue: "",
    secondOperandValue: "",
    showCode: false,
    currentQueryExample: ""
  }),
  props: {
    backendUrl: String,
    token: String,
  },
  created() {
    this.fetchAttributes()
  },
  methods: {
    fetchAttributes() {

      const backendUrl = 'http://127.0.0.1:8000' //this.backendUrl

      const queryUrl = backendUrl + '/api/v1/statements'
      const auth = { //is later changed to Bearer Authenifciation with this.token
        username: 'testuser',
        password: 'test123'
      }

      //maybe add an endpoint in the api to fetch a single records and extract the colum headers or sth similar
      //db.yourCollectionName.findOne();
      /* axios
        .get(queryUrl, { auth: auth })
        .then((result) => {
          console.log('Query result', result)
          this.attributes = result
        })
        .catch((err) => {
          // Handle errors
          console.error(err)
        }) */

    },
    queryBuilder() {

      console.log('Filter Builder: ', this.filterBuilder)
      console.log('Operation Builder: ', this.operationBuilder)

      let input = {
        search: {},
        operations: []
      }

    for(const filter of this.filterBuilder) {

        if(filter.selectedAttribute !== "" && filter.selectedComparison !== "" 
        && filter.selectedValueFilter !== "" && filter.selectedValueFilter !== undefined) {

            const connectionKey = this.andConnection ? '$and' : '$or'
            if(!input.search[connectionKey]) input.search[connectionKey] = []
            
            if(filter.selectedComparison === '$in' || filter.selectedComparison === '$nin') {
                filter.selectedValueFilter = filter.selectedValueFilter.split(',').map((element) => element.trim())
            }

            input.search[connectionKey].push(this.buildFilterQueryObject(filter))
        }
    }


    if(this.operationBuilder.length === 1) {

        if(this.operationBuilder[0].selectedOperation !== "" && this.operationBuilder[0].selectedValueOperation !== ""
            && this.operationBuilder[0].selectedValueOperation !== undefined) {

            const operationObject = this.buildOperationQueryObject(this.operationBuilder[0])    
            const groupObject = {
                ['$group']: {
                    _id: null,
                    ...operationObject
                }
            }
            input.operations.push(groupObject)
        }
    } else {

        const groupObject = {
            ['$group']: {
                _id: null,
            }
        }
        input.operations.push(groupObject)

        for(const operation of this.operationBuilder) {

            if(operation.selectedOperation !== "" && operation.selectedValueOperation !== ""
            && operation.selectedValueOperation !== undefined) {
                console.log(input.operations)
                console.log(input.operations[0])
                console.log(input.operations[0]['$group'])
                Object.assign(input.operations[0]['$group'], this.buildOperationQueryObject(operation));
            }
        } 
    }

      /*if(this.firstOperandFilterAttribute !== "" && this.firstOperandFilterComparison !== "" && this.firstOperandFilterValue !== undefined 
        && this.secondOperandFilterAttribute !== "" && this.secondOperandFilterComparison !== "" && this.secondOperandFilterValue !== undefined
        && this.firstOperandValue !== "" && this.secondOperandValue !== ""  && this.mathArithmeticOperator !== "") {
          
        //input.operations.push(this.buildOperationQueryObject(operation))
      }



       if(this.sortBuilder.length < 0) {

        console.log('Nothing to sort')

      } else {
        for(const sort of this.sortBuilder) {
          if(sort.selectedAttribute !== "" && sort.selectedDirection !== "") {
            if(!input.search['$sort']) input.search['$sort'] = {}
            input.search['$sort'][sort.selectedAttribute] = sort.selectedDirection
          }
        }
      }

      if(this.queryGroup !== "") {
        input.operations['$group'] = {}
        input.operations['$group']['_id'] = this.queryGroup
      }

      if(this.queryLimit !== 0) {
        input.search['$limit'] = this.queryLimit
      }

      if(this.querySkip !== 0) {
        input.search['$skip'] = this.queryLimit
      } */

      this.queryOutput = input

      this.query(input)
    },
    buildFilterQueryObject(filter) {

      const filterObject = {
        [filter.selectedAttribute] : {
          [filter.selectedComparison] : filter.selectedValueFilter
        }
      }
      return filterObject

    },
    buildOperationQueryObject(operation) {
      
      const prefix = operation.selectedOperation.split('$')[1]  
      const operationObject = {
        [prefix + 'Value']: {
          [operation.selectedOperation]: '$' + operation.selectedValueOperation
        }
      }

      return operationObject
    },
    queryCode(input) {

      console.log(JSON.parse(input))
      //some kind of validation?
      this.query(JSON.parse(input))

    },
    query(input) {
      const backendUrl = 'http://0.0.0.0:8000' //needs to be changed later http://0.0.0.0:8000
      const queryUrl = backendUrl + '/api/v1/query-statements'
      const auth = {
        username: 'testuser',
        password: 'test123'
      }

      /* if(input.operations.__contains__("$group") && (input.operations.__contains__("$max") || input.operations.__contains__("$min") || input.operations.__contains__("$sum") || input.operations.__contains__("$avg"))) {
        const pipeline = [
          {
              $group: {
                _id: input.operations("$group"),

              }
          } 
        ]
      } */
      

      axios
        .post(queryUrl,
            input,      
            {
              auth: auth
            })
        .then((result) => {
          console.log('Query result', result)
          this.result = result.data
        })
        .catch((err) => {
          console.error(err)  
          this.result = err
        })

      //axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*'
      //axios.defaults.headers.get['Authorization'] = 'Basic ' + btoa(username + ':' + password) // for POST requests

      /* axios.interceptors.request.use(config => {
        window.console.log(config);

        config.paramsSerializer = params => {
          // Qs is already included in the Axios package
          return Qs.stringify(params, {
            arrayFormat: "brackets",
            encode: false
          });
        };

        return config;
      });

      axios
        .get(queryUrl,        
            {
              params: {
                query: input
              },
              auth: auth
            })
        .then((result) => {
          console.log('Query result', result)
          this.result = result
        })
        .catch((err) => {
          console.error(err)  
          this.result = err
        })*/
    },
    setQueryExample(index) {
      this.textareaInput = JSON.stringify(this.queryExamples[index].query, null, 2)
    },
    addOperationBuilder(array) {
      array.push({ selectedOperation: "" })
    },
    removeOperationBuilder(array, index) {
      array.splice(index, 1);
    },
    addSortBuilder(array) {
      array.push({ selectedAttribute: "", selectedDirection: "" })
    },
    removeSortBuilder(array, index) {
      array.splice(index, 1);
    },
    addFilterBuilder(array, index, andConnection) {
      this.andConnection = andConnection
      array.push({ selectedAttribute: "", selectedComparison: "" })
      document.getElementById("connection" + index).innerHTML = andConnection ? "AND" : "OR"
    },
    removeFilterBuilder(array, index) {
      array.splice(index, 1);
      document.getElementById("connection" + (index - 1)).innerHTML = ""
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
                <font-awesome-icon size="sm" :icon="showCode ? 'list' : 'code'"/>
            </button>
            
        </h2>

        <div v-show="showCode" id="code">
            <textarea id="textareaCode" placeholder="Schreibe deine Suche hier rein..." v-model="textareaInput"></textarea>
            <div>
                <select id="exampleSelect" v-model="currentQueryExample" @change="setQueryExample(currentQueryExample)">
                    <option value="" disabled selected>Wähle ein Beispiel aus</option>
                    <option v-for="(example, index) in queryExamples" :key="index" :value="index">
                        {{example.name}}
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
            <div class="filter-builder" v-for="(builder, index) in filterBuilder" :key="index">
                <div class="builder" :id="'filter' + index">

                    <select v-model="filterBuilder[index].selectedAttribute">
                        <option value="" disabled selected>Wähle ein Attribut aus</option>
                        <option v-for="attribute in attributes" :key="attribute.Id" :value="attribute.value">
                            {{attribute.displayName}}
                        </option>
                    </select>

                    <select v-model="filterBuilder[index].selectedComparison">
                        <option value="" disabled selected>Wählen einen Vergleichsoperator aus</option>
                        <option v-for="comp in comparison" :key="comp.Id" :value="comp.value">
                            {{comp.displayName}}
                        </option>
                    </select> 

                    <input class="textinput" v-model="filterBuilder[index].selectedValueFilter" placeholder="Schreibe hier deinen Wert rein..."/>

                    <div class="filterActions">
                        <div
                            title="Filter hinzufügen"
                            v-show="index === (filterBuilder.length - 1) && index !== 0"
                            @click="addFilterBuilder(filterBuilder, index, this.andConnection)"
                        >
                            <font-awesome-icon class="icon" icon="circle-plus" size="lg"/>
                        </div>
                        
                        <div
                            title="Filter entfernen"
                            v-show="index === (filterBuilder.length - 1) && index !== 0" 
                            @click="removeFilterBuilder(filterBuilder, index)"
                        >
                            <font-awesome-icon class="icon" icon="circle-xmark" size="lg"/>
                        </div>
                        
                        <button
                            v-show="index === 0 && filterBuilder.length === 1" 
                            @click="addFilterBuilder(filterBuilder, index, true)"
                            title="Filter durch AND-Verbindungen verknüpfen"
                        >
                            AND
                        </button>
                        <button 
                            v-show="index === 0 && filterBuilder.length === 1" 
                            @click="addFilterBuilder(filterBuilder, index, false)"
                            title="Filter durch OR-Verbindungen verknüpfen"
                        >
                            OR
                        </button>
                    </div>
                    
                </div>
                <div>
                    {{ filterBuilder[index].selectedComparison === '$in' || filterBuilder[index].selectedComparison === '$nin' ? 
                    'Bei diesem Operator muss eine Liste nach folgendem Schema angegeben werden: Tom, Tim, Thomas' : '' }}
                </div>
                <p class="filter-connection" :id="'connection' + index"></p>
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
            <div class="operation-builder" v-for="(builder, index) in operationBuilder" :key="index">
                <div class="builder" :id="'operation' + index">  

                    <select v-model="operationBuilder[index].selectedOperation">
                        <option value="" disabled selected>Wähle eine Operation aus</option>
                        <option v-for="op in operations" :key="op.Id" :value="op.value">
                            {{op.displayName}}
                        </option>
                    </select>

                    <input class="textinput" v-model="operationBuilder[index].selectedValueOperation" placeholder="Schreibe hier deinen Wert rein..."/>
                    <div class="filterActions">
                        <div
                            title="Operation hinzufügen"
                            v-show="index === (operationBuilder.length - 1)"
                            @click="addOperationBuilder(operationBuilder)"
                        >
                            <font-awesome-icon class="icon" icon="circle-plus" size="lg"/>
                        </div>
                        
                        <div
                            title="Operation entfernen"
                            v-show="index !== 0"
                            @click="removeOperationBuilder(operationBuilder, index)"
                        >
                            <font-awesome-icon class="icon" icon="circle-xmark" size="lg"/>
                        </div>
                    </div>
                </div>
            </div>

            <!-- <h4>Math</h4>
            <p>If more than one statement gets found for the filter, the first one will be used for the calculation?</p>
            <div id="math">

            <div id="first-operand">
                <label for="first-operand-filter">Filter:</label>  
                <select id="first-operand-filter" v-model="firstOperandFilterAttribute">
                <option value="" disabled selected>Select your filter attribute</option>
                <option v-for="attr in attributes" :key="attr.Id" :value="attr.value">
                    {{attr.displayName}}
                </option>
                </select>
                <select v-model="firstOperandFilterComparison">
                <option value="" disabled selected>Select your comparison operator</option>
                <option v-for="comp in comparison" :key="comp.Id" :value="comp.value">
                    {{comp.displayName}}
                </option>
                </select> 
                <input v-model="firstOperandFilterValue" placeholder="Type your value here..."/>
            </div>
            <div>
                <label for="first-operand-value">First Operand:</label>  
                <select id="first-operand-value" v-model="firstOperandValue">
                <option value="" disabled selected>Select your operand attribute</option>
                <option v-for="attr in attributes" :key="attr.Id" :value="attr.value">
                    {{attr.displayName}}
                </option>
                </select>
            </div>

            <div class="filter-connection ">
                <select id="first-operand-filter" v-model="mathArithmeticOperator">
                <option value="" disabled selected>Select your arithmetic operator</option>
                <option value="$add">add</option>
                <option value="$subtract">subtract</option>
                <option value="$multiply">muliply</option>
                <option value="$divide">divide</option>
                </select>
            </div>

            <div id="second-operand">
                <label for="second-operand-filter">Filter:</label>  
                <select id="second-operand-filter" v-model="secondOperandFilterAttribute">
                <option value="" disabled selected>Select your filter attribute</option>
                <option v-for="attr in attributes" :key="attr.Id" :value="attr.value">
                    {{attr.displayName}}
                </option>
                </select>
                <select v-model="secondOperandFilterComparison">
                <option value="" disabled selected>Select your comparison operator</option>
                <option v-for="comp in comparison" :key="comp.Id" :value="comp.value">
                    {{comp.displayName}}
                </option>
                </select> 
                <input v-model="secondOperandFilterValue" placeholder="Type your value here..."/>
            </div>
            <div>
                <label for="second-operand-value">Second Operand:</label>  
                <select id="second-operand-value" v-model="secondOperandValue">
                <option value="" disabled selected>Select your operand attribute</option>
                <option v-for="attr in attributes" :key="attr.Id" :value="attr.value">
                    {{attr.displayName}}
                </option>
                </select>
            </div>
            </div>

            <h4>Other</h4>
            <p>Only when no operations are declared?</p>
            <div v-for="(builder, index) in sortBuilder" :key="index">
            <div :id="'sort' + index" class="sort-builder">
                <label for="sort-select">Sort:</label>  
                <select id="sort-select" v-model="sortBuilder[index].selectedAttribute">
                <option value="" disabled selected>Select your sort attribute</option>
                <option v-for="attr in attributes" :key="attr.Id" :value="attr.value">
                    {{attr.displayName}}
                </option>
                </select>
                <select v-model="sortBuilder[index].selectedDirection">
                <option value="" disabled selected>Select your sort direction</option>
                <option value="asc">ASC</option>
                <option value="desc">DESC</option>
                </select>
                <button v-show="index !== 0" @click="removeSortBuilder(sortBuilder, index)">x</button>
                <button v-show="index === (sortBuilder.length - 1)" @click="addSortBuilder(sortBuilder)">+</button>
            </div>
            </div>

            <label for="group-select">Group:</label>  
            <select id="group-select" v-model="queryGroup">
            <option value="" disabled selected>Select your grouping attribute</option>
            <option v-for="attr in attributes" :key="attr.Id" :value="attr.value">
                {{attr.displayName}}
            </option>
            </select>

            <div>
            <label for="queryLimit">Limit:</label>  
            <input id="queryLimit" v-model="queryLimit" placeholder="Whats the maximum amount of documents you want to query?"/>
            <label for="querySkip">Skip:</label>  
            <input id="querySkip" v-model="querySkip" placeholder="How many documents do ypu want to skip?"/>
            </div> -->

            <div id="queryBuilder">
                <button class="queryButton" title="Query xAPI statements" @click="queryBuilder()">Suche</button>
            </div>
            <div>
                <pre>{{ queryOutput }}</pre>
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
  overflow: auto
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
    resize: vertical;
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
    margin-top: 5%
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

</style>
