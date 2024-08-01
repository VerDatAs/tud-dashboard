import { defineStore } from 'pinia'

import { createEventHook } from '@vueuse/core'

export const useATEventStore = defineStore('at/events', () => {
  const clickSidebarShowAssistanceType = createEventHook<MouseEvent>()
  return {
    clickSidebarShowAssistanceType,
    onClickSidebarShowAssistanceType: clickSidebarShowAssistanceType.on
  }
})
