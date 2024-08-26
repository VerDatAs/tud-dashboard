import { useVueFlow, type GraphNode } from '@vue-flow/core'
import { CVueFlowStoreId } from './statics'

export function getChildrenFromParentId(parentId: string): GraphNode[] {
  const { getNodes } = useVueFlow(CVueFlowStoreId)
  return getNodes.value.filter((node) => node.parentNode === parentId)
}
