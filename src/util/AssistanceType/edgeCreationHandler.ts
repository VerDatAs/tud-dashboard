import { type Connection, type GraphNode, useVueFlow } from '@vue-flow/core'
import { CVueFlowStoreId } from './statics'

const OPERATION_TYPE = 'operation'
const DATA_INPUT_TYPE = 'datainput'
const DATA_OUTPUT_TYPE = 'dataoutput'

export default function useEdgeCreationHandler() {
  const { onConnect, findNode, addEdges } = useVueFlow(CVueFlowStoreId)

  onConnect((e) => {
    const source = findNode(e.source)
    const target = findNode(e.target)
    if (!source || !target) return
    // Connect operation nodes
    // Connecting own output to own input doesnt work by default
    if (source.type === OPERATION_TYPE && target.type === OPERATION_TYPE) addControlEdge(e, source, target)
    // Connect data nodes
    else if (source.type === DATA_OUTPUT_TYPE && target.type === DATA_INPUT_TYPE) addDataEdge(e, source, target)
  })

  function addControlEdge(e: Connection, source: GraphNode, target: GraphNode) {
    // Just connect, no checks needed
    addEdges({
      id: `e__${source.id}-${target.id}`,
      ...e,
      type: 'control'
    })
  }

  function addDataEdge(e: Connection, source: GraphNode, target: GraphNode) {
    // Dont connect data nodes from same operation
    if (source.parentNode === target.parentNode) return
    // Dont connect data nodes from different types
    if (source.data.variable.type !== target.data.variable.type) return
    // Add edge
    addEdges({
      id: `e__${source.id}-${target.id}`,
      ...e,
      type: 'data'
    })
  }
}
