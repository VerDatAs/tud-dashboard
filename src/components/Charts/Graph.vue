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
import {use, registerTheme} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";
import {BarChart, GraphChart} from "echarts/charts";
import {GridComponent, DatasetComponent, TooltipComponent, LegendComponent} from "echarts/components";
import VChart from "vue-echarts";
import {ref, watch} from "vue";

use([BarChart, GraphChart, DatasetComponent, GridComponent, CanvasRenderer, TooltipComponent, LegendComponent]);

const props = defineProps({
  categories: Array, // [{ "name": Cat1 }]
  nodes: Array, // [{ "id": "0", "name": "Node 1", "symbolSize": 19, "value": 28, "category": 0 }]
  links: Array, // [{ "source": "Source-Node-ID", "target": "Target-Node-ID", "label": "Label" }]
})

const option = ref({})

watch(() => props, () => {
  updateOptions()
}, {deep: true})

function updateOptions() {
  option.value = {
    tooltip: {},
    legend: [
      {
        data: props.categories.map(function (a) {
          return a.name;
        })
      }
    ],
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: 'xAPI statements',
        type: 'graph',
        layout: 'force',
        force: {
          // Parameters for the force simulation
          repulsion: 1000,
          edgeLength: 150,
        },
        data: props.nodes,
        links: props.links,
        categories: props.categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        labelLayout: {
          hideOverlap: true
        },
        scaleLimit: {
          min: 0.4,
          max: 2
        },
        lineStyle: {
          color: 'target',
          curveness: 0.3
        },
        edgeLabel: {
          show: true,
          formatter: function(params) {
            return params.data.label ? params.data.label.formatter : '';
          },
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        }
      }
    ]
  }
}
</script>

<template>
  <div>
    <!--
    Nodes:
    {{ nodes }} <br><br>
    Categories:
    {{ categories }} <br><br>
    Links
    {{ links}} <br><br>-->
    <v-chart
        v-if="nodes"
        :option="option"
        autoresize
        style="height: 500px"
    />
  </div>
</template>

<style scoped lang="scss">

</style>