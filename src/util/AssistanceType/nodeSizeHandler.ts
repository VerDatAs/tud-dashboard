import { useVueFlow } from '@vue-flow/core'
import { COperationDefaultNodeWidth, CVueFlowStoreId } from './statics'

export function triggerNodeSizer(nodeId?: string) {
  if (nodeId) triggerNodeSizerNode(nodeId)
  else triggerNodeSizerAll()
}

function triggerNodeSizerAll() {
  const { getNodes } = useVueFlow(CVueFlowStoreId)
  const parentNodes = getNodes.value.filter((n) => n.isParent)
  for (const node of parentNodes) {
    triggerNodeSizerNode(node.id)
  }
}

function triggerNodeSizerNode(nodeId: string) {
  const { findNode, getNodes } = useVueFlow(CVueFlowStoreId)
  const node = findNode(nodeId)
  if (!node) return
  if (node.parentNode) {
    triggerNodeSizerNode(node.parentNode)
  }
  if (!node.isParent) return
  const childNodes = getNodes.value.filter((n) => n.parentNode == node.id)

  const inputNodes = childNodes.filter((n) => n.type == 'datainput')
  const outputNodes = childNodes.filter((n) => n.type == 'dataoutput')

  const nodeWidth =
    inputNodes.reduce((acc, n) => {
      n.position.y = 10
      n.position.x = acc
      return acc + n.dimensions.width + 5
    }, 40) + 10

  node.width = Math.max(nodeWidth, COperationDefaultNodeWidth)

  outputNodes.reduce((acc, n) => {
    n.position.y = node.dimensions.height - 10 - n.dimensions.height
    n.position.x = acc
    return acc + n.dimensions.width + 5
  }, 40)
}
