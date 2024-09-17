import { computed, ref } from 'vue'
import { closeFullscreen, openFullscreen } from '../SiteHelpers'

export class CFullscreenHelper {
  private _dashboardElement = ref<HTMLElement | undefined>()
  private _isFullscreen = ref<boolean>(false)

  get isFullscreen() {
    return computed(() => this._isFullscreen.value)
  }
  get dashboardElement() {
    return computed(() => this._dashboardElement.value)
  }

  constructor() {
    this.updateDashboardElement()
  }

  /** Updates the dashboard element to the Element with the ID 'verdatas-dashboard' */
  updateDashboardElement = () => {
    this._dashboardElement.value = document.getElementById('verdatas-dashboard') ?? undefined
  }

  toggleFullscreen = () => {
    if (this.isFullscreen.value) return this.closeFullscreen()
    else return this.openFullscreen()
  }

  closeFullscreen = () => {
    if (!this._dashboardElement.value) return 0
    this._isFullscreen.value = closeFullscreen(this._dashboardElement.value)
  }

  openFullscreen = () => {
    if (!this._dashboardElement.value) return
    this._isFullscreen.value = openFullscreen(this._dashboardElement.value)
  }
}
