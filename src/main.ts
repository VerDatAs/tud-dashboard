/**
 * Dashboard for the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Tommy Kubica)
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
import App from './App.vue'
import { useDashboardDataStore } from '@/stores/dashboardData'
import type { DashboardData } from '@/types/dashboard-data'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faAnglesRight,
  faBezierCurve,
  faCircleInfo,
  faDownload,
  faFloppyDisk,
  faFolder,
  faGear,
  faMaximize,
  faMinus,
  faPlus,
  faRefresh,
  faSitemap,
  faUsers,
  faMagnifyingGlass,
  faCode,
  faList,
  faCircleXmark,
  faCirclePlus,
  faChevronRight,
  faChevronDown,
  faShare,
  faXmark
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faAnglesRight,
  faBezierCurve,
  faCircleInfo,
  faDownload,
  faFloppyDisk,
  faFolder,
  faGear,
  faMinus,
  faPlus,
  faMaximize,
  faDownload,
  faCircleInfo,
  faRefresh,
  faSitemap,
  faUsers,
  faMagnifyingGlass,
  faCode,
  faList,
  faCircleXmark,
  faCirclePlus,
  faChevronRight,
  faChevronDown,
  faShare,
  faXmark
)
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import * as ConfirmDialog from 'vuejs-confirm-dialog'

import './assets/main.scss'

function isDevelopmentBuild(): boolean {
  return import.meta.env.MODE != 'production'
}

/**
 * Initialize the dashboard with the provided data.
 *
 * @param {DashboardData} initDashboardData
 */
function initDashboard(initDashboardData: DashboardData) {
  const app = createApp(App)

  app.use(ConfirmDialog)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  app.component('font-awesome-icon', FontAwesomeIcon)

  useDashboardDataStore().setDashboardData(initDashboardData)

  app.mount('#dashboardApp')

  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('init-graph', { detail: initDashboardData }))
  }, 1000)
}

if (isDevelopmentBuild()) {
  // Conditional imports: https://stackoverflow.com/a/67059286
  const axios = (await import('axios')).default
  const localNode = (await import('@/util/InitialEvent')).localNode
  import('./assets/local-dev.scss')
  const DashboardData = (await import('@/types/dashboard-data')).DashboardData

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const pseudoId = import.meta.env.VITE_PSEUDO_ID
  const authUrl = backendUrl + '/api/v1/auth/login'
  const request = {
    actorAccountName: pseudoId
  }
  axios.post(authUrl, request).then((data: any) => {
    const token = data.data?.token
    const dashboardData = new DashboardData(localNode, token, backendUrl)
    dashboardData.previewMode = import.meta.env.VITE_PREVIEW_MODE === 'true'
    dashboardData.canViewOnly = import.meta.env.VITE_CAN_VIEW_ONLY === 'true'
    dashboardData.pseudoId = pseudoId
    dashboardData.path = ''
    initDashboard(dashboardData)
  })
}

/**
 * Init function that is called from an external system (e.g., ILIAS).
 *
 * @param initDashboardData
 */
export function init(initDashboardData: DashboardData) {
  initDashboard(initDashboardData)
}

/**
 * Helper function to re-initialize the app with the existing dashboardData.
 */
export function reInit() {
  if (useDashboardDataStore().reInitNecessary) {
    const dashboardData = useDashboardDataStore().data
    initDashboard(dashboardData)
  }
}
