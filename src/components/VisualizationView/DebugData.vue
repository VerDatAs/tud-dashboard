<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Franz Rodestock)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script setup lang="ts">
import {ref} from "vue";
import axios from "axios";
import {useDashboardDataStore} from "@/stores/dashboardData";
import {useSettingStore} from "@/stores/settings";

const dashboardDataStore = useDashboardDataStore()
const settings = useSettingStore()

const props = defineProps({
  adminToken: String,
  pseudoId: String
})

const randomUsers = ['Sebastian', 'Franz', 'Jasmin', 'Paul', 'Marie']
const randomVerbs = ['experienced', 'loggedin', 'launched', 'completed', 'interacted', 'answered']
const randomDefinitions = ['Service and Cloud Computing', 'Diskrete Strukturen', 'Computergrafik 1', 'Technische Grundlagen']

const rawStatement = ref({
  "statement": {
    "actor": {
      "account": {
        "homePage": "http://showcase.verdatas.inf.tu-dresden.de:3443",
        "name": "Platzhalter"
      },
      "name": "-",
      "objectType": "Agent"
    },
    "id": "067a83ea-4fa5-4bfa-b94f-8f9ed445f26b",
    "object": {
      "definition": {
        "name": {
          "en-US": "Modul 1"
        },
        "type": "http://adlnet.gov/expapi/activities/module"
      },
      "id": "https://showcase.verdatas.inf.tu-dresden.de:3443/goto.php?target=pg_1315_94&cl2ient_id=default&obj_id_lrs=324",
      "objectType": "Activity"
    },
    "stored": "2023-05-18T11:41:37.729Z",
    "timestamp": "2023-05-18T13:41:37.000000+02:00",
    "verb": {
      "display": {
        "en-US": "experienced"
      },
      "id": "http://adlnet.gov/expapi/verbs/experienced"
    },
    "version": "1.0.0"
  },
  "supportedAssistanceTypes": [
    {
      "key": "debug"
    }
  ]
})

const queryUrl = dashboardDataStore.data.backendUrl + '/api/v1/statements'
const authHeader = {
  'Content-Type': 'application/json;charset=UTF-8',
  Authorization: 'Bearer ' + props.adminToken
}

function sendDebugData() {
  const randomUserIndex = Math.floor(Math.random() * randomUsers.length);
  const randomVerbIndex = Math.floor(Math.random() * randomVerbs.length);
  const randomDefinitionIndex = Math.floor(Math.random() * randomDefinitions.length);

  rawStatement.value.statement.actor.account.name = props.pseudoId
  rawStatement.value.statement.verb.display['en-US'] = randomVerbs[randomVerbIndex]
  rawStatement.value.statement.object.definition.name['en-US'] = randomDefinitions[randomDefinitionIndex]
  rawStatement.value.statement.object.id = randomDefinitions[randomDefinitionIndex]
  rawStatement.value.statement.timestamp = new Date().toUTCString()

  console.log(rawStatement.value)

  axios.post(queryUrl, rawStatement.value.statement, { headers: authHeader }).then((data) => {})
}
</script>

<template>
<div>
  <div
    v-if="settings.debugging"
    @click="sendDebugData"
    style="background-color: #e0e0e0; padding: 3px; margin: 3px; cursor: pointer; width: 90px"
  >
    Demo Daten
  </div>
</div>
</template>

<style scoped lang="scss">

</style>