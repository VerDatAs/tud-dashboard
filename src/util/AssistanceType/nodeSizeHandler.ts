import { useVueFlow } from '@vue-flow/core'
import { CVueFlowStoreId } from './statics'

export default function useNodeSizeHandler() {
  const { onNodesInitialized } = useVueFlow(CVueFlowStoreId)

  onNodesInitialized((e) => {
    console.log(e)
  })
}
