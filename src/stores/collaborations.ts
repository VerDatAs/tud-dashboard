import { defineStore } from 'pinia'

export const useCollaborationsStore = defineStore({
  id: 'collaborations',
  state: () => ({
    adminToken: '',
    collaborations: []
  }),
  persist: true
})
