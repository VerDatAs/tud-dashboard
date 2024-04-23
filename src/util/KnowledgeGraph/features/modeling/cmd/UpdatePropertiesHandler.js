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
import { getBusinessObject, getDi } from '@/util/KnowledgeGraph/util/ModelUtil'
import { reduce, keys, forEach, assign } from 'min-dash'

const DEFAULT_FLOW = 'default'
const ID = 'id'
const DI = 'di'

const NULL_DIMENSIONS = {
  width: 0,
  height: 0
}

/**
 * A handler that implements a VerDatAs property update.
 */
export default function UpdatePropertiesHandler(elementRegistry, moddle, translate, modeling, textRenderer) {
  this._elementRegistry = elementRegistry
  this._moddle = moddle
  this._translate = translate
  this._modeling = modeling
  this._textRenderer = textRenderer
}

UpdatePropertiesHandler.$inject = ['elementRegistry', 'moddle', 'translate', 'modeling', 'textRenderer']

// API specific stuff

/**
 * Updates an element with a list of new properties.
 *
 * @param context
 */
UpdatePropertiesHandler.prototype.execute = function (context) {
  const element = context.element
  const changed = [element]
  const translate = this._translate

  if (!element) {
    throw new Error(translate('element required'))
  }

  const elementRegistry = this._elementRegistry
  const ids = this._moddle.ids

  const businessObject = element.businessObject
  const properties = unwrapBusinessObjects(context.properties)
  const oldProperties = context.oldProperties || getProperties(element, properties)

  if (isIdChange(properties, businessObject)) {
    ids.unclaim(businessObject[ID])

    elementRegistry.updateId(element, properties[ID])

    ids.claim(properties[ID], businessObject)
  }

  // Correctly indicate the visual changes on the default flow updates
  if (DEFAULT_FLOW in properties) {
    if (properties[DEFAULT_FLOW]) {
      changed.push(elementRegistry.get(properties[DEFAULT_FLOW].id))
    }

    if (businessObject[DEFAULT_FLOW]) {
      changed.push(elementRegistry.get(businessObject[DEFAULT_FLOW].id))
    }
  }

  // Set the new properties
  setProperties(element, properties)

  // Store the old values
  context.oldProperties = oldProperties
  context.changed = changed

  return changed
}

/**
 * Resize the shape of the label after updating an element.
 *
 * @param context
 */
UpdatePropertiesHandler.prototype.postExecute = function (context) {
  const element = context.element
  const label = element.label

  const text = label && getBusinessObject(label).name

  if (!text) {
    return
  }

  // Retrieve the layouted text bounds and resize external label accordingly
  const newLabelBounds = this._textRenderer.getExternalLabelBounds(label, text)

  this._modeling.resizeShape(label, newLabelBounds, NULL_DIMENSIONS)
}

/**
 * Reverts the update on an element's properties.
 */
UpdatePropertiesHandler.prototype.revert = function (context) {
  const element = context.element
  const properties = context.properties
  const oldProperties = context.oldProperties
  const businessObject = element.businessObject
  const elementRegistry = this._elementRegistry
  const ids = this._moddle.ids

  // Set the old properties
  setProperties(element, oldProperties)

  if (isIdChange(properties, businessObject)) {
    ids.unclaim(properties[ID])

    elementRegistry.updateId(element, oldProperties[ID])

    ids.claim(oldProperties[ID], businessObject)
  }

  return context.changed
}

/**
 * Check for ID changes.
 *
 * @param properties
 * @param businessObject
 */
function isIdChange(properties, businessObject) {
  return ID in properties && properties[ID] !== businessObject[ID]
}

/**
 * Retrieve the properties of an element.
 *
 * @param element
 * @param properties
 */
function getProperties(element, properties) {
  const propertyNames = keys(properties)
  const businessObject = element.businessObject
  const di = getDi(element)

  return reduce(
    propertyNames,
    function (result, key) {
      // Handle DI separately
      if (key !== DI) {
        result[key] = businessObject.get(key)
      } else {
        result[key] = getDiProperties(di, keys(properties.di))
      }

      return result
    },
    {}
  )
}

/**
 * Retrieve the properties of a DI.
 *
 * @param di
 * @param propertyNames
 */
function getDiProperties(di, propertyNames) {
  return reduce(
    propertyNames,
    function (result, key) {
      result[key] = di && di.get(key)

      return result
    },
    {}
  )
}

/**
 * Set the properties of an element.
 *
 * @param element
 * @param properties
 */
function setProperties(element, properties) {
  const businessObject = element.businessObject
  const di = getDi(element)

  forEach(properties, function (value, key) {
    if (key !== DI) {
      businessObject.set(key, value)
    } else {
      // Only update, if di exists
      if (di) {
        setDiProperties(di, value)
      }
    }
  })
}

/**
 * Set the properties of a DI.
 *
 * @param di
 * @param properties
 */
function setDiProperties(di, properties) {
  forEach(properties, function (value, key) {
    di.set(key, value)
  })
}

const referencePropertyNames = ['default']

/**
 * Make sure to unwrap the actual business object behind the diagram element that may have been passed as arguments.
 */
function unwrapBusinessObjects(properties) {
  const unwrappedProps = assign({}, properties)

  referencePropertyNames.forEach(function (name) {
    if (name in properties) {
      unwrappedProps[name] = getBusinessObject(unwrappedProps[name])
    }
  })

  return unwrappedProps
}
