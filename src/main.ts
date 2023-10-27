import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/main.scss'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faRefresh, faFloppyDisk, faGear, faFolder, faBezierCurve, faSitemap, faAnglesRight, faMaximize } from '@fortawesome/free-solid-svg-icons'

library.add(faRefresh, faFloppyDisk, faGear, faFolder, faBezierCurve, faSitemap, faAnglesRight, faMaximize)

const app = createApp(App)

app.use(createPinia())

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')