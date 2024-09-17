import type { TAssistanceTypeInput } from './operation'

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
  name: string
  type: 'input' | 'output' | 'error'
  flowContext: TFlowContext
}

export type TATInputNode = {
  id: string
  name: string
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
      trigger: {
        type: 'direct'
        schedule?: number
      }
    }
  | {
      source: string
      target: string
      trigger: {
        type: 'scheduled'
        schedule: number
      }
    }

export type TAssistanceType = {
  id: string
  name: string
  description: string
  trigger: {
    type: string
    definition: object
  }
  inputs: {
    definitions: TAssistanceTypeInput[]
    nodes: TATInputNode[]
  }
  operations: TOperationNode[]
  connectors: {
    control: TControlEdge[]
    data: TDataEdge[]
  }
  startNode?: {
    flowContext?: TFlowContext
  }
}
