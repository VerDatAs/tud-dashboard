import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faRefresh,
  faFloppyDisk,
  faGear,
  faFolder,
  faBezierCurve,
  faSitemap,
  faAnglesRight,
  faMaximize,
  faDownload,
  faCircleInfo,
  faMagnifyingGlass,
  faCode,
  faList,
  faCircleXmark,
  faCirclePlus,
  faChevronRight,
  faChevronDown,
  faShare
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faRefresh,
  faFloppyDisk,
  faGear,
  faFolder,
  faBezierCurve,
  faSitemap,
  faAnglesRight,
  faMaximize,
  faDownload,
  faCircleInfo,
  faMagnifyingGlass,
  faCode,
  faList,
  faCircleXmark,
  faCirclePlus,
  faChevronRight,
  faChevronDown,
  faShare
)

import { DashboardData } from '@/types/dashboard-data'

import './assets/main.scss'

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
initDashboard(new DashboardData({}, '1234', 'http://develop.verdatas.inf.tu-dresden.de:8062'))

export function init(initDashboardData: DashboardData) {
  initDashboard(initDashboardData)
}
