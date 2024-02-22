import inherits from 'inherits-browser'

// TODO: The ModelingModule is necessary to updateProperties
import ModelingModule from 'diagram-js/lib/features/modeling'
import TranslateModule from 'diagram-js/lib/i18n/translate'
import OverlaysModule from 'diagram-js/lib/features/overlays'

import BaseViewer from './BaseViewer'

// TODO: The ModelingModule is necessary to updateProperties
import CoreModule from './core'
import CustomModeling from './features/modeling'
import ElementStyleModule from './features/style'
import VerDatAsDiOrdering from './features/di-ordering'
import EditorActionsModule from './features/editor-actions'

/**
 * @typedef { import('./BaseViewer').BaseViewerOptions } BaseViewerOptions
 */

/**
 * A viewer for BPMN 2.0 diagrams.
 *
 * Have a look at {@link NavigatedViewer} or {@link Modeler} for bundles that include
 * additional features.
 *
 *
 * ## Extending the Viewer
 *
 * In order to extend the viewer pass extension modules to bootstrap via the
 * `additionalModules` option. An extension module is an object that exposes
 * named services.
 *
 * The following example depicts the integration of a simple
 * logging component that integrates with interaction events:
 *
 *
 * ```javascript
 *
 * // logging component
 * function InteractionLogger(eventBus) {
 *   eventBus.on('element.hover', function(event) {
 *     console.log()
 *   })
 * }
 *
 * InteractionLogger.$inject = [ 'eventBus' ]; // minification save
 *
 * // extension module
 * var extensionModule = {
 *   __init__: [ 'interactionLogger' ],
 *   interactionLogger: [ 'type', InteractionLogger ]
 * };
 *
 * // extend the viewer
 * var bpmnViewer = new Viewer({ additionalModules: [ extensionModule ] });
 * bpmnViewer.importXML(...);
 * ```
 *
 * @param {BaseViewerOptions} [options] The options to configure the viewer.
 */
export default function Viewer(options) {
  BaseViewer.call(this, options)
}

inherits(Viewer, BaseViewer)

// modules the viewer is composed of (drilldown module is not necessary unless we have sub processes)
// NOTE: The order of elements is key! (the ModelingModule has to be loaded before CustomModeling is loaded)
Viewer.prototype._modules = [
  CoreModule,
  ElementStyleModule,
  ModelingModule,
  CustomModeling,
  TranslateModule,
  OverlaysModule,
  VerDatAsDiOrdering,
  EditorActionsModule
]

// default moddle extensions the viewer is composed of
Viewer.prototype._moddleExtensions = {}
