export const supportedVariableTypes: TIOTypes[] = ['string', 'number', 'integer', 'boolean', 'object', 'array']

export type TIOTypes = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'

export function variableTypeToString(type: TIOTypes): string {
  switch (type) {
    case 'string':
      return 'Text'
    case 'number':
      return 'Zahl'
    case 'integer':
      return 'Ganzzahl'
    case 'boolean':
      return 'Ja/Nein'
    case 'object':
      return 'Objekt'
    case 'array':
      return 'Liste'
  }
}
