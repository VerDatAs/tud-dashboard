import { type Ref } from 'vue'
import { TOperation } from './operation'

export type TDnDState = {
  draggedOperation: Ref<TOperation | undefined>
  isDragOver: Ref<boolean>
  isDragging: Ref<boolean>
}

export type TDnDFunctions = {
  onDragStart: (event: DragEvent, operation: TOperation) => void
  onDragOver: (event: DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent) => void
}

export type TDnD = TDnDState & TDnDFunctions
