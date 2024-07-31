import type { TDnD, TDnDState } from '@/types/AssistanceType/dnd'
import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'

/**
 * Return unique ID for a node.
 *
 * @returns {string} Unique ID
 */
function getId() {
  return `dndnode_${Math.random().toString(36).substring(2, 9)}`
}

export class CDnDState implements TDnDState {
  draggedType: TDnDState['draggedType']
  isDragOver: TDnDState['isDragOver']
  isDragging: TDnDState['isDragging']

  constructor(state: TDnDState | undefined = undefined) {
    this.draggedType = state?.draggedType ?? ref<string | undefined>(undefined)
    this.isDragOver = state?.isDragOver ?? ref(false)
    this.isDragging = state?.isDragging ?? ref(false)
  }
}

/**
 * Initializes Drag and Drop feature for Vue flow.
 * @param {dndState} state Drag and Drop state
 * @returns
 */
export default function useDragAndDrop(state: CDnDState = new CDnDState()): TDnD {
  const { draggedType, isDragOver, isDragging } = state

  const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  function onDragStart(event: DragEvent, type: TDnDState['draggedType']['value']) {
    if (event.dataTransfer && type) {
      event.dataTransfer.setData('application/vueflow', type)
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedType.value = type
    isDragging.value = true

    document.addEventListener('drop', onDragEnd)
    document.addEventListener('dragend', onDragEnd)
  }

  /**
   * Handles the drag over event.
   *
   * @param {DragEvent} event
   */
  function onDragOver(event: DragEvent) {
    event.preventDefault()

    if (draggedType.value) {
      isDragOver.value = true

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }
  }

  function onDragLeave() {
    isDragOver.value = false
  }

  function onDragEnd() {
    isDragging.value = false
    isDragOver.value = false
    draggedType.value = undefined
    document.removeEventListener('drop', onDragEnd)
    document.removeEventListener('dragend', onDragEnd)
  }

  /**
   * Handles the drop event.
   *
   * @param {DragEvent} event
   */
  function onDrop(event: DragEvent) {
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY
    })

    const nodeId = getId()

    const newNode = {
      id: nodeId,
      type: draggedType.value,
      position,
      data: { label: nodeId }
    }

    /**
     * Align node position after drop, so it's centered to the mouse
     *
     * We can hook into events even in a callback, and we can remove the event listener after it's been called.
     */
    const { off } = onNodesInitialized(() => {
      updateNode(nodeId, (node) => ({
        position: { x: node.position.x - node.dimensions.width / 2, y: node.position.y - node.dimensions.height / 2 }
      }))

      off()
    })

    addNodes(newNode)
  }

  return {
    draggedType,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop
  }
}
