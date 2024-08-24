import { serializeControlEdge, serializeDataEdge, serializeOperation } from '@/util/AssistanceType/serialization'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { getId } from '@/util/AssistanceType/useDnD'
import { useVueFlow } from '@vue-flow/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export enum EAssistanceTypeTrigger {
  PROACTIVE = 'proactive',
  REACTIVE = 'reactive'
}

export const useAssistanceTypeStore = defineStore('at/assistancetype', () => {
  const _id = ref<string | undefined>(undefined)
  const name = ref('')
  const description = ref('')
  const trigger = ref<EAssistanceTypeTrigger>(EAssistanceTypeTrigger.PROACTIVE)

  const id = computed(() => _id.value)

  /** Creates new Assistance Type data (init id, default name, default description) */
  function createAssistanceType() {
    _id.value = getId()
    name.value = 'Unbekannt'
    description.value = ''
  }

  /** Clears all AT Data and gets back to the selection menu */
  function unsetAssistanceType() {
    _id.value = undefined
    name.value = ''
    description.value = ''
  }

  /** Save the current assistance type to json format */
  function saveAssistanceType() {
    const { getNodes, getEdges } = useVueFlow(CVueFlowStoreId)

    const operations = getNodes.value.filter((node) => node.type == 'operation').map(serializeOperation)
    const resObj = {
      id: _id.value,
      name: name.value,
      description: description.value,
      trigger: {
        type: trigger.value,
        definition: {}
      },
      inputs: [],
      operations: operations,
      connectors: {
        control: getEdges.value.filter((edge) => edge.type == 'control').map(serializeControlEdge),
        data: getEdges.value.filter((edge) => edge.type == 'data').map(serializeDataEdge)
      }
    }
    console.log(resObj)
  }

  return {
    id,
    name,
    description,
    trigger,
    createAssistanceType,
    unsetAssistanceType,
    saveAssistanceType
  }
})
