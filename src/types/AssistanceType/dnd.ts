import type { Ref } from 'vue'
import type { TAssistanceTypeInput, TOperation } from './operation'

export type TDnDDraggedObjects = TOperation | TAssistanceTypeInput

export type TDnDState = {
  draggedObject: Ref<TDnDDraggedObjects | undefined>
  isDragOver: Ref<boolean>
  isDragging: Ref<boolean>
}

export type TDnDFunctions = {
  onDragStart: (event: DragEvent, object: TDnDDraggedObjects) => void
  onDragOver: (event: DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent) => void
}

export type TDnD = TDnDState & TDnDFunctions
