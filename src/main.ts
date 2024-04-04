import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

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

import { useDashboardDataStore } from '@/stores/dashboardData'
import type { DashboardData } from '@/types/dashboard-data'
import * as ConfirmDialog from 'vuejs-confirm-dialog'

import './assets/main.scss'

function isDevelopmentBuild(): boolean {
  return import.meta.env.MODE != 'production'
}

function initDashboard(initDashboardData: DashboardData) {
  // console.log('init dashboard', JSON.stringify(initDashboardData));
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
  // solution of conditional imports retrieved from https://stackoverflow.com/a/67059286
  const axios = (await import('axios')).default
  const localNode  = (await import('@/util/InitialEvent')).localNode
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

export function init(initDashboardData: DashboardData) {
  initDashboard(initDashboardData)
}

// helper function to re-initialize the app with the existing dashboardData
export function reInit() {
  if (useDashboardDataStore().reInitNecessary) {
    const dashboardData = useDashboardDataStore().data
    initDashboard(dashboardData)
  }
}
