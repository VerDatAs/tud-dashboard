import type {
  TATInputNode,
  TControlEdge,
  TDataEdge,
  TFlowContext,
  TIONode,
  TOperationNode
} from '@/types/AssistanceType/serialization'
import { useVueFlow, type GraphEdge, type GraphNode } from '@vue-flow/core'
import { CVueFlowStoreId } from './statics'

export function serializeATInputNode(node: GraphNode): TATInputNode {
  return {
    id: node.id,
    name: node.data.variable.name,
    flowContext: serializeFlowContext(node)
  }
}

export function serializeIO(node: GraphNode): TIONode {
  return {
    id: node.id,
    name: node.data.variable.name,
    type: node.type == 'datainput' ? 'input' : node.type == 'dataoutput' ? 'output' : 'error',
    flowContext: serializeFlowContext(node)
  }
}

export function serializeFlowContext(node: GraphNode): TFlowContext {
  return {
    position: {
      x: node.position.x,
      y: node.position.y
    },
    dimensions: {
      width: node.dimensions.width,
      height: node.dimensions.height
    }
  }
}

export function serializeStartNode(node: GraphNode): { flowContext: TFlowContext } {
  return {
    flowContext: serializeFlowContext(node)
  }
}

export function serializeOperation(node: GraphNode): TOperationNode {
  const { getNodes } = useVueFlow(CVueFlowStoreId)
  let children: TIONode[] = []
  if (node.isParent) children = getNodes.value.filter((child) => child.parentNode == node.id).map(serializeIO)
  return {
    id: node.id,
    operation: node.data.operation.id,
    flowContext: serializeFlowContext(node),
    io: children
  }
}

export function serializeDataEdge(edge: GraphEdge): TDataEdge {
  return {
    source: edge.source,
    target: edge.target
  }
}

export function serializeControlEdge(edge: GraphEdge): TControlEdge {
  return {
    source: edge.source,
    target: edge.target,
    trigger: edge.data.trigger
  }
}
