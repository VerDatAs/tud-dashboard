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
//   const courseNode = {
//     "lcoType": "ILIAS_COURSE",
//     "attributes": [
//       {
//         "key": "objectId",
//         "value": "http://localhost:8081/goto.php?target=crs_83&client_id=default&obj_id_lrs=309"
//       },
//       {
//         "key": "title",
//         "value": "VerDatAs Demonstrationskurs"
//       },
//       {
//         "key": "description",
//         "value": ""
//       },
//       {
//         "key": "modules",
//         "value": [
//           {
//             "lcoType": "ILIAS_MODULE",
//             "attributes": [
//               {
//                 "key": "objectId",
//                 "value": "http://localhost:8081/goto.php?target=lm_84&client_id=default&obj_id_lrs=313"
//               },
//               {
//                 "key": "title",
//                 "value": "Testmodul 13 Nov"
//               },
//               {
//                 "key": "description",
//                 "value": ""
//               },
//               {
//                 "key": "offline",
//                 "value": false
//               },
//               {
//                 "key": "chapters",
//                 "value": [
//                   {
//                     "lcoType": "ILIAS_CHAPTER",
//                     "attributes": [
//                       {
//                         "key": "objectId",
//                         "value": "http://localhost:8081/goto.php?target=st_2_84&client_id=default&obj_id_lrs=313"
//                       },
//                       {
//                         "key": "title",
//                         "value": "Kapitel 1"
//                       },
//                       {
//                         "key": "contentPages",
//                         "value": [
//                           {
//                             "lcoType": "ILIAS_CONTENT_PAGE",
//                             "attributes": [
//                               {
//                                 "key": "objectId",
//                                 "value": "http://localhost:8081/goto.php?target=pg_3_84&client_id=default&obj_id_lrs=313"
//                               },
//                               {
//                                 "key": "title",
//                                 "value": "Inhaltsseite 1"
//                               },
//                               {
//                                 "key": "content",
//                                 "value": "<PageObject><PageContent PCID=\"1510321342920596300\"><Paragraph Language=\"en\" Characteristic=\"Standard\">Inhalt der Inhaltsseite 1</Paragraph></PageContent></PageObject>"
//                               },
//                               {
//                                 "key": "interactiveTasks",
//                                 "value": []
//                               }
//                             ]
//                           },
//                           {
//                             "lcoType": "ILIAS_CONTENT_PAGE",
//                             "attributes": [
//                               {
//                                 "key": "objectId",
//                                 "value": "http://localhost:8081/goto.php?target=pg_4_84&client_id=default&obj_id_lrs=313"
//                               },
//                               {
//                                 "key": "title",
//                                 "value": "Inhaltsseite 2"
//                               },
//                               {
//                                 "key": "content",
//                                 "value": "<PageObject></PageObject>"
//                               },
//                               {
//                                 "key": "interactiveTasks",
//                                 "value": []
//                               }
//                             ]
//                           }
//                         ]
//                       }
//                     ]
//                   },
//                   {
//                     "lcoType": "ILIAS_CHAPTER",
//                     "attributes": [
//                       {
//                         "key": "objectId",
//                         "value": "http://localhost:8081/goto.php?target=st_5_84&client_id=default&obj_id_lrs=313"
//                       },
//                       {
//                         "key": "title",
//                         "value": "Kapitel 2"
//                       },
//                       {
//                         "key": "contentPages",
//                         "value": [
//                           {
//                             "lcoType": "ILIAS_CONTENT_PAGE",
//                             "attributes": [
//                               {
//                                 "key": "objectId",
//                                 "value": "http://localhost:8081/goto.php?target=pg_6_84&client_id=default&obj_id_lrs=313"
//                               },
//                               {
//                                 "key": "title",
//                                 "value": "Inhaltsseite 3"
//                               },
//                               {
//                                 "key": "content",
//                                 "value": "<PageObject></PageObject>"
//                               },
//                               {
//                                 "key": "interactiveTasks",
//                                 "value": []
//                               }
//                             ]
//                           },
//                           {
//                             "lcoType": "ILIAS_CONTENT_PAGE",
//                             "attributes": [
//                               {
//                                 "key": "objectId",
//                                 "value": "http://localhost:8081/goto.php?target=pg_7_84&client_id=default&obj_id_lrs=313"
//                               },
//                               {
//                                 "key": "title",
//                                 "value": "Inhaltsseite 4"
//                               },
//                               {
//                                 "key": "content",
//                                 "value": "<PageObject></PageObject>"
//                               },
//                               {
//                                 "key": "interactiveTasks",
//                                 "value": []
//                               }
//                             ]
//                           }
//                         ]
//                       }
//                     ]
//                   },
//                   {
//                     "lcoType": "ILIAS_CHAPTER",
//                     "attributes": [
//                       {
//                         "key": "objectId",
//                         "value": "http://localhost:8081/goto.php?target=st_8_84&client_id=default&obj_id_lrs=313"
//                       },
//                       {
//                         "key": "title",
//                         "value": "Kapitel 3"
//                       },
//                       {
//                         "key": "contentPages",
//                         "value": [
//                           {
//                             "lcoType": "ILIAS_CONTENT_PAGE",
//                             "attributes": [
//                               {
//                                 "key": "objectId",
//                                 "value": "http://localhost:8081/goto.php?target=pg_9_84&client_id=default&obj_id_lrs=313"
//                               },
//                               {
//                                 "key": "title",
//                                 "value": "Inhaltsseite 5"
//                               },
//                               {
//                                 "key": "content",
//                                 "value": "<PageObject></PageObject>"
//                               },
//                               {
//                                 "key": "interactiveTasks",
//                                 "value": []
//                               }
//                             ]
//                           }
//                         ]
//                       }
//                     ]
//                   }
//                 ]
//               }
//             ]
//           }
//         ]
//       },
//       {
//         "key": "tests",
//         "value": []
//       }
//     ]
//   };
//   const dashboardData = new DashboardData(courseNode, token, backendUrl)
//   dashboardData.previewMode = false
//   dashboardData.canViewOnly = false
//   dashboardData.path = ''
//   initDashboard(dashboardData)
// })

export function init(initDashboardData: DashboardData) {
  initDashboard(initDashboardData)
}
