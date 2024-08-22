<script setup lang="ts">
import { useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { type GraphNode, type GraphEdge, useVueFlow } from '@vue-flow/core'
import { watchArray } from '@vueuse/core'
import { computed, ref } from 'vue'
import { EMilliseconds, CMillisecondsUtils } from '@/util/AssistanceType/millisecondHelper'
const sidebarStore = useSidebarStore()
const { findNode, updateEdgeData } = useVueFlow()

const edge = computed((): GraphEdge => sidebarStore.currentObject as GraphEdge)

const isControl = computed(() => edge.value.type === 'control')
const isData = computed(() => edge.value.type === 'data')

function selectNode(node: GraphNode) {
  let usedNode = node
  if (isData.value) {
    let parent = findNode(node.parentNode)
    if (parent) usedNode = parent
  }
  sidebarStore.setNode(usedNode.id)
}

const trigger = ref(edge.value.data.trigger ?? 'direct')
const { timeNumber: tn, timeUnit: tu } = CMillisecondsUtils.loadMilisecondsToProperValue(edge.value.data.schedule ?? 1)
const timeNumber = ref(tn)
const timeUnit = ref(tu)

watchArray(
  [trigger, timeNumber, timeUnit],
  () => {
    if (isControl.value) {
      if (trigger.value === 'scheduled') {
        edge.value.label = `${timeNumber.value}${CMillisecondsUtils.toString(timeUnit.value)}`
      } else {
        edge.value.label = ''
      }
      updateEdgeData(edge.value.id, {
        trigger: trigger.value,
        schedule: timeNumber.value * timeUnit.value
      })

      // This is all just for the redraw, else the background of the label is not getting updated properly to a new text-size
      // We move the target node 1 pixel right and after 1 tick back to the original position
      // const p = { x: edge.value.targetNode.position.x + 1, y: edge.value.targetNode.position.y }
      // const q = { x: edge.value.targetNode.position.x, y: edge.value.targetNode.position.y }
      // applyNodeChanges([
      //   {
      //     id: edge.value.target,
      //     from: q,
      //     position: p,
      //     type: 'position'
      //   }
      // ])
      // nextTick(() =>
      //   applyNodeChanges([
      //     {
      //       id: edge.value.target,
      //       from: p,
      //       position: q,
      //       type: 'position'
      //     }
      //   ])
      // )
      // ----
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="sidebar-edge-view" v-if="edge">
    <div>
      <div class="heading">
        <p>Verbindung</p>
      </div>
      <div class="subheading duoGrid">
        <p>ID:</p>
        <i class="id" :title="edge.id">{{ edge.id }}</i>
        <p>Typ:</p>
        <i
          :style="{
            color: isControl ? 'var(--vf-operation-color-handle)' : isData ? 'var(--vf-io-color-handle)' : 'inherit'
          }"
          >{{ isControl ? 'Kontrollfluss' : isData ? 'Datenfluss' : 'Unbekannt' }}</i
        >
      </div>
    </div>
    <div class="io duoGrid">
      <p>Von:</p>
      <p class="node" :class="{ control: isControl, data: isData }" @click="selectNode(edge.sourceNode)">
        {{ edge.sourceNode.data.label }}
      </p>
      <p>Nach:</p>
      <p class="node" :class="{ control: isControl, data: isData }" @click="selectNode(edge.targetNode)">
        {{ edge.targetNode.data.label }}
      </p>
    </div>
    <div v-if="isControl" class="triggerSection">
      <div class="underheading">
        <p>Auslöser</p>
      </div>
      <div class="duoGrid">
        <p>Auslöser:</p>
        <select name="trigger" v-model="trigger">
          <option value="direct">Direkt</option>
          <option value="scheduled">Nach Zeit</option>
        </select>
        <p v-if="trigger === 'scheduled'">Wartezeit:</p>
        <div class="oneRow timing" v-if="trigger === 'scheduled'">
          <input type="number" min="1" step="1" v-model="timeNumber" />
          <select name="timeUnit" v-model="timeUnit">
            <option :value="EMilliseconds.MILLISECOND">Millisekunden</option>
            <option :value="EMilliseconds.SECOND" selected>Sekunden</option>
            <option :value="EMilliseconds.MINUTE">Minuten</option>
            <option :value="EMilliseconds.HOUR">Stunden</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sidebar-edge-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .subheading {
    .id {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .io {
    align-items: center;

    .node {
      cursor: pointer;
      border-width: 1px;
      border-style: solid;
      border-radius: 5px;
      padding: 2px 5px;
      text-align: center;

      &.control {
        border-color: var(--vf-operation-color-border);
        background-color: var(--vf-operation-color-bg);
      }

      &.data {
        border-color: var(--vf-io-color-border);
        background-color: var(--vf-io-color-bg);
      }
    }
  }

  .triggerSection {
    .timing {
      input {
        width: 10ch;
      }
    }
  }
}
</style>
