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
import Graph from '@/components/Charts/Graph.vue'
import {useSettingStore} from '@/stores/settings'
import {useDashboardDataStore} from "@/stores/dashboardData";
import {computed, onMounted, onUnmounted, ref} from "vue";
import {XapiStatement} from "@/types/xapi-statement";

const settings = useSettingStore()
const dashboardDataStore = useDashboardDataStore()

const page = ref(1)
const filteredVerbs = ref([])
const filteredUsers = ref([])
const filteredDefinitions = ref([])

const statements = ref<Array<XapiStatement>>([])

const paginatedStatements = computed(() => {
  let stmts = statements.value
  if (filteredVerbs.value.length > 0) {
    stmts = stmts.filter(stmt => filteredVerbs.value.includes(stmt.verb))
  }
  if (filteredUsers.value.length > 0) {
    stmts = stmts.filter(stmt => filteredUsers.value.includes(stmt.actorName))
  }
  if (filteredDefinitions.value.length > 0) {
    stmts = stmts.filter(stmt => filteredDefinitions.value.includes(stmt.definition))
  }

  const pageSize = 20;
  const start = (page.value - 1) * pageSize
  return stmts.slice(start, start + pageSize)
})


const graphNodes = ref<Array<Object>>([])
const graphLinks = ref<Array<Object>>([])
const graphCategories = ref<Array<Object>>([])
graphCategories.value.push({"name": "Nutzer"})



defineProps({
  isExpanded: Boolean
})

// in production, the encrypted protocol wss:// should be used
const webSocketUrl = dashboardDataStore.data.getWebsocketUrl();
const webSocket = ref(new WebSocket(webSocketUrl));

function newStatement(statement: XapiStatement) {
  statements.value.unshift(statement);

  // Definition Node
  let definitionNode = graphNodes.value.find(node => node.id === statement.definitionId);
  if (!definitionNode) {
    definitionNode = {
      id: statement.definitionId,
      name: statement.definition,
      symbolSize: 20,
      category: statement.definition
    }
    graphNodes.value.push(definitionNode)
    console.log('New Definition Node Pushed')
  } else {
    definitionNode.symbolSize += 2;
    console.log('Definition Node size increased')
  }
  // User Node
  let userNode = graphNodes.value.find(node => node.id === statement.actorName);
  if (!userNode) {
    userNode = {
      id: statement.actorName,
      name: statement.actorName,
      symbolSize: 20,
      category: "Nutzer"
    }
    graphNodes.value.push(userNode)
    console.log('New User Node Pushed')
  }
  // Category
  let category = graphCategories.value.find(category => category.name === statement.definition);
  if (!category) {
    graphCategories.value.push({name: statement.definition})
    console.log('New Category Pushed')
  }
  // Link
  let link = graphLinks.value.find(link => link.source === statement.actorName && link.target === statement.definitionId);
  if (!link) {
    graphLinks.value.push({
      "source": statement.actorName,
      "target": statement.definitionId,
      "label": { "show": true, "formatter": statement.verb},
    })
    console.log('New Link Node Pushed')
  }
}

onMounted(() => {
  console.log('Mounted');

  const jwtToken = dashboardDataStore.data.token;
  webSocket.value.onopen = (event) => {
    webSocket.value.send("CONNECT\ntoken:" + jwtToken + "\naccept-version:1.2\n\n\0");
    // there is only one destination that needs to be subscribed: /user/queue/chat
    webSocket.value.send("SUBSCRIBE\nid:sub-0\ndestination:/statement\n\n\0");
  };

  webSocket.value.onmessage = (event) => {
    // extract content between \n\n and \0
    const body = event.data.substring(event.data.indexOf('\n\n') + 2, event.data.lastIndexOf("\0"));
    // send JSON data in body of STOMP messages that can be deserialized
    if (body) {
      const bodyParsed = JSON.parse(body);
      const statement = new XapiStatement(bodyParsed);
      newStatement(statement)
    }
  }
})

onUnmounted(() => {
  console.log('Unmounted');
  webSocket.value.close();
})
</script>

<template>
  <div id="settings" :class="`${isExpanded ? 'is-expanded' : ''}`">
    <div class="container py-4 mw-100">
      <h1>Visualisierung</h1>
      <div v-if="webSocket.OPEN" style="color: green">Verbunden</div>
      <div v-else style="color: red">Keine Verbindung</div>
      <div class="mt-5">
        <!-- Display Graph View -->
        <Graph :categories="graphCategories" :links="graphLinks" :nodes="graphNodes"/>
        <!-- Create a table with an xapi statement in each row -->
        <table class="table table-striped">
          <thead>
          <tr>
            <th scope="col">Verb</th>
            <th scope="col">Objekt</th>
            <th scope="col">Akteur</th>
            <th scope="col">Zeit</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="statement in paginatedStatements" :key="statement.id">
            <td style="display: flex; align-content: center">
              <p style="text-transform: capitalize">
                {{ statement.verb }}
              </p>
              <div class="tooltip-container" style="margin-left: 5px">
                <font-awesome-icon class="icon ht" icon="circle-info" />
                <span class="tooltip-text">
                  <p style="font-weight: bold">{{ $t(`_verb.${statement.verb}`) }} - ({{statement.verb}})</p>
                  <p>{{ $t(`_verb._description.${statement.verb}`) }}</p>
                </span>
              </div>
            </td>
            <td>{{ statement.definition }}</td>
            <td>{{ statement.actorName }}</td>
            <td>{{ statement.timestamp.toLocaleTimeString() }}</td>
          </tr>
          </tbody>
          <tfoot>
          <tr>
            <td colspan="4" style="text-align: right">
              {{ page }} / {{ Math.ceil(statements.length / 20)}}
              <font-awesome-icon @click="page=page-1" class="icon fa-xl" style="cursor: pointer" icon="circle-chevron-left" />
              <font-awesome-icon @click="page=page+1" style="margin-left: 5px; cursor: pointer" class="icon fa-xl"  icon="circle-chevron-right" />
            </td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#settings {
  z-index: 8;
  position: absolute;
  top: 10px;
  left: calc(1rem + 32px + 10px);
  height: calc(100% - 20px);
  width: calc(100% - (1rem + 32px) - 20px);
  background: #eee;
  border: 1px solid #ccc;
  overflow-y: scroll;

  &.is-expanded {
    left: calc(var(--sidebar-width) + 10px);
    width: calc(100% - var(--sidebar-width) - 20px);
  }

  .setting {
    margin-top: 5px;

    .icon {
      cursor: pointer;
    }
  }
}

/* Tooltip container */
.tooltip-container {
  position: relative;
  display: inline-block;
  // border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip-container .tooltip-text {
  padding-left: 1em;
  padding-right: 1em;
  visibility: hidden;
  width: 300px;
  background-color: #555;
  color: #fff;
  border-radius: 6px;

  /* Position the tooltip text */
  position: absolute;
  z-index: 1;
  top: -5px;
  left: 125%;
  margin-left: 5px;

  /* Fade in tooltip */
  opacity: 0;
  transition: opacity 0.3s;
}

/* Tooltip arrow */
.tooltip-container .tooltip-text::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 100%;
  margin-top: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent #555 transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
} </style>
