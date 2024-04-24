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
import { getDefaultSize } from '@/util/GraphHelpers'
import { DEFAULT_LABEL_SIZE } from '@/util/KnowledgeGraph/util/LabelUtil'
import BaseElementFactory from 'diagram-js/lib/core/ElementFactory'
import inherits from 'inherits'
import { assign } from 'min-dash'

/**
 * A VerDatAs-aware factory for diagram-js shapes.
 */
export default function ElementFactory(verDatAsFactory, moddle, translate) {
  BaseElementFactory.call(this)

  this._verDatAsFactory = verDatAsFactory
  this._moddle = moddle
  this._translate = translate
}

inherits(ElementFactory, BaseElementFactory)

ElementFactory.$inject = ['verDatAsFactory', 'moddle', 'translate']

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create

/**
 * General create function for all elements.
 *
 * @param elementType
 * @param attrs
 */
ElementFactory.prototype.create = function (elementType, attrs) {
  // No special magic for labels: It is assumed that their businessObjects have already been created and wired via attrs
  if (elementType === 'label') {
    return this.baseCreate(elementType, assign({ type: 'label' }, DEFAULT_LABEL_SIZE, attrs))
  }

  // TODO: This should be done automatically, but is currently needed as a workaround
  if (elementType === 'connection') {
    if (!attrs) {
      attrs = {}
    }
    attrs.type = 'verDatAs:SequenceFlow'
  }

  return this.createVerDatAsElement(elementType, attrs)
}

/**
 * Create VerDatAs specific elements.
 *
 * @param elementType
 * @param attrs
 */
ElementFactory.prototype.createVerDatAsElement = function (elementType, attrs) {
  let size
  const translate = this._translate

  attrs = attrs || {}

  let businessObject = attrs.businessObject

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error(translate('no shape type specified'))
    }

    businessObject = this._verDatAsFactory.create(attrs.type)
  }

  size = this._getDefaultSize(businessObject)

  if (!businessObject.di) {
    if (elementType === 'root') {
      businessObject.di = this._verDatAsFactory.createDiPlane(businessObject, {
        id: businessObject.id + '_di'
      })
    } else if (elementType === 'connection') {
      businessObject.di = this._verDatAsFactory.createDiEdge(businessObject, {
        id: businessObject.id + '_di'
      })
    } else {
      // TODO: This is currently necessary to define the bounds
      businessObject.di = this._verDatAsFactory.createDiShape(businessObject, {
        id: businessObject.id + '_di',
        x: attrs.x,
        y: attrs.y,
        width: size.width,
        height: size.height
      })
    }
  }

  if (attrs.di) {
    assign(businessObject.di, attrs.di)

    delete attrs.di
  }

  let eventDefinitions
  let newEventDefinition

  if (attrs.eventDefinitionType) {
    eventDefinitions = businessObject.get('eventDefinitions') || []
    newEventDefinition = this._verDatAsFactory.create(attrs.eventDefinitionType)

    eventDefinitions.push(newEventDefinition)

    newEventDefinition.$parent = businessObject
    businessObject.eventDefinitions = eventDefinitions

    delete attrs.eventDefinitionType
  }

  attrs = assign(
    {
      businessObject: businessObject,
      id: businessObject.id
    },
    size,
    attrs
  )

  return this.baseCreate(elementType, attrs)
}

/**
 * Retrieve the default size of a given semantic element.
 *
 * @param semantic
 */
ElementFactory.prototype._getDefaultSize = function (semantic) {
  return getDefaultSize(semantic)
}
