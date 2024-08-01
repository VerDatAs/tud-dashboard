export type TIOVariable = {
  name: string
  type: string
  description: string
}

export type TInput = TIOVariable

export type TOutput = TIOVariable

export type TOperation = {
  id: string
  name: string
  description: string
  inputs: Array<TInput>
  outputs: Array<TOutput>
}
