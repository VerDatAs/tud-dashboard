import type { TDnD, TDnDDraggedObjects, TDnDState } from '@/types/AssistanceType/dnd'
import type { TAssistanceTypeInput, TOperation } from '@/types/AssistanceType/operation'
import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'
import { createATVariableNode, createOperationNode } from './nodeCreationHandler'
import { CVueFlowStoreId } from './statics'

/**
 * Return unique ID for a node.
 *
 * @returns {string} Unique ID
 */
export function getId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export class CDnDState implements TDnDState {
  draggedObject: TDnDState['draggedObject']
  isDragOver: TDnDState['isDragOver']
  isDragging: TDnDState['isDragging']

  constructor(state: TDnDState | undefined = undefined) {
    this.draggedObject = state?.draggedObject ?? ref<TDnDDraggedObjects | undefined>(undefined)
    this.isDragOver = state?.isDragOver ?? ref(false)
    this.isDragging = state?.isDragging ?? ref(false)
  }

  static isOperation(obj: TDnDDraggedObjects): obj is TOperation {
    return 'id' in obj && 'inputs' in obj && 'outputs' in obj && 'name' in obj && 'description' in obj
  }

  static isATVariable(obj: TDnDDraggedObjects): obj is TAssistanceTypeInput {
    return 'name' in obj && 'description' in obj && 'type' in obj
  }
}

/**
 * Initializes Drag and Drop feature for Vue flow.
 * @param {dndState} state Drag and Drop state
 * @returns
 */
export default function useDragAndDrop(state: CDnDState = new CDnDState()): TDnD {
  const { draggedObject, isDragOver, isDragging } = state

  const { screenToFlowCoordinate, onNodesInitialized, updateNode, findNode } = useVueFlow(CVueFlowStoreId)

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  function onDragStart(event: DragEvent, obj: TDnDDraggedObjects) {
    if (event.dataTransfer) {
      if (CDnDState.isOperation(obj)) {
        event.dataTransfer?.setData('application/vueflow', obj.id)
      } else if (CDnDState.isATVariable(obj)) {
        event.dataTransfer?.setData('application/vueflow', obj.name)
      }
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedObject.value = obj
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

    if (draggedObject.value) {
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
    draggedObject.value = undefined
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

    if (!draggedObject.value) return

    let nodeId: string = ''
    // TOperation
    if (CDnDState.isOperation(draggedObject.value)) {
      // For absolute security that no node will have already used ID
      do {
        nodeId = draggedObject.value.id + '_' + getId()
      } while (findNode(nodeId) != undefined)
    }
    // TAssistanceTypeInput
    else if (CDnDState.isATVariable(draggedObject.value)) {
      // For absolute security that no node will have already used ID
      do {
        nodeId = 'at_input_' + draggedObject.value.name + '_' + getId()
      } while (findNode(nodeId) != undefined)
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

    if (CDnDState.isOperation(draggedObject.value)) {
      createOperationNode(nodeId, draggedObject.value.id, position)
    } else if (CDnDState.isATVariable(draggedObject.value)) {
      createATVariableNode(nodeId, draggedObject.value, position)
    }
  }

  return {
    draggedObject,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop
  }
}
