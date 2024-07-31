import { type Ref } from 'vue'

export type TDnDState = {
  draggedType: Ref<string | undefined>
  isDragOver: Ref<boolean>
  isDragging: Ref<boolean>
}

export type TDnDFunctions = {
  onDragStart: (event: DragEvent, type: string) => void
  onDragOver: (event: DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent) => void
}

export type TDnD = TDnDState & TDnDFunctions
