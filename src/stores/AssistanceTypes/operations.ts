import type { TOperation } from '@/types/AssistanceType/operation'
import axios, { type AxiosResponse } from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useOperationStore = defineStore('at/operations', () => {
  const _operations = ref<Array<TOperation>>([])
  const _searchTerm = ref<string>('')
  const operations = computed(() => _operations.value)
  const searchTerm = computed(() => _searchTerm.value)

  const searchedOperations = computed(() => {
    const search = _searchTerm.value.toLowerCase().trim()
    return _operations.value.filter((operation) => {
      return (
        operation.name.toLowerCase().includes(search) ||
        operation.description.toLowerCase().includes(search) ||
        operation.id.toLowerCase().includes(search)
      )
    })
  })

  function getOperationById(id: string): TOperation | undefined {
    return _operations.value.find((operation) => operation.id === id)
  }

  function getVariableById(operationId: string, variableName: string, variableType: 'input' | 'output') {
    const operation = getOperationById(operationId)
    if (!operation) return
    return variableType == 'input'
      ? operation.inputs.find((input) => input.name === variableName)
      : operation.outputs.find((output) => output.name === variableName)
  }

  function setSearchTerm(term: string) {
    _searchTerm.value = term
  }
  function clearSearchTerm() {
    _searchTerm.value = ''
  }

  async function requestOperations() {
    return new Promise<AxiosResponse>((resolve, reject) => {
      return axios
        .get('/example-operations.json')
        .then((response) => {
          _operations.value = response.data
          resolve(response)
        })
        .catch(reject)
    })
  }

  return {
    operations,
    searchTerm,
    searchedOperations,
    getOperationById,
    getVariableById,
    setSearchTerm,
    clearSearchTerm,
    requestOperations
  }
})
