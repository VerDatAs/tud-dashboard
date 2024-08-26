import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { useVueFlow, type GraphEdge, type GraphNode } from '@vue-flow/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export enum ESidebarType {
  AssistanceType = 0,
  Node = 1,
  Edge = 2,
  ATInput = 3
}

export const useSidebarStore = defineStore('at/sidebar', () => {
  const _currentType = ref<ESidebarType>(ESidebarType.AssistanceType)
  const _currentId = ref<string | undefined>(undefined)
  const currentType = computed(() => _currentType.value)

  function setNode(id: string) {
    _currentType.value = ESidebarType.Node
    _currentId.value = id
  }

  function setEdge(id: string) {
    _currentType.value = ESidebarType.Edge
    _currentId.value = id
  }

  function setATInput(id: string) {
    _currentType.value = ESidebarType.ATInput
    _currentId.value = id
  }

  function setAssistanceType() {
    _currentType.value = ESidebarType.AssistanceType
    _currentId.value = undefined
  }

  const currentObject = computed((): GraphNode | GraphEdge | undefined => {
    const { findNode, findEdge } = useVueFlow(CVueFlowStoreId)
    return _currentType.value === ESidebarType.Node || _currentType.value === ESidebarType.ATInput
      ? findNode(_currentId.value)
      : _currentType.value === ESidebarType.Edge
      ? findEdge(_currentId.value)
      : undefined
  })

  const currentId = computed(() => _currentId.value)

  return {
    currentType,
    setNode,
    setEdge,
    setATInput,
    setAssistanceType,
    currentObject,
    currentId
  }
})
