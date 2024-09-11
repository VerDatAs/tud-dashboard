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
    return getPoint(2, 2)
  }

  function getPoint(x: number, y: number) {
    if (!_flowChartHtmlElement.value) return { x: window.screenX / x, y: window.screenY / y }
    const rect = _flowChartHtmlElement.value.getBoundingClientRect()
    return { x: rect.x + rect.width / x, y: rect.y + rect.height / y }
  }

  return {
    flowChartHtmlElement,
    setFlowChartHtmlElement,
    unsetFlowChartHtmlElement,
    getCenterPoint,
    getPoint
  }
})
