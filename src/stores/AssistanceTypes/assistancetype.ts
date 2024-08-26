import type { TAssistanceTypeInput } from '@/types/AssistanceType/operation'
import type { TAssistanceType, TIONode, TOperationNode } from '@/types/AssistanceType/serialization'
import type { TIOTypes } from '@/types/AssistanceType/variableTypes'
import { addControlEdge, addDataEdge } from '@/util/AssistanceType/edgeCreationHandler'
import {
  createATVariableNode,
  createOperationNode,
  createVariableNode
} from '@/util/AssistanceType/nodeCreationHandler'
import {
  serializeATInputNode,
  serializeControlEdge,
  serializeDataEdge,
  serializeOperation
} from '@/util/AssistanceType/serialization'
import { CVueFlowStoreId } from '@/util/AssistanceType/statics'
import { getId } from '@/util/AssistanceType/useDnD'
import { useVueFlow } from '@vue-flow/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useOperationStore } from './operations'

export enum EAssistanceTypeTrigger {
  PROACTIVE = 'proactive',
  REACTIVE = 'reactive'
}

export const useAssistanceTypeStore = defineStore('at/assistancetype', () => {
  const _id = ref<string | undefined>(undefined)
  const name = ref('')
  const description = ref('')
  const trigger = ref<EAssistanceTypeTrigger>(EAssistanceTypeTrigger.PROACTIVE)
  const _inputs = ref<TAssistanceTypeInput[]>([])

  const id = computed(() => _id.value)
  const inputs = computed(() => _inputs.value)

  /** Creates new Assistance Type data (init id, default name, default description) */
  function createAssistanceType() {
    _id.value = getId()
    name.value = 'Unbekannt'
    description.value = ''
    _inputs.value = []
  }

  /** Clears all AT Data and gets back to the selection menu */
  function unsetAssistanceType() {
    _id.value = undefined
    name.value = ''
    description.value = ''
    _inputs.value = []
  }

  /** Get input variable for current assistance type. */
  function getInputVariable(name: string): TAssistanceTypeInput | undefined {
    return _inputs.value.find((input) => input.name.toLowerCase() == name.toLowerCase())
  }

  /** Create input variable for current assistance type. */
  function createInputVariable(name: string, description: string, type: TIOTypes, required: boolean = true): boolean {
    if (getInputVariable(name)) {
      toast.error('Ein Eingang mit diesem Namen existiert bereits.')
      return false
    }
    _inputs.value.push({
      name: name,
      description: description,
      type: type,
      required: required
    })
    return true
  }

  /** Update input variable for current assistance type. */
  function updateInputVariable(
    oldname: string,
    name?: string,
    description?: string,
    type?: TIOTypes,
    required?: boolean
  ): boolean {
    const { updateNodeData, getEdges, removeEdges } = useVueFlow(CVueFlowStoreId)

    const input = getInputVariable(oldname)
    if (!input) {
      console.error('Input variable not found', name)
      return false
    }
    const nodes = getNodesForInputVariable(oldname)
    if (type && input.type != type) {
      if (!confirm('Eine Änderung des Typs dieses Einganges entfernt all seine Verbindungen. Möchten Sie fortfahren?'))
        return false
      const nodeIds = nodes.map((node) => node.id)
      removeEdges(getEdges.value.filter((edge) => nodeIds.includes(edge.source)).map((edge) => edge.id))
    }
    input.name = name ?? input.name
    input.description = description ?? input.description
    input.type = type ?? input.type
    input.required = required ?? input.required

    nodes.forEach((node) => {
      updateNodeData(node.id, {
        label: input.name
      })
    })
    return true
  }

  /** Remove input variable for current assistance type. */
  function removeInputVariable(name: string) {
    const { getNodes, removeNodes } = useVueFlow(CVueFlowStoreId)
    removeNodes(getNodes.value.filter((node) => node.type == 'at-input' && node.data.variable.name == name))
    _inputs.value = _inputs.value.filter((input) => input.name != name)
  }

  /** Get Nodes for Input Variable */
  function getNodesForInputVariable(name: string) {
    const { getNodes } = useVueFlow(CVueFlowStoreId)
    return getNodes.value.filter((node) => node.type == 'at-input' && node.data.variable.name == name)
  }

  /** Save the current assistance type to json format */
  function saveAssistanceType() {
    const { getNodes, getEdges } = useVueFlow(CVueFlowStoreId)

    if (!_id.value) return
    const operations = getNodes.value.filter((node) => node.type == 'operation').map(serializeOperation)
    const resObj: TAssistanceType = {
      id: _id.value,
      name: name.value,
      description: description.value,
      trigger: {
        type: trigger.value,
        definition: {}
      },
      inputs: {
        definitions: _inputs.value,
        nodes: getNodes.value.filter((node) => node.type == 'at-input').map(serializeATInputNode)
      },
      operations: operations,
      connectors: {
        control: getEdges.value.filter((edge) => edge.type == 'control').map(serializeControlEdge),
        data: getEdges.value.filter((edge) => edge.type == 'data').map(serializeDataEdge)
      }
    }
    console.log(resObj)
    console.log(JSON.stringify(resObj))
  }

  /** Load the assistance type from json format */
  async function loadAssistanceType(json: TAssistanceType) {
    const res = await useOperationStore().requestOperations()
    if (res.status != 200) {
      console.error('Failed to load operations')
      return
    }

    const data = json
    _id.value = data.id
    name.value = data.name
    description.value = data.description
    trigger.value = EAssistanceTypeTrigger[data.trigger.type.toUpperCase()]
    _inputs.value = data.inputs.definitions

    for (const operation of data.operations as TOperationNode[]) {
      createOperationNode(
        operation.id,
        operation.operation,
        operation?.flowContext?.position ?? { x: 0, y: 0 }
        // operation?.flowContext?.dimensions
      )
      for (const io of operation.io as TIONode[]) {
        if (io.type == 'error') continue
        const variable = useOperationStore().getVariableById(operation.operation, io.name, io.type)
        if (!variable) continue
        createVariableNode(operation.id, variable, io.type, {
          id: io.id,
          position: io?.flowContext?.position
          // dimensions: io?.flowContext?.dimensions
        })
      }
    }

    for (const input of data.inputs.nodes) {
      const i = getInputVariable(input.name)
      if (!i) {
        console.error('Input variable not found in input definitions', input.name)
        continue
      }
      createATVariableNode(input.id, i, input?.flowContext?.position ?? { x: 0, y: 0 }, {
        // dimensions: input?.flowContext?.dimensions
      })
    }

    for (const edge of data.connectors.control) {
      addControlEdge(edge.source, edge.target, {
        trigger: {
          trigger: edge.trigger,
          schedule: edge.schedule
        }
      })
    }
    for (const edge of data.connectors.data) {
      addDataEdge(edge.source, edge.target)
    }
  }

  return {
    id,
    name,
    description,
    trigger,
    inputs,
    createAssistanceType,
    unsetAssistanceType,
    getInputVariable,
    createInputVariable,
    updateInputVariable,
    removeInputVariable,
    getNodesForInputVariable,
    saveAssistanceType,
    loadAssistanceType
  }
})
