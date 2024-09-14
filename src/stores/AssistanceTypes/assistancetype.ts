import type { TAssistanceTypeInput } from '@/types/AssistanceType/operation'
import type {
  TAssistanceType,
  TATInputNode,
  TControlEdge,
  TDataEdge,
  TIONode,
  TOperationNode
} from '@/types/AssistanceType/serialization'
import type { TIOTypes } from '@/types/AssistanceType/variableTypes'
import { addControlEdge, addDataEdge } from '@/util/AssistanceType/edgeCreationHandler'
import useFlowChangeHandler from '@/util/AssistanceType/flowChangeHandler'
import {
  createATVariableNode,
  createOperationNode,
  createStartNode,
  createVariableNode
} from '@/util/AssistanceType/nodeCreationHandler'
import {
  serializeATInputNode,
  serializeControlEdge,
  serializeDataEdge,
  serializeOperation
} from '@/util/AssistanceType/serialization'
import { baseApiUrl, CVueFlowStoreId, defaultHeaders } from '@/util/AssistanceType/statics'
import { useVueFlow } from '@vue-flow/core'
import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useOperationStore } from './operations'

export enum EAssistanceTypeTrigger {
  PROACTIVE = 'proactive',
  REACTIVE = 'reactive'
}

export const useAssistanceTypeStore = defineStore('at/assistancetype', () => {
  const _id = ref<string>('')
  const name = ref('')
  const description = ref('')
  const trigger = ref<EAssistanceTypeTrigger>(EAssistanceTypeTrigger.PROACTIVE)
  const _inputs = ref<TAssistanceTypeInput[]>([])

  const _alreadySaved = ref(false)
  const _showAT = ref(false)
  const _saving = ref(false)

  const showVariableTypesOnNodes = ref(true)

  const id = computed(() => _id.value)
  const inputs = computed(() => _inputs.value)
  const showAT = computed(() => _showAT.value)
  const isSaving = computed(() => _saving.value)

  /** Creates new Assistance Type data (init id, default name, default description) */
  function initEmptyAssistanceType() {
    _showAT.value = true
    _id.value = ''
    name.value = 'Unbekannt'
    description.value = ''
    _inputs.value = []
    _alreadySaved.value = false

    // Clear atSearchTerm
    atsSearchTerm.value = ''
  }

  /** Clears all AT Data and gets back to the selection menu */
  function unsetAssistanceType() {
    _showAT.value = false
    _id.value = ''
    name.value = ''
    description.value = ''
    _inputs.value = []
    _alreadySaved.value = false

    // Clear atSearchTerm
    atsSearchTerm.value = ''

    // Clear Flow
    const { removeEdges, getEdges, removeNodes, getNodes } = useVueFlow(CVueFlowStoreId)
    removeEdges(getEdges.value)
    removeNodes(getNodes.value)
  }

  /** Get input variable for current assistance type. */
  function getInputVariable(name: string): TAssistanceTypeInput | undefined {
    return _inputs.value.find((input) => input.name.toLowerCase() == name.toLowerCase())
  }

  /** Create input variable for current assistance type. */
  function createInputVariable(
    name: string,
    description: string,
    type: TIOTypes,
    required: boolean = true,
    defaultValue: any = ''
  ): boolean {
    if (getInputVariable(name)) {
      toast.error('Ein Eingang mit diesem Namen existiert bereits.')
      return false
    }
    _inputs.value.push({
      name: name,
      description: description,
      type: type,
      required: required,
      default: defaultValue
    })
    return true
  }

  /** Update input variable for current assistance type. */
  function updateInputVariable(
    oldname: string,
    name?: string,
    description?: string,
    type?: TIOTypes,
    required?: boolean,
    defaultValue?: any
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
    input.default = defaultValue ?? input.default

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
  async function saveAssistanceType() {
    const { getNodes, getEdges } = useVueFlow(CVueFlowStoreId)

    if (!_id.value && _alreadySaved.value) {
      return Promise.reject('Aktuell ist kein Assistenztyp ausgewählt.')
    }

    if (_saving.value) {
      return Promise.reject('Speichern ist bereits im Gange.')
    }

    _saving.value = true

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

    if (_alreadySaved.value) {
      // Send Update Request
      return axios
        .put(baseApiUrl + '/' + _id.value, resObj, { headers: defaultHeaders })
        .then((res) => {
          toast.success('Assistenztyp erfolgreich aktualisiert.')
          return res
        })
        .catch((err) => {
          toast.error('Fehler beim Aktualisieren des Assistenztyps.')
          console.error(err)
          return err
        })
        .finally(() => {
          _saving.value = false
        })
    } else {
      // Send Create Request
      return axios
        .post(baseApiUrl, resObj, { headers: defaultHeaders })
        .then((res) => {
          _alreadySaved.value = true
          _id.value = res.data.id
          toast.success('Assistenztyp erfolgreich erstellt.')
          return res
        })
        .catch((err) => {
          toast.error('Fehler beim Erstellen des Assistenztyps.')
          console.error(err)
          return err
        })
        .finally(() => {
          _saving.value = false
        })
    }
  }

  /** Load the assistance type from json format */
  async function loadAssistanceType(id: string): Promise<string> {
    const resType = await axios.get(baseApiUrl + '/' + id, { headers: defaultHeaders })
    if (!resType) return Promise.reject('Assistenztyp konnte nicht geladen werden.')

    const res = await useOperationStore().requestOperations()
    if (res.status != 200) {
      console.error('Failed to load operations', res)
      return Promise.reject('Fehler beim Laden der Operationen.')
    }

    const data = resType.data
    _showAT.value = true
    _id.value = data.id
    name.value = data.name
    description.value = data.description
    trigger.value = EAssistanceTypeTrigger[data.trigger.type.toUpperCase()]
    _inputs.value = data.inputs.definitions
    _alreadySaved.value = true

    useFlowChangeHandler() // So the following changes get applied
    createStartNode()

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

    for (const input of data.inputs.nodes as TATInputNode[]) {
      const i = getInputVariable(input.name)
      if (!i) {
        console.error('Input variable not found in input definitions', input.name)
        continue
      }
      createATVariableNode(input.id, i, input?.flowContext?.position ?? { x: 0, y: 0 }, {
        // dimensions: input?.flowContext?.dimensions
      })
    }

    for (const edge of data.connectors.control as TControlEdge[]) {
      addControlEdge(edge.source, edge.target, {
        trigger: edge.trigger
      })
    }
    for (const edge of data.connectors.data as TDataEdge[]) {
      addDataEdge(edge.source, edge.target)
    }

    /*
     *  Wait for animations to finish, then resize the nodes
     *  -> now triggers onMounted FlowChart
     */
    // setTimeout(() => {
    // triggerNodeSizer()
    // }, 250)

    return Promise.resolve('Assistenztyp erfolgreich geladen.')
  }

  async function deleteAssistanceType(id: string) {
    return axios
      .delete(baseApiUrl + '/' + id, { headers: defaultHeaders })
      .then((res) => {
        toast.success('Assistenztyp erfolgreich gelöscht.')
        requestAssistanceTypes()
        return res
      })
      .catch((err) => {
        toast.error('Fehler beim Löschen des Assistenztyps.')
        console.error(err)
        return err
      })
  }

  /*
   *    All Assistance Types
   */
  const _assistanceTypes = ref<TAssistanceType[]>([])
  const _loadingAssistanceTypes = ref<boolean>(true)
  const atsSearchTerm = ref<string>('')

  const assistanceTypes = computed(() => _assistanceTypes.value)
  const loadingAssistanceTypes = computed(() => _loadingAssistanceTypes.value)

  const searchedAssistanceTypes = computed(() => {
    const search = atsSearchTerm.value.toLowerCase().trim()
    return assistanceTypes.value.filter((operation) => {
      return (
        operation.name.toLowerCase().includes(search) ||
        operation.description.toLowerCase().includes(search) ||
        operation.id.toLowerCase().includes(search)
      )
    })
  })

  async function requestAssistanceTypes() {
    _loadingAssistanceTypes.value = true
    return axios
      .get(baseApiUrl, {
        headers: defaultHeaders
      })
      .then((res) => {
        _assistanceTypes.value = res.data.types
        return res.data.types
      })
      .catch((err) => {
        toast.error('Fehler beim Laden der Assistenztypen.')
        return err
      })
      .finally(() => {
        _loadingAssistanceTypes.value = false
      })
  }

  return {
    id,
    name,
    description,
    trigger,
    inputs,
    showVariableTypesOnNodes,
    showAT,
    isSaving,
    initEmptyAssistanceType,
    unsetAssistanceType,
    getInputVariable,
    createInputVariable,
    updateInputVariable,
    removeInputVariable,
    getNodesForInputVariable,
    saveAssistanceType,
    loadAssistanceType,
    deleteAssistanceType,
    // All Assistance Types
    assistanceTypes,
    atsSearchTerm,
    loadingAssistanceTypes,
    searchedAssistanceTypes,
    requestAssistanceTypes
  }
})
