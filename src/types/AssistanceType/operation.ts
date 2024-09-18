import type { TIOTypes } from './variableTypes'

export type TIOVariable = {
  name: string
  type: TIOTypes
  description: string
  required?: boolean
}

export type TInput = TIOVariable

export type TOutput = TIOVariable

/*
 * If updated
 * also update the class CDnDState in src/util/AssistanceType/useDnD.ts
 */
export type TAssistanceTypeInput = TIOVariable & { required: boolean; default?: string | number | boolean }

/*
 * If updated
 * also update the class CDnDState in src/util/AssistanceType/useDnD.ts
 */
export type TOperation = {
  id: string
  name: string
  description: string
  inputs: Array<TInput>
  outputs: Array<TOutput>
}
