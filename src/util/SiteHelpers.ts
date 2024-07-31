/**
 * Open the fullscreen mode for a given element.
 *
 * @param elem
 */
export function openFullscreen(elem: HTMLElement): boolean {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
    // @ts-ignore
  } else if (elem.webkitRequestFullscreen) {
    // @ts-ignore
    elem.webkitRequestFullscreen()
    // @ts-ignore
  } else if (elem.msRequestFullscreen) {
    // @ts-ignore
    elem.msRequestFullscreen()
  }
  elem.classList.add('fullViewHeight')
  return true
}
/**
 * Close the fullscreen mode.
 */
export function closeFullscreen(elem: HTMLElement): boolean {
  if (document.exitFullscreen) {
    document.exitFullscreen()
    // @ts-ignore
  } else if (document.webkitExitFullscreen) {
    // @ts-ignore
    document.webkitExitFullscreen()
    // @ts-ignore
  } else if (document.msExitFullscreen) {
    // @ts-ignore
    document.msExitFullscreen()
  }
  elem.classList.remove('fullViewHeight')
  return false
}
