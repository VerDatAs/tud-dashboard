import { defineStore } from 'pinia'

export const useSettingStore = defineStore({
  id: 'settings',
  state: () => ({
    autosave: false as boolean,
    debugging: true as boolean
  }),
  persist: true
})
