<script setup lang="ts">
import { useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { type TOperation } from '@/types/AssistanceType/operation'
import { computed, ref } from 'vue'
import ListVariables from '../../Generics/ListVariables.vue'
const sidebarStore = useSidebarStore()

const operation = computed((): TOperation | undefined => sidebarStore.currentObject?.data.operation)

const showInputs = ref<boolean>(true)
const showOutputs = ref<boolean>(true)
</script>

<template>
  <div class="sidebar-node-view" v-if="operation">
    <div>
      <div class="heading">
        <p>{{ operation.name }}</p>
      </div>
      <div class="subheading">
        <p>
          ID: <i>{{ operation.id }}</i>
        </p>
        <p>
          <i>{{ operation.description }}</i>
        </p>
      </div>
    </div>
    <div>
      <div class="underheading">
        <p>Eingänge/Ausgänge hinzufügen</p>
      </div>
      <div class="addIO">
        <div>
          <div class="collapsable pointer" @click="showInputs = !showInputs">
            <font-awesome-icon class="icon" :class="{ rotated: showInputs }" icon="chevron-right" size="sm" />
            <div>Verfügbare Eingänge anzeigen</div>
          </div>
          <div class="io-list" v-if="showInputs">
            <list-variables :variableArray="operation.inputs" type="input" />
          </div>
        </div>
        <div>
          <div class="collapsable pointer" @click="showOutputs = !showOutputs">
            <font-awesome-icon class="icon" :class="{ rotated: showOutputs }" icon="chevron-right" size="sm" />
            <div>Verfügbare Ausgänge anzeigen</div>
          </div>
          <div class="io-list" v-if="showOutputs">
            <list-variables :variableArray="operation.outputs" type="output" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sidebar-node-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.addIO {
  padding-top: 5px;
  padding-left: 10px;
}

.collapsable {
  font-size: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  margin-block: 8px 3px;
}

.io-list {
  font-size: 0.9em;
  padding-left: 20px;
}
</style>
