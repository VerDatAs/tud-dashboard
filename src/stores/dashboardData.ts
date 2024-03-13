import { defineStore, acceptHMRUpdate } from 'pinia'
import type { DashboardData } from '@/types/dashboard-data'

export const useDashboardDataStore = defineStore({
  id: 'dashboardData',
  state: () => ({
    data: {} as DashboardData,
    reInitNecessary: false as Boolean
  }),
  actions: {
    setDashboardData(dashboardData: DashboardData) {
      this.data = dashboardData;
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDashboardDataStore, import.meta.hot))
}
