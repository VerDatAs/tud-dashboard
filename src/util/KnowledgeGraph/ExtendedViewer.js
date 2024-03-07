import inherits from 'inherits-browser'

import Viewer from './Viewer'

import KeyboardModule from './features/keyboard'
import SearchModule from './features/search'
import KeyboardMoveModule from 'diagram-js/lib/navigation/keyboard-move'
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas'
import SelectionModule from 'diagram-js/lib/features/selection'
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll'

import LabelEditingModule from './features/label-editing'

/**
 * @typedef { import('./BaseViewer').BaseViewerOptions } BaseViewerOptions
 */

/**
 * A viewer with mouse and keyboard navigation features.
 *
 * @param {BaseViewerOptions} [options]
 */
export default function ExtendedViewer(options) {
  Viewer.call(this, options)
}

inherits(ExtendedViewer, Viewer)

ExtendedViewer.prototype._extendedModules = [
  KeyboardModule,
  SearchModule,
  KeyboardMoveModule,
  MoveCanvasModule,
  SelectionModule,
  ZoomScrollModule,
  LabelEditingModule
]

ExtendedViewer.prototype._modules = [].concat(Viewer.prototype._modules, ExtendedViewer.prototype._extendedModules)
