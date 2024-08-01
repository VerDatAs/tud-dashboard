import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVueFlowStore = defineStore('at/flow', () => {
  const nodes = ref([])
  const edges = ref([])

  return {
    nodes,
    edges
  }
})
