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
  faUsers
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
  faRefresh,
  faSitemap,
  faUsers
)

import type { DashboardData } from '@/types/dashboard-data'

import './assets/main.scss'
// import('./assets/local-dev.scss')

// import { localNode } from '@/util/InitialEvent'
//
// import axios from 'axios'

function initDashboard(initDashboardData: DashboardData) {
  const app = createApp(App, { initDashboardData })

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  app.component('font-awesome-icon', FontAwesomeIcon)

  app.mount('#dashboardApp')

  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('init-graph', { detail: initDashboardData }))
  }, 1000)
}

// Local development: Uncomment this lines and remove type from "import type ..."
// TODO: Find a better solution for local development: https://stackoverflow.com/questions/70709987/how-to-load-environment-variables-from-env-file-using-vite
// const backendUrl = 'https://tasverdatas.showcase.verdatas.inf.tu-dresden.de';
// const pseudoId = 'verdatas1'
// const authUrl = backendUrl + '/api/v1/auth/login'
// const request = {
//   actorAccountName: pseudoId
// }
// axios.post(authUrl, request).then((data: any) => {
//   const token = data.data?.token
//   const dashboardData = new DashboardData(localNode, token, backendUrl)
//   dashboardData.previewMode = false
//   dashboardData.canViewOnly = false
//   dashboardData.path = ''
//   initDashboard(dashboardData)
// })

export function init(initDashboardData: DashboardData) {
  initDashboard(initDashboardData)
}
