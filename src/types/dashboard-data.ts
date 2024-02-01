export class DashboardData {
  courseNode: Object
  token: string
  backendUrl: string
  path?: string
  canViewOnly?: boolean
  previewMode?: boolean
  members?: string[]

  constructor(courseNode: Object, token: string, backendUrl: string) {
    this.courseNode = courseNode
    this.token = token
    this.backendUrl = backendUrl
  }
}
