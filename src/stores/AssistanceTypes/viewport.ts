import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useViewportStore = defineStore('at/viewport', () => {
  const _flowChartHtmlElement = ref<Element | null>(null)
  const flowChartHtmlElement = computed(() => _flowChartHtmlElement.value)

  function setFlowChartHtmlElement(element: Element) {
    _flowChartHtmlElement.value = element
  }
  function unsetFlowChartHtmlElement() {
    _flowChartHtmlElement.value = null
  }

  function getCenterPoint() {
    if (!_flowChartHtmlElement.value) return { x: window.screenX / 2, y: window.screenY / 2 }
    const rect = _flowChartHtmlElement.value.getBoundingClientRect()
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  }

  return {
    flowChartHtmlElement,
    setFlowChartHtmlElement,
    unsetFlowChartHtmlElement,
    getCenterPoint
  }
})
