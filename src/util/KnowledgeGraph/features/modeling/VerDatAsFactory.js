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
import { isAny } from '@/util/KnowledgeGraph/features/modeling/util/ModelingUtil'
import { map, assign, pick } from 'min-dash'

/**
 * VerDatAs factory that specifies an underlying model.
 *
 * @param moddle
 */
export default function VerDatAsFactory(moddle) {
  this._model = moddle
}

VerDatAsFactory.$inject = ['moddle']

/**
 * Check, whether an element requires an ID.
 *
 * @param element
 */
VerDatAsFactory.prototype._needsId = function (element) {
  return isAny(element, ['verDatAs:GraphElement'])
}

/**
 * Ensure that an element has an ID.
 *
 * @param element
 */
VerDatAsFactory.prototype._ensureId = function (element) {
  if (element.id) {
    this._model.ids.claim(element.id, element)
    return
  }

  // Generate semantic ids for elements
  // verDatAs:SequenceFlow -> SequenceFlow_ID
  let prefix

  // Note: This seems to be a hardcoded workaround, but it works pretty fine
  if (!element.$type) {
    prefix = 'verDatAs'
  } else {
    prefix = (element.$type || '').replace(/^[^:]*:/g, '')
  }

  prefix += '_'

  if (!element.id && this._needsId(element)) {
    element.id = this._model.ids.nextPrefixed(prefix, element)
  }
}

/**
 * Create an element in the model.
 *
 * @param type
 * @param attrs
 */
VerDatAsFactory.prototype.create = function (type, attrs) {
  const element = this._model.create(type, attrs || {})

  this._ensureId(element)

  return element
}

/**
 * Create the DI of a GraphLabel.
 */
VerDatAsFactory.prototype.createDiLabel = function () {
  return this.create('verDatAsDi:GraphLabel', {
    bounds: this.createDiBounds()
  })
}

/**
 * Create the DI of a GraphShape.
 * @param semantic
 * @param attrs
 */
VerDatAsFactory.prototype.createDiShape = function (semantic, attrs) {
  // Note: The bounds are not set automatically
  const attributes = assign(
    {
      graphElement: semantic,
      bounds: this.createDiBounds({ x: attrs.x, y: attrs.y, width: attrs.width, height: attrs.height })
    },
    { id: attrs.id }
  )
  return this.create('verDatAsDi:GraphShape', attributes)
}

/**
 * Create the DI of the bounds.
 *
 * @param bounds
 */
VerDatAsFactory.prototype.createDiBounds = function (bounds) {
  return this.create('dc:Bounds', bounds)
}

/**
 * Create the DI of multiple waypoints.
 *
 * @param waypoints
 */
VerDatAsFactory.prototype.createDiWaypoints = function (waypoints) {
  const self = this

  return map(waypoints, function (pos) {
    return self.createDiWaypoint(pos)
  })
}

/**
 * Create the DI of one specific waypoint.
 *
 * @param point
 */
VerDatAsFactory.prototype.createDiWaypoint = function (point) {
  return this.create('dc:Point', pick(point, ['x', 'y']))
}

/**
 * Create the DI of a GraphEdge.
 *
 * @param semantic
 * @param attrs
 */
VerDatAsFactory.prototype.createDiEdge = function (semantic, attrs) {
  return this.create(
    'verDatAsDi:GraphEdge',
    assign(
      {
        graphElement: semantic,
        waypoint: this.createDiWaypoints([])
      },
      attrs
    )
  )
}

/**
 * Create the DI of a GraphPlane.
 *
 * @param semantic
 * @param attrs
 */
VerDatAsFactory.prototype.createDiPlane = function (semantic, attrs) {
  return this.create(
    'verDatAsDi:GraphPlane',
    assign(
      {
        graphElement: semantic
      },
      attrs
    )
  )
}
