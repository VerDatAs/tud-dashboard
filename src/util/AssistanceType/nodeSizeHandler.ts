import { useVueFlow } from '@vue-flow/core'

export default function useNodeSizeHandler() {
  const { onNodesInitialized } = useVueFlow()

  onNodesInitialized((e) => {
    console.log(e)
  })
}
