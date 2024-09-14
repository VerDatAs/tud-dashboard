import { ESidebarType, useSidebarStore } from '@/stores/AssistanceTypes/sidebar'
import { type NodeChange, useVueFlow } from '@vue-flow/core'
import { triggerNodeSizer } from './nodeSizeHandler'
import { CVueFlowStoreId } from './statics'

export default function useFlowChangeHandler() {
  const { findNode, onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges } = useVueFlow(CVueFlowStoreId)
  const sidebarStore = useSidebarStore()

  /* Set Sidebar to Assistance Type when currently selected node gets removed */
  onNodesChange((changes) => {
    for (const change of changes) {
      if (
        change.type === 'remove' &&
        (sidebarStore.currentType === ESidebarType.Node || sidebarStore.currentType === ESidebarType.ATInput) &&
        sidebarStore.currentId === change.id
      ) {
        sidebarStore.setAssistanceType()
      }
    }
  })

  /* Set Sidebar to Assistance Type when currently selected edge gets removed */
  onEdgesChange((edges) => {
    for (const edge of edges) {
      if (
        edge.type === 'remove' &&
        sidebarStore.currentType === ESidebarType.Edge &&
        sidebarStore.currentId === edge.id
      ) {
        sidebarStore.setAssistanceType()
      }
    }
  })

  // onNodesInitialized((e) => {
  /*
   *  Only size the last one
   *  -> doesnt work when multiple nodes get instantiated at once
   */
  // if (e.length < 2) return
  // // @ts-ignore
  // triggerNodeSizer(e.at(e.length - 1).id)
  // console.log(e)

  /*
   *  Size all nodes when new nodes get created
   */
  // triggerNodeSizer()
  // })

  onNodesChange((changes) => {
    const nextChanges: NodeChange[] = []

    for (const change of changes) {
      /*
       * Trigger Node Sizer when a node gets created
       * Listening for the add change -> node Dimension not set yet -> nodeSizer doesnt know output node dimensions -> cant position correctly
       * -> can listen for dimensions change -> lot of dimensions changes -> not optimal
       * -> use onNodesInitialized to react to new node creations and size them correctly
       *
       * -> used now because of show/hide variable types toggle -> only updates correctly with it set
       */
      // if (change.type === 'remove') {
      if (change.type === 'remove' || change.type === 'dimensions') {
        const node = findNode(change.id)
        if (!node) continue

        if (node.type === 'datainput' || node.type === 'dataoutput') {
          applyNodeChanges([change])
          triggerNodeSizer(node.parentNode)
          continue
        }
      }
      nextChanges.push(change)
    }
    applyNodeChanges(nextChanges)
  })

  onEdgesChange(async (changes) => {
    applyEdgeChanges(changes)
  })
}
