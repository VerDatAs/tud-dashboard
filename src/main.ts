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

import { useDashboardDataStore } from '@/stores/dashboardData'
import { DashboardData } from '@/types/dashboard-data'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAnglesRight,
  faArrowLeft,
  faBarsStaggered,
  faBezierCurve,
  faChartSimple,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleChevronLeft,
  faCircleChevronRight,
  faCircleInfo,
  faCirclePlus,
  faCircleXmark,
  faClock,
  faCode,
  faCopy,
  faDownload,
  faEye,
  faEyeSlash,
  faFilter,
  faFilterCircleXmark,
  faFloppyDisk,
  faFolder,
  faGear,
  faHouse,
  faList,
  faMagnifyingGlass,
  faMaximize,
  faMinimize,
  faMinus,
  faPencil,
  faPlayCircle,
  faPlus,
  faRefresh,
  faShare,
  faSitemap,
  faTrash,
  faUpload,
  faUsers,
  faXmark
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import * as ConfirmDialog from 'vuejs-confirm-dialog'
import App from './App.vue'
import de from './lang/de.json'

library.add(
  faAnglesRight,
  faArrowLeft,
  faBezierCurve,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faCircleInfo,
  faCirclePlus,
  faCircleXmark,
  faClock,
  faCode,
  faCopy,
  faDownload,
  faEye,
  faEyeSlash,
  faFloppyDisk,
  faFolder,
  faGear,
  faHouse,
  faList,
  faMagnifyingGlass,
  faMaximize,
  faMinimize,
  faMinus,
  faPencil,
  faPlayCircle,
  faPlus,
  faRefresh,
  faShare,
  faSitemap,
  faTrash,
  faUpload,
  faUsers,
  faXmark,
  faChartSimple,
  faCircleChevronLeft,
  faCircleChevronRight,
  faFilter,
  faFilterCircleXmark,
  faBarsStaggered
)

import { createI18n } from 'vue-i18n'
import './assets/main.scss'
import('./assets/local-dev.scss')

/* Toast Notifications */
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import axios from 'axios';
import { localNode } from '@/util/InitialEvent';

/**
 * Initialize the dashboard with the provided data.
 *
 * @param {DashboardData} initDashboardData
 */
function initDashboard(initDashboardData: DashboardData) {
  const app = createApp(App)

  app.use(Vue3Toastify, {
    autoClose: 3000,
    position: 'top-right'
  } as ToastContainerOptions)

  app.use(ConfirmDialog)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  const i18n = createI18n({
    locale: 'de',
    fallbackLocale: 'de',
    messages: {
      de: de
    }
  })
  app.use(i18n)

  app.component('font-awesome-icon', FontAwesomeIcon)

  useDashboardDataStore().setDashboardData(initDashboardData)

  app.mount('#dashboardApp')

  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('init-graph', { detail: initDashboardData }))
  }, 1000)
}

const backendUrl = import.meta.env.VITE_BACKEND_URL
const localStorageKey: string = 'evaluation_pseudoId';
const pseudoId: string = localStorage.getItem(localStorageKey) ?? makeId(9)
const authUrl: string = backendUrl + '/api/v1/auth/login'
const request = {
  actorAccountName: pseudoId,
  password: 'evaluation'
}
axios.post(authUrl, request).then((data: any) => {
  const token = data.data?.token
  const dashboardData: DashboardData = new DashboardData(localNode, token, backendUrl)
  dashboardData.previewMode = import.meta.env.VITE_PREVIEW_MODE === 'true'
  dashboardData.canViewOnly = import.meta.env.VITE_CAN_VIEW_ONLY === 'true'
  dashboardData.pseudoId = pseudoId
  localStorage.setItem(localStorageKey, pseudoId)
  dashboardData.path = ''
  initDashboard(dashboardData)
})

// retrieved from https://stackoverflow.com/a/1349426
function makeId(length: number) {
  let result: string = '';
  const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength: number = characters.length;
  let counter: number = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
