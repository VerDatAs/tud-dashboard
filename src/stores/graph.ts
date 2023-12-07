import { defineStore } from 'pinia';

export const useGraphStore = defineStore({
  id: 'graph',
  state: () => ({
    graphs: {} as object,
  }),
  persist: true,
})