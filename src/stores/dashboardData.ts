/**
 * Dashboard for the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { DashboardData } from '@/types/dashboard-data'
import { acceptHMRUpdate, defineStore } from 'pinia'

/**
 * Pinia store for holding all dashboard data related information.
 */
export const useDashboardDataStore = defineStore({
  id: 'dashboardData',
  state: () => ({
    data: {} as DashboardData,
    reInitNecessary: false as Boolean
  }),
  actions: {
    /**
     * Overwrite the existing value of the dashboard data by a given input.
     *
     * @param {DashboardData} dashboardData
     */
    setDashboardData(dashboardData: DashboardData) {
      this.data = dashboardData
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDashboardDataStore, import.meta.hot))
}
