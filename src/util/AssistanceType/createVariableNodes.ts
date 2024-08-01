import type { TInput, TOutput } from '@/types/AssistanceType/operation'
import { type AddNodes } from '@vue-flow/core'
import { createVariableNodeID } from './AssistanceTypeHelper'

export function createVariableNode(
  operationNodeId: string,
  variable: TInput | TOutput,
  variableType: 'input' | 'output',
  addNodesFunction: AddNodes
) {
  // Any because else crying about "extent cant be string, must be "parent"" but it is parent
  const newNode: any = {
    id: createVariableNodeID(operationNodeId, variableType, variable.name),
    type: variableType == 'input' ? 'datainput' : variableType == 'output' ? 'dataoutput' : 'data',
    position:
      variableType == 'output' ? { x: 40, y: 100 } : variableType == 'input' ? { x: 40, y: 10 } : { x: 0, y: 0 },
    data: {
      label: variable.name,
      variable: variable
    },
    parentNode: operationNodeId,
    extent: 'parent',
    expandParent: true
  }

  addNodesFunction(newNode)
}
