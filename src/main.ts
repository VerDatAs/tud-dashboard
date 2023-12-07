import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faRefresh, faFloppyDisk, faGear, faFolder, faBezierCurve, faSitemap, faAnglesRight, faMaximize, faDownload, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

library.add(faRefresh, faFloppyDisk, faGear, faFolder, faBezierCurve, faSitemap, faAnglesRight, faMaximize, faDownload, faCircleInfo)

import './assets/main.scss'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#dashboardApp')
