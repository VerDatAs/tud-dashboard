type TPosition = {
  x: number
  y: number
}
type TDimensions = {
  width: number
  height: number
}
export type TFlowContext = {
  position: TPosition
  dimensions: TDimensions
}

export type TIONode = {
  id: string
  type: 'input' | 'output' | 'error'
  flowContext: TFlowContext
}

export type TOperationNode = {
  id: string
  operation: string
  flowContext: TFlowContext
  io: TIONode[]
}

export type TDataEdge = {
  source: string
  target: string
}

export type TControlEdge =
  | {
      source: string
      target: string
      trigger: 'direct'
      schedule?: number
    }
  | {
      source: string
      target: string
      trigger: 'scheduled'
      schedule: number
    }
