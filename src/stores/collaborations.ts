import { defineStore } from 'pinia'

export const useCollaborationsStore = defineStore({
  id: 'collaborations',
  state: () => ({
    adminToken: '' as string,
    collaborations: [] as string[]
  }),
  persist: true
})
