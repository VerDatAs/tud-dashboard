/**
 * This is a modified version of the original file from https://github.com/pinussilvestrus/postit-js (MIT).
 *
 * Copyright 2020 Niklas Kiefer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * -----
 *
 * Adjustments for Dashboard of the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)
 *
 * In addition to the terms of the MIT license, this file is distributed under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { importVerDatAsDiagram } from '@/util/KnowledgeGraph/import/Importer'
import Moddle from '@/util/KnowledgeGraph/moddle'
import { wrapForCompatibility } from '@/util/KnowledgeGraph/util/CompatibilityUtil'
import Diagram from 'diagram-js'
import Ids from 'ids'
import inherits from 'inherits-browser'
import { assign, find, isNumber, omit } from 'min-dash'
import { domify, assignStyle, query as domQuery, remove as domRemove } from 'min-dom'

/**
 * A base viewer for VerDatAs diagrams.
 *
 * @param options
 */
export default function BaseViewer(options) {
  options = assign({}, DEFAULT_OPTIONS, options)

  this._moddle = this._createModdle(options)
  this._container = this._createContainer(options)

  /* <project-logo> */

  addProjectLogo(this._container)

  /* </project-logo> */

  this._init(this._container, this._moddle, options)
}

inherits(BaseViewer, Diagram)

/**
 * Parse and render a VerDatAs diagram.
 *
 * @param xml
 * @param graphRoot
 */
BaseViewer.prototype.importXML = wrapForCompatibility(async function importXML(xml, graphRoot) {
  const self = this

  function ParseCompleteEvent(data) {
    const event = self.get('eventBus').createEvent(data)

    Object.defineProperty(event, 'context', {
      enumerable: true,
      get: function () {
        console.warn(
          new Error('import.parse.complete <context> is deprecated ' + 'and will be removed in future library versions')
        )

        return {
          warnings: data.warnings,
          references: data.references,
          elementsById: data.elementsById
        }
      }
    })

    return event
  }

  let aggregatedWarnings = []
  try {
    // Hook in pre-parse listeners allow XML manipulation
    xml = this._emit('import.parse.start', { xml: xml }) || xml

    let parseResult
    try {
      parseResult = await this._moddle.fromXML(xml, 'verDatAs:Definitions')
    } catch (error) {
      this._emit('import.parse.complete', {
        error
      })

      throw error
    }

    let definitions = parseResult.rootElement
    const references = parseResult.references
    const parseWarnings = parseResult.warnings
    const elementsById = parseResult.elementsById

    aggregatedWarnings = aggregatedWarnings.concat(parseWarnings)

    // Hook in post parse listeners allow definitions manipulation
    definitions =
      this._emit(
        'import.parse.complete',
        ParseCompleteEvent({
          error: null,
          definitions: definitions,
          elementsById: elementsById,
          references: references,
          warnings: aggregatedWarnings
        })
      ) || definitions

    const importResult = await this.importDefinitions(definitions, graphRoot)

    aggregatedWarnings = aggregatedWarnings.concat(importResult.warnings)

    this._emit('import.done', { error: null, warnings: aggregatedWarnings })

    return { warnings: aggregatedWarnings }
  } catch (err) {
    let error = err
    aggregatedWarnings = aggregatedWarnings.concat(error.warnings || [])
    addWarningsToError(error, aggregatedWarnings)

    error = checkValidationError(error)

    this._emit('import.done', { error, warnings: error.warnings })

    throw error
  }
})

/**
 * Import parsed definitions and render a VerDatAs diagram.
 *
 * @param definitions
 * @param graphRoot
 */
BaseViewer.prototype.importDefinitions = wrapForCompatibility(async function importDefinitions(definitions, graphRoot) {
  this._setDefinitions(definitions)
  const result = await this.open(graphRoot)

  return { warnings: result.warnings }
})

/**
 * Open diagram of the previously imported XML.
 *
 * @param graphRootOrId
 */
BaseViewer.prototype.open = wrapForCompatibility(async function open(graphRootOrId) {
  const definitions = this._definitions
  let verDatAsDiagram = graphRootOrId

  if (!definitions) {
    const error = new Error('no XML imported')
    addWarningsToError(error, [])

    throw error
  }

  if (typeof graphRootOrId === 'string') {
    verDatAsDiagram = findVerDatAsDiagram(definitions, graphRootOrId)

    if (!verDatAsDiagram) {
      const error = new Error('KnowledgeGraphRoot <' + graphRootOrId + '> not found')
      addWarningsToError(error, [])

      throw error
    }
  }

  // Clear existing rendered diagram
  // Catch synchronous exceptions during #clear()
  try {
    this.clear()
  } catch (error) {
    addWarningsToError(error, [])

    throw error
  }

  // Perform graphical import
  const { warnings } = await importVerDatAsDiagram(this, definitions, verDatAsDiagram)

  return { warnings }
})

/**
 * Export the currently displayed VerDatAs diagram as a VerDatAs XML document.
 *
 * @param options
 */
BaseViewer.prototype.saveXML = wrapForCompatibility(async function saveXML(options) {
  options = options || {}

  let definitions = this._definitions,
    error,
    xml

  try {
    if (!definitions) {
      throw new Error('no definitions loaded')
    }

    // Allow to fiddle around with definitions
    definitions =
      this._emit('saveXML.start', {
        definitions
      }) || definitions

    const result = await this._moddle.toXML(definitions, options)
    xml = result.xml

    xml =
      this._emit('saveXML.serialized', {
        xml
      }) || xml
  } catch (err) {
    error = err
  }

  const result = error ? { error } : { xml }

  this._emit('saveXML.done', result)

  if (error) {
    throw error
  }

  return result
})

/**
 * Set the definitions to a given definitions value.
 *
 * @param definitions
 */
BaseViewer.prototype._setDefinitions = function (definitions) {
  this._definitions = definitions
}

/**
 * Return modules to instantiate with.
 */
BaseViewer.prototype.getModules = function () {
  return this._modules
}

/**
 * Remove all drawn elements from the viewer.
 */
BaseViewer.prototype.clear = function () {
  if (!this.getDefinitions()) {
    // No diagram to clear
    return
  }

  // Remove drawn elements
  Diagram.prototype.clear.call(this)
}

/**
 * Destroy the viewer instance and remove all its remainders from the document tree.
 */
BaseViewer.prototype.destroy = function () {
  // Diagram destroy
  Diagram.prototype.destroy.call(this)

  // DOM detach
  domRemove(this._container)
}

/**
 * Register an event listener.
 *
 * @param events
 * @param priority
 * @param callback
 * @param that
 */
BaseViewer.prototype.on = function (events, priority, callback, that) {
  return this.get('eventBus').on(events, priority, callback, that)
}

/**
 * Remove an event listener.
 *
 * @param events
 * @param callback
 */
BaseViewer.prototype.off = function (events, callback) {
  this.get('eventBus').off(events, callback)
}

/**
 * Attach the viewer to an HTML element.
 *
 * @param parentNode
 */
BaseViewer.prototype.attachTo = function (parentNode) {
  if (!parentNode) {
    throw new Error('parentNode required')
  }

  // Ensure we detach from the previous, old parent
  this.detach()

  // Unwrap jQuery, if provided
  if (parentNode.get && parentNode.constructor.prototype.jquery) {
    parentNode = parentNode.get(0)
  }

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode)
  }

  parentNode.appendChild(this._container)

  this._emit('attach', {})

  this.get('canvas').resized()
}

/**
 * Get the definitions model element.
 */
BaseViewer.prototype.getDefinitions = function () {
  return this._definitions
}

/**
 * Detach the viewer.
 */
BaseViewer.prototype.detach = function () {
  const container = this._container,
    parentNode = container.parentNode

  if (!parentNode) {
    return
  }

  this._emit('detach', {})

  parentNode.removeChild(container)
}

/**
 * Initialize the BaseViewer.
 *
 * @param container
 * @param moddle
 * @param options
 */
BaseViewer.prototype._init = function (container, moddle, options) {
  const baseModules = options.modules || this.getModules(options)
  const additionalModules = options.additionalModules || []
  const staticModules = [
    {
      verdatasjs: ['value', this],
      moddle: ['value', moddle]
    }
  ]

  const diagramModules = [].concat(staticModules, baseModules, additionalModules)

  const diagramOptions = assign(omit(options, ['additionalModules']), {
    canvas: assign({}, options.canvas, { container: container }),
    keyboard: {
      bindTo: window
    },
    modules: diagramModules
  })

  // Invoke the diagram constructor
  Diagram.call(this, diagramOptions)

  if (options && options.container) {
    this.attachTo(options.container)
  }
}

/**
 * Emit an event on the underlying EventBus.
 *
 * @param type
 * @param event
 */
BaseViewer.prototype._emit = function (type, event) {
  return this.get('eventBus').fire(type, event)
}

/**
 * Create a container for the BaseViewer.
 *
 * @param options
 */
BaseViewer.prototype._createContainer = function (options) {
  const container = domify('<div class="bjs-container"></div>')

  assignStyle(container, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  })

  return container
}

/**
 * Create a moodle for the BaseViewer.
 *
 * @param options
 */
BaseViewer.prototype._createModdle = function (options) {
  const moddleOptions = assign({}, this._moddleExtensions, options.moddleExtensions)
  let moddle = new Moddle(moddleOptions)
  // Attach ids to moddle to be able to track and validated IDs in the VerDatAs XML document tree
  moddle.ids = new Ids([32, 36, 1])

  return moddle
}

BaseViewer.prototype._modules = []

/**
 * Helper function to add warnings to the error.
 *
 * @param err
 * @param warningsAry
 */
function addWarningsToError(err, warningsAry) {
  err.warnings = warningsAry
  return err
}

/**
 * Helper function to check for validation errors.
 *
 * @param err
 */
function checkValidationError(err) {
  // Check, whether the user can be supported by indicating wrong VerDatAs XML
  const pattern = /unparsable content <([^>]+)> detected([\s\S]*)$/
  const match = pattern.exec(err.message)

  if (match) {
    err.message =
      'unparsable content <' +
      match[1] +
      '> detected; ' +
      'this may indicate an invalid BPMN 2.0 diagram file' +
      match[2]
  }

  return err
}

const DEFAULT_OPTIONS = {
  width: '100%',
  height: '100%',
  position: 'relative'
}

/**
 * Helper function to ensure that the passed argument has a proper unit (defaulting to px).
 */
function ensureUnit(val) {
  return val + (isNumber(val) ? 'px' : '')
}

/**
 * Find VerDatAsDiagram in definitions by ID.
 *
 * @param definitions
 * @param diagramId
 */
function findVerDatAsDiagram(definitions, diagramId) {
  if (!diagramId) {
    return null
  }

  return (
    find(definitions.graphRoots, function (element) {
      return element.id === diagramId
    }) || null
  )
}

/* <project-logo> */

import { open as openPoweredBy, BPMNIO_IMG, LOGO_STYLES, LINK_STYLES } from '@/util/KnowledgeGraph/util/PoweredByUtil'
import { event as domEvent } from 'min-dom'

/**
 * Adds the project logo to the diagram container as required by the bpmn.io license.
 *
 * @see http://bpmn.io/license
 *
 * @param {Element} container
 */
function addProjectLogo(container) {
  const img = BPMNIO_IMG

  const linkMarkup =
    '<a href="http://bpmn.io" ' +
    'target="_blank" ' +
    'class="bjs-powered-by" ' +
    'title="Powered by bpmn.io" ' +
    '>' +
    img +
    '</a>'

  const linkElement = domify(linkMarkup)

  assignStyle(domQuery('svg', linkElement), LOGO_STYLES)
  assignStyle(linkElement, LINK_STYLES, {
    position: 'absolute',
    bottom: '15px',
    left: '60px', // so the logo is not hidden by the new sidebar
    zIndex: '100'
  })

  container.appendChild(linkElement)

  domEvent.bind(linkElement, 'click', function (event) {
    openPoweredBy()

    event.preventDefault()
  })
}

/* </project-logo> */
