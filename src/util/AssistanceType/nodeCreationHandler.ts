import { useOperationStore } from '@/stores/AssistanceTypes/operations'
import type { TAssistanceTypeInput, TInput, TOutput } from '@/types/AssistanceType/operation'
import { useVueFlow } from '@vue-flow/core'
import { createVariableNodeID } from './AssistanceTypeHelper'
import { COperationDefaultNodeWidth, CVueFlowStoreId } from './statics'

export function createATVariableNode(
  nodeId: string,
  variable: TAssistanceTypeInput,
  position: { x: number; y: number },
  data: {
    dimensions?: { width: number; height: number }
  } = {}
) {
  const { addNodes } = useVueFlow(CVueFlowStoreId)

  const newNode = {
    id: nodeId,
    type: 'at-input',
    position: position,
    data: {
      label: variable.name,
      variable: variable
    }
  }
  if (data?.dimensions) {
    newNode['width'] = data.dimensions.width
    newNode['height'] = data.dimensions.height
  }

  addNodes(newNode)
}

export function createVariableNode(
  operationNodeId: string,
  variable: TInput | TOutput,
  variableType: 'input' | 'output',
  data: {
    id?: string
    position?: { x: number; y: number }
    dimensions?: { width: number; height: number }
  } = {}
) {
  const pos =
    data.position ??
    (variableType == 'output' ? { x: 40, y: 100 } : variableType == 'input' ? { x: 40, y: 10 } : { x: 0, y: 0 })

  const { addNodes } = useVueFlow(CVueFlowStoreId)

  // Any because else crying about "extent cant be string, must be "parent"" but it is parent
  const newNode: any = {
    id: data.id ?? createVariableNodeID(operationNodeId, variableType, variable.name),
    type: variableType == 'input' ? 'datainput' : variableType == 'output' ? 'dataoutput' : 'data',
    position: pos,
    data: {
      label: variable.name,
      variable: variable
    },
    parentNode: operationNodeId,
    extent: 'parent',
    draggable: false,
    focusable: false
  }
  if (data?.dimensions) {
    newNode['width'] = data.dimensions.width
    newNode['height'] = data.dimensions.height
  }

  addNodes(newNode)
}

export function createOperationNode(
  nodeId: string,
  operationId: string,
  position: { x: number; y: number },
  dimensions: { width: number; height: number } | undefined = undefined
) {
  const { addNodes } = useVueFlow(CVueFlowStoreId)
  const operation = useOperationStore().getOperationById(operationId)
  if (!operation) return

  const newNode = {
    id: nodeId,
    type: 'operation',
    position: position,
    data: {
      label: operation.name,
      operation: operation
    },
    width: COperationDefaultNodeWidth
  }
  if (dimensions) {
    newNode['width'] = dimensions.width
    newNode['height'] = dimensions.height
  }

  addNodes(newNode)
}

export function createStartNode() {
  const { addNodes } = useVueFlow(CVueFlowStoreId)

  const newNode = {
    id: 'start-node',
    type: 'start',
    position: { x: 0, y: 0 },
    deletable: false,
    draggable: false,
    data: {
      label: 'Start'
    }
  }

  addNodes(newNode)
}
