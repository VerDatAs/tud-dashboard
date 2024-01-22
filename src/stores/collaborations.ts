import { defineStore } from 'pinia'

export const useCollaborationsStore = defineStore({
  id: 'collaborations',
  state: () => ({
    collaborations: []
  }),
  persist: true
})
