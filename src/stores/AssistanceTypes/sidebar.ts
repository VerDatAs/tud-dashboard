import { useVueFlow, type GraphEdge, type GraphNode } from '@vue-flow/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export enum ESidebarType {
  AssistanceType = 0,
  Node = 1,
  Edge = 2
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

  function setAssistanceType() {
    _currentType.value = ESidebarType.AssistanceType
    _currentId.value = undefined
  }

  const currentObject = computed((): GraphNode | GraphEdge | undefined => {
    const { findNode, findEdge } = useVueFlow('vue-flow-0')
    return _currentType.value === ESidebarType.Node
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
    setAssistanceType,
    currentObject,
    currentId
  }
})
