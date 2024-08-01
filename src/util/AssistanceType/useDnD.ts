import type { TDnD, TDnDState } from '@/types/AssistanceType/dnd'
import type { TOperation } from '@/types/AssistanceType/operation'
import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'

/**
 * Return unique ID for a node.
 *
 * @returns {string} Unique ID
 */
function getId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export class CDnDState implements TDnDState {
  draggedOperation: TDnDState['draggedOperation']
  isDragOver: TDnDState['isDragOver']
  isDragging: TDnDState['isDragging']

  constructor(state: TDnDState | undefined = undefined) {
    this.draggedOperation = state?.draggedOperation ?? ref<TOperation | undefined>(undefined)
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
  const { draggedOperation, isDragOver, isDragging } = state

  const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode, findNode } = useVueFlow()

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  function onDragStart(event: DragEvent, operation: TOperation) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', operation.id)
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedOperation.value = operation
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

    if (draggedOperation.value) {
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
    draggedOperation.value = undefined
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

    if (!draggedOperation.value) return

    // For absolute security that no node will have already used ID
    let nodeId: string
    do {
      nodeId = draggedOperation.value.id + '_' + getId()
    } while (findNode(nodeId) != undefined)

    const newNode = {
      id: nodeId,
      type: 'operation',
      position,
      data: {
        label: draggedOperation.value.name,
        operation: draggedOperation.value
      }
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
    draggedOperation,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop
  }
}
