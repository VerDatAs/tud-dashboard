import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './assets/main.scss'

export function init(initGraphData: Array<any>) {

  const app = createApp(App)

  app.use(createPinia())

  app.mount('#dashboardApp')

  setTimeout(() => {
    document.dispatchEvent(new CustomEvent("init-graph", { "detail": initGraphData }));
  }, 1000);
}

