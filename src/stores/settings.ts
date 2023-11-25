import { defineStore } from 'pinia';

export const useSettingStore = defineStore({
  id: 'settings',
  state: () => ({
    autosave: true as boolean,
    debugging: false as boolean
  }),
  persist: true,
})