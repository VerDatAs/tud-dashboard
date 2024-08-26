import { useVueFlow } from '@vue-flow/core'
import { toast } from 'vue3-toastify'
import { CVueFlowStoreId } from './statics'

const OPERATION_TYPE = 'operation'
const DATA_INPUT_TYPE = 'datainput'
const DATA_OUTPUT_TYPE = 'dataoutput'
const AT_INPUT_TYPE = 'at-input'

export function addControlEdge(
  sourceId: string,
  targetId: string,
  data: {
    id?: string
    trigger?: {
      trigger?: 'direct' | 'scheduled'
      schedule?: number
    }
  } = {}
) {
  // Just connect, no checks needed
  const { addEdges } = useVueFlow(CVueFlowStoreId)

  addEdges({
    id: data?.id ?? `e__${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    type: 'control',
    data: {
      trigger: data?.trigger?.trigger ?? 'direct',
      schedule: data?.trigger?.schedule ?? 0
    }
  })
}

export function addDataEdge(
  sourceId: string,
  targetId: string,
  data: {
    id?: string
  } = {}
) {
  const { findNode, addEdges } = useVueFlow(CVueFlowStoreId)
  const source = findNode(sourceId)
  const target = findNode(targetId)
  if (!source || !target) {
    toast.error('Der Output oder Input wurde nicht gefunden.')
    console.error(
      'Der Output oder Input wurde nicht gefunden. Eine ID ist nicht korrekt.',
      sourceId,
      source,
      targetId,
      target
    )
    return
  }

  // Dont connect data nodes from same operation
  if (source.parentNode === target.parentNode) {
    toast.error('Es können keine Datenknoten innerhalb derselben Operation verbunden werden.')
    return
  }
  // Dont connect data nodes from different types
  if (source.data.variable.type !== target.data.variable.type) {
    toast.error('Es können keine Datenknoten unterschiedlicher Typen verbunden werden.')
    return
  }
  // Add edge
  addEdges({
    id: data?.id ?? `e__${source.id}-${target.id}`,
    source: sourceId,
    target: targetId,
    type: 'data'
  })
}

export default function useEdgeCreationHandler() {
  const { onConnect, findNode } = useVueFlow(CVueFlowStoreId)

  onConnect((e) => {
    const source = findNode(e.source)
    const target = findNode(e.target)
    if (!source || !target) return
    // Connect operation nodes
    // Connecting own output to own input doesnt work by default
    if (source.type === OPERATION_TYPE && target.type === OPERATION_TYPE) addControlEdge(source.id, target.id)
    // Connect data nodes
    else if (
      (source.type === DATA_OUTPUT_TYPE && target.type === DATA_INPUT_TYPE) ||
      (source.type === AT_INPUT_TYPE && target.type === DATA_INPUT_TYPE)
    )
      addDataEdge(source.id, target.id)
    else {
      toast.error('Es können nur Datenknoten mit Eingabeknoten und Operationen mit Operationen verbunden werden.')
    }
  })
}
