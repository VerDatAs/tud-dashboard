export function createVariableNodeID(
  operationNodeId: string,
  variableType: 'input' | 'output',
  variableName: string
): string {
  return operationNodeId + '-' + variableType + '-' + variableName
}
