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
import { getLabel } from '@/util/KnowledgeGraph/features/label-editing/LabelUtil'
import { elementToString } from '@/util/KnowledgeGraph/import/Util'
import { isLabelExternal, getExternalLabelBounds } from '@/util/KnowledgeGraph/util/LabelUtil'
import { is } from '@/util/KnowledgeGraph/util/ModelUtil'
import { getMid } from 'diagram-js/lib/layout/LayoutUtil'
import { assign } from 'min-dash'

/**
 * Helper function to convert a semantic into a specific format.
 *
 * @param semantic
 * @param attrs
 */
function elementData(semantic, attrs) {
  return assign(
    {
      id: semantic.id,
      type: semantic.$type,
      businessObject: semantic
    },
    attrs
  )
}

/**
 * Throw error that an element was not yet drawn.
 *
 * @param translate
 * @param semantic
 * @param refSemantic
 * @param property
 */
function notYetDrawn(translate, semantic, refSemantic, property) {
  return new Error(
    translate('element {element} referenced by {referenced}#{property} not yet drawn', {
      element: elementToString(refSemantic),
      referenced: elementToString(semantic),
      property: property
    })
  )
}

/**
 * An importer that adds VerDatAs elements to the canvas.
 *
 * @param eventBus
 * @param canvas
 * @param elementFactory
 * @param elementRegistry
 * @param translate
 * @param textRenderer
 */
export default function VerDatAsImporter(eventBus, canvas, elementFactory, elementRegistry, translate, textRenderer) {
  this._eventBus = eventBus
  this._canvas = canvas
  this._elementFactory = elementFactory
  this._elementRegistry = elementRegistry
  this._translate = translate
  this._textRenderer = textRenderer
}

VerDatAsImporter.$inject = ['eventBus', 'canvas', 'elementFactory', 'elementRegistry', 'translate', 'textRenderer']

/**
 * Add a VerDatAs element (semantic) to the canvas onto the specified parent shape.
 */
VerDatAsImporter.prototype.add = function (semantic, parentElement) {
  const di = semantic.di
  let element
  const translate = this._translate
  let hidden
  let parentIndex

  // ROOT ELEMENT
  // Handle the special case that we deal with an invisible root element
  if (is(di, 'verDatAsDi:GraphPlane')) {
    // Add a virtual element (not being drawn)
    element = this._elementFactory.createRoot(elementData(semantic))

    this._canvas.setRootElement(element)
  }

  // SHAPE
  else if (is(di, 'verDatAsDi:GraphShape')) {
    hidden = parentElement && (parentElement.hidden || parentElement.collapsed)

    const bounds = semantic.di.bounds

    element = this._elementFactory.createShape(
      elementData(semantic, {
        hidden: hidden,
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        isFrame: false
      })
    )

    this._canvas.addShape(element, parentElement, parentIndex)
  }

  // CONNECTION
  else if (is(di, 'verDatAsDi:Edge')) {
    const source = this._getSource(semantic)
    const target = this._getTarget(semantic)

    hidden = parentElement && (parentElement.hidden || parentElement.collapsed)

    element = this._elementFactory.createConnection(
      elementData(semantic, {
        hidden: hidden,
        source: source,
        target: target,
        waypoints: getWaypoints(semantic, source, target)
      })
    )

    // Insert sequence flows behind other flow nodes
    if (is(semantic, 'verDatAs:SequenceFlow')) {
      parentIndex = 0
    }

    this._canvas.addConnection(element, parentElement, parentIndex)
  }

  // OTHER UNKNOWN ELEMENTS
  else {
    throw new Error(
      translate('unknown di {di} for element {semantic}', {
        di: elementToString(di),
        semantic: elementToString(semantic)
      })
    )
  }

  // (Optional) LABEL
  if (isLabelExternal(semantic) && getLabel(element)) {
    this.addLabel(semantic, element)
  }

  this._eventBus.fire('graphElement.added', { element: element })

  return element
}

/**
 * Attach the boundary element to the given host.
 *
 * @param boundarySemantic
 * @param boundaryElement
 */
VerDatAsImporter.prototype._attachBoundary = function (boundarySemantic, boundaryElement) {
  const translate = this._translate
  const hostSemantic = boundarySemantic.attachedToRef

  if (!hostSemantic) {
    throw new Error(
      translate('missing {semantic}#attachedToRef', {
        semantic: elementToString(boundarySemantic)
      })
    )
  }

  const host = this._elementRegistry.get(hostSemantic.id)
  let attachers = host && host.attachers

  if (!host) {
    throw notYetDrawn(translate, boundarySemantic, hostSemantic, 'attachedToRef')
  }

  // Wire element.host <> host.attachers
  boundaryElement.host = host

  if (!attachers) {
    host.attachers = attachers = []
  }

  if (attachers.indexOf(boundaryElement) === -1) {
    attachers.push(boundaryElement)
  }
}

/**
 * Add a label for an element.
 */
VerDatAsImporter.prototype.addLabel = function (semantic, element) {
  let bounds
  let text
  let label

  bounds = getExternalLabelBounds(semantic, element)

  text = getLabel(element)

  if (text) {
    // Get corrected bounds from the actual layouted text
    bounds = this._textRenderer.getExternalLabelBounds(bounds, text)
  }

  const paddingTop = 7

  label = this._elementFactory.createLabel(
    elementData(semantic, {
      id: semantic.id + '_label',
      labelTarget: element,
      type: 'label',
      hidden: element.hidden,
      x: Math.round(bounds.x),
      y: Math.round(bounds.y) + paddingTop,
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    })
  )

  return this._canvas.addShape(label, element.parent)
}

/**
 * Return the drawn connection end based on the given side.
 */
VerDatAsImporter.prototype._getEnd = function (semantic, side) {
  let element
  let refSemantic
  const translate = this._translate

  refSemantic = semantic[side + 'Ref']

  element = refSemantic && this._getElement(refSemantic)

  if (element) {
    return element
  }

  if (refSemantic) {
    throw notYetDrawn(translate, semantic, refSemantic, side + 'Ref')
  } else {
    throw new Error(
      translate('{semantic}#{side} Ref not specified', {
        semantic: elementToString(semantic),
        side: side
      })
    )
  }
}

/**
 * Retrieve the source of a given semantic.
 *
 * @param semantic
 */
VerDatAsImporter.prototype._getSource = function (semantic) {
  return this._getEnd(semantic, 'source')
}

/**
 * Retrieve the target of a given semantic.
 *
 * @param semantic
 */
VerDatAsImporter.prototype._getTarget = function (semantic) {
  return this._getEnd(semantic, 'target')
}

/**
 * Retrieve the element of a given semantic.
 *
 * @param semantic
 */
VerDatAsImporter.prototype._getElement = function (semantic) {
  return this._elementRegistry.get(semantic.id)
}

/**
 * Helper function to retrieve the waypoints of a business object.
 *
 * @param bo
 * @param source
 * @param target
 */
function getWaypoints(bo, source, target) {
  const waypoints = bo.di.waypoint

  if (!waypoints || waypoints.length < 2) {
    return [getMid(source), getMid(target)]
  }

  return waypoints.map(function (p) {
    return { x: p.x, y: p.y }
  })
}
