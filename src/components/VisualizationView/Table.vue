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
<script setup>
import Dialog from '@/components/shared/Dialog.vue'
import {computed, onMounted, onUnmounted, ref} from "vue";
import {XapiStatement} from "@/types/xapi-statement";

const page = ref(1)
const showFilterDialog = ref(false)
const filterDialogFilter = ref("")
const filteredVerbs = ref([])
const filteredUsers = ref([])
const filteredDefinitions = ref([])

function checkboxClicked(id, event, type) {
  console.log(id, event, type)
  if (type === 'verb') {
    if (event.target.checked) {
      filteredVerbs.value.push(id)
    } else {
      filteredVerbs.value = filteredVerbs.value.filter(v => v !== id)
    }
  }
  if (type === 'actor') {
    if (event.target.checked) {
      filteredUsers.value.push(id)
    } else {
      filteredUsers.value = filteredUsers.value.filter(v => v !== id)
    }
  }
  if (type === 'definition') {
    if (event.target.checked) {
      filteredDefinitions.value.push(id)
    } else {
      filteredDefinitions.value = filteredDefinitions.value.filter(v => v !== id)
    }
  }
}

const props = defineProps({
  statements: Array
})


const paginatedStatements = computed(() => {
  let stmts = props.statements
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
</script>

<template>
  <div>
    <Dialog :show="showFilterDialog" @close="showFilterDialog = false">
      <template #body>
        <div v-if="filterDialogFilter === 'verb'">
          <div v-for="verb in [...new Set(statements.map(stmt => stmt.verb))]">
            <input type="checkbox" :id="verb" :name="verb" :checked="filteredVerbs.includes(verb)"
                   @input="checkboxClicked(verb, $event, 'verb')">
            <label style="margin-left: 5px; text-transform: capitalize" :for="verb">{{ verb }}</label><br>
          </div>
        </div>
        <div v-if="filterDialogFilter === 'definition'">
          <div v-for="def in [...new Set(statements.map(stmt => stmt.definition))]">
            <input type="checkbox" :id="def" :name="def" :checked="filteredDefinitions.includes(def)"
                   @input="checkboxClicked(def, $event, 'definition')">
            <label style="margin-left: 5px; text-transform: capitalize" :for="def">{{ def }}</label><br>
          </div>
        </div>
        <div v-if="filterDialogFilter === 'actor'">
          <div v-for="actor in [...new Set(statements.map(stmt => stmt.actorName))]">
            <input type="checkbox" :id="actor" :name="actor" :checked="filteredUsers.includes(actor)"
                   @input="checkboxClicked(actor, $event, 'actor')">
            <label style="margin-left: 5px; text-transform: capitalize" :for="actor">{{ actor }}</label><br>
          </div>
        </div>
      </template>
    </Dialog>
    <div class="container py-4 mw-100">
      <!-- Display Graph View -->
      <!-- Create a table with an xapi statement in each row -->
      <!-- max-width: 100% does not work -> https://stackoverflow.com/a/27276818 -->
      <table class="table table-striped" style="display: table; table-layout: fixed; margin-top: 10px">
        <thead>
        <tr>
          <th scope="col">
            Verb
            <font-awesome-icon v-if="filteredVerbs.length === 0"
                               @click="showFilterDialog = true; filterDialogFilter = 'verb'" class="icon"
                               style="cursor: pointer" icon="filter"/>
            <font-awesome-icon v-else @click="showFilterDialog = true; filterDialogFilter = 'verb'" class="icon"
                               style="cursor: pointer" icon="filter-circle-xmark"/>
          </th>
          <th scope="col">
            Objekt
            <font-awesome-icon v-if="filteredDefinitions.length === 0"
                               @click="showFilterDialog = true; filterDialogFilter = 'definition'" class="icon"
                               style="cursor: pointer" icon="filter"/>
            <font-awesome-icon v-else @click="showFilterDialog = true; filterDialogFilter = 'definition'" class="icon"
                               style="cursor: pointer" icon="filter-circle-xmark"/>
          </th>
          <th scope="col">
            Akteur
            <font-awesome-icon v-if="filteredUsers.length === 0"
                               @click="showFilterDialog = true; filterDialogFilter = 'actor'" class="icon"
                               style="cursor: pointer" icon="filter"/>
            <font-awesome-icon v-else @click="showFilterDialog = true; filterDialogFilter = 'definition'" class="icon"
                               style="cursor: pointer" icon="filter-circle-xmark"/>
          </th>
          <th scope="col">
            Zeit
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="statement in paginatedStatements" :key="statement.id">
          <td style="display: flex; align-content: center">
            <p style="text-transform: capitalize">
              {{ statement.verb }}
            </p>
            <div class="tooltip-container" style="margin-left: 5px">
              <font-awesome-icon class="icon ht" icon="circle-info"/>
              <span class="tooltip-text">
                  <p style="font-weight: bold">{{ $t(`_verb.${statement.verb}`) }} - ({{ statement.verb }})</p>
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
            {{ page }} / {{ Math.ceil(statements.length / 20) }}
            <font-awesome-icon @click="page=page-1" class="icon fa-xl" style="cursor: pointer"
                               icon="circle-chevron-left"/>
            <font-awesome-icon @click="page=page+1" style="margin-left: 5px; cursor: pointer" class="icon fa-xl"
                               icon="circle-chevron-right"/>
          </td>
        </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
