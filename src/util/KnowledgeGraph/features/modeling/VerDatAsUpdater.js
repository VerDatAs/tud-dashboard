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
import { getBusinessObject, getDi, is } from '@/util/KnowledgeGraph/util/ModelUtil'
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor'
import { Label } from 'diagram-js/lib/model'
import { remove as collectionRemove } from 'diagram-js/lib/util/Collections'
import { delta } from 'diagram-js/lib/util/PositionUtil'
import inherits from 'inherits-browser'
import { assign, forEach } from 'min-dash'

/**
 * A handler responsible for updating the underlying VerDatAs XML and DI once changes on the diagram happen.
 */
export default function VerDatAsUpdater(eventBus, verDatAsFactory, connectionDocking, translate) {
  CommandInterceptor.call(this, eventBus)

  this._verDatAsFactory = verDatAsFactory
  this._translate = translate

  const self = this

  // Connection cropping

  /**
   * Crop connection ends during create/update.
   */
  function cropConnection(e) {
    const context = e.context
    const hints = context.hints || {}
    let connection

    if (!context.cropped && hints.createElementsBehavior !== false) {
      connection = context.connection
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection)
      context.cropped = true
    }
  }

  this.executed(['connection.layout', 'connection.create'], cropConnection)

  this.reverted(['connection.layout'], function (e) {
    delete e.context.cropped
  })

  // VerDatAs and DI update

  /**
   * Update the parent element.
   *
   * @param e
   */
  function updateParent(e) {
    const context = e.context

    self.updateParent(context.shape || context.connection)
  }

  /**
   * Reverse updating the parent element.
   *
   * @param e
   */
  function reverseUpdateParent(e) {
    const context = e.context

    const element = context.shape || context.connection

    self.updateParent(element)
  }

  this.executed(
    ['shape.move', 'shape.create', 'shape.delete', 'connection.create', 'connection.move', 'connection.delete'],
    ifVerDatAs(updateParent)
  )

  this.reverted(
    ['shape.move', 'shape.create', 'shape.delete', 'connection.create', 'connection.move', 'connection.delete'],
    ifVerDatAs(reverseUpdateParent)
  )

  /**
   * Updating the root element.
   *
   * @param event
   */
  function updateRoot(event) {
    const context = event.context
    const oldRoot = context.oldRoot
    const children = oldRoot.children

    forEach(children, function (child) {
      if (is(child, 'verDatAs:GraphElement')) {
        self.updateParent(child)
      }
    })
  }

  this.executed(['canvas.updateRoot'], updateRoot)
  this.reverted(['canvas.updateRoot'], updateRoot)

  /**
   * Updating the bounds of an element.
   *
   * @param e
   */
  function updateBounds(e) {
    const shape = e.context.shape

    if (!is(shape, 'verDatAs:GraphElement')) {
      return
    }

    self.updateBounds(shape)
  }

  this.executed(
    ['shape.move', 'shape.create', 'shape.resize'],
    ifVerDatAs(function (event) {
      // Exclude labels because they are handled separately during shape.changed
      if (event.context.shape.type === 'label') {
        return
      }

      updateBounds(event)
    })
  )

  this.reverted(
    ['shape.move', 'shape.create', 'shape.resize'],
    ifVerDatAs(function (event) {
      // Exclude labels because they are handled separately during shape.changed
      if (event.context.shape.type === 'label') {
        return
      }

      updateBounds(event)
    })
  )

  /**
   * Handle labels separately. This is necessary, because the label bounds have to be updated
   * every time its shape changes, not only on move, create and resize.
   */
  eventBus.on('shape.changed', function (event) {
    if (event.element.type === 'label') {
      updateBounds({ context: { shape: event.element } })
    }
  })

  /**
   * Attach/detach a connection.
   *
   * @param e
   */
  function updateConnection(e) {
    self.updateConnection(e.context)
  }

  this.executed(
    ['connection.create', 'connection.move', 'connection.delete', 'connection.reconnect'],
    ifVerDatAs(updateConnection)
  )

  this.reverted(
    ['connection.create', 'connection.move', 'connection.delete', 'connection.reconnect'],
    ifVerDatAs(updateConnection)
  )

  /**
   * Update the waypoints of a connection.
   *
   * @param e
   */
  function updateConnectionWaypoints(e) {
    self.updateConnectionWaypoints(e.context.connection)
  }

  this.executed(
    ['connection.layout', 'connection.move', 'connection.updateWaypoints'],
    ifVerDatAs(updateConnectionWaypoints)
  )

  this.reverted(
    ['connection.layout', 'connection.move', 'connection.updateWaypoints'],
    ifVerDatAs(updateConnectionWaypoints)
  )

  // Update conditional/default flows
  this.executed(
    'connection.reconnect',
    ifVerDatAs(function (event) {
      const context = event.context
      const connection = context.connection
      const oldSource = context.oldSource
      const newSource = context.newSource
      const connectionBo = getBusinessObject(connection)
      const oldSourceBo = getBusinessObject(oldSource)

      // Remove default from old source flow on reconnect to new source if source changed
      if (oldSource !== newSource && oldSourceBo.default === connectionBo) {
        context.oldDefault = oldSourceBo.default

        delete oldSourceBo.default
      }
    })
  )

  this.reverted(
    'connection.reconnect',
    ifVerDatAs(function (event) {
      const context = event.context
      const connection = context.connection
      const oldSource = context.oldSource
      const newSource = context.newSource
      const connectionBo = getBusinessObject(connection)
      const oldSourceBo = getBusinessObject(oldSource)
      const newSourceBo = getBusinessObject(newSource)

      // Add condition to connection on revert reconnect to new source
      if (context.oldConditionExpression) {
        connectionBo.conditionExpression = context.oldConditionExpression
      }

      // Add default to old source on revert reconnect to new source
      if (context.oldDefault) {
        oldSourceBo.default = context.oldDefault

        delete newSourceBo.default
      }
    })
  )

  /**
   * Update the element's attachments.
   */
  function updateAttachment(e) {
    self.updateAttachment(e.context)
  }

  this.executed(['element.updateAttachment'], ifVerDatAs(updateAttachment))
  this.reverted(['element.updateAttachment'], ifVerDatAs(updateAttachment))
}

inherits(VerDatAsUpdater, CommandInterceptor)

VerDatAsUpdater.$inject = ['eventBus', 'verDatAsFactory', 'connectionDocking', 'translate']

// Actual Implementation

/**
 * Update the element's attachments.
 *
 * @param context
 */
VerDatAsUpdater.prototype.updateAttachment = function (context) {
  const shape = context.shape
  const businessObject = shape.businessObject
  const host = shape.host

  businessObject.attachedToRef = host && host.businessObject
}

/**
 * Update the parent element.
 *
 * @param element
 */
VerDatAsUpdater.prototype.updateParent = function (element) {
  // Do not update label parent
  if (element instanceof Label) {
    return
  }

  const parentShape = element.parent

  const businessObject = element.businessObject
  const di = getDi(element)
  let parentBusinessObject = parentShape && parentShape.businessObject
  const parentDi = getDi(parentShape)

  this.updateSemanticParent(businessObject, parentBusinessObject)
  this.updateDiParent(di, parentDi)
}

/**
 * Updating the bounds of an element.
 *
 * @param shape
 */
VerDatAsUpdater.prototype.updateBounds = function (shape) {
  const di = getDi(shape)
  const embeddedLabelBounds = getEmbeddedLabelBounds(shape)

  // Update the embedded label bounds, if possible
  if (embeddedLabelBounds) {
    const embeddedLabelBoundsDelta = delta(embeddedLabelBounds, di.get('bounds'))

    assign(embeddedLabelBounds, {
      x: shape.x + embeddedLabelBoundsDelta.x,
      y: shape.y + embeddedLabelBoundsDelta.y
    })
  }

  const target = shape instanceof Label ? this._getLabel(di) : di

  let bounds = target.bounds

  if (!bounds) {
    bounds = this._verDatAsFactory.createDiBounds()
    target.set('bounds', bounds)
  }

  assign(bounds, {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height
  })
}

/**
 * Update the existing sourceElement's and targetElement's DI information.
 *
 * @param connection
 * @param newSource
 * @param newTarget
 */
VerDatAsUpdater.prototype.updateDiConnection = function (connection, newSource, newTarget) {
  const connectionDi = getDi(connection)
  const newSourceDi = getDi(newSource)
  const newTargetDi = getDi(newTarget)

  if (connectionDi.sourceElement && connectionDi.sourceElement.graphElement !== getBusinessObject(newSource)) {
    connectionDi.sourceElement = newSource && newSourceDi
  }

  if (connectionDi.targetElement && connectionDi.targetElement.graphElement !== getBusinessObject(newTarget)) {
    connectionDi.targetElement = newTarget && newTargetDi
  }
}

/**
 * Update the DI information of the parent.
 *
 * @param di
 * @param parentDi
 */
VerDatAsUpdater.prototype.updateDiParent = function (di, parentDi) {
  if (parentDi && !is(parentDi, 'verDatAsDi:GraphPlane')) {
    parentDi = parentDi.$parent
  }

  if (di.$parent === parentDi) {
    return
  }

  const planeElements = (parentDi || di.$parent).get('planeElement')

  if (parentDi) {
    planeElements.push(di)
    di.$parent = parentDi
  } else {
    collectionRemove(planeElements, di)
    di.$parent = null
  }
}

/**
 * Update the semantic parent of an element.
 *
 * @param businessObject
 * @param newParent
 * @param visualParent
 */
VerDatAsUpdater.prototype.updateSemanticParent = function (businessObject, newParent, visualParent) {
  let containment
  const translate = this._translate

  if (businessObject.$parent === newParent) {
    return
  }

  if (is(businessObject, 'verDatAs:GraphElement')) {
    containment = 'graphElements'
  }

  if (!containment) {
    throw new Error(
      translate('no parent for {element} in {parent}', {
        element: businessObject.id,
        parent: newParent.id
      })
    )
  }

  let children

  if (businessObject.$parent) {
    // Remove from the old parent
    children = businessObject.$parent.get(containment)
    collectionRemove(children, businessObject)
  }

  if (!newParent) {
    businessObject.$parent = null
  } else {
    // Add to the new parent
    children = newParent.get(containment)
    children.push(businessObject)
    businessObject.$parent = newParent
  }

  if (visualParent) {
    let diChildren = visualParent.get(containment)

    collectionRemove(children, businessObject)

    if (newParent) {
      if (!diChildren) {
        diChildren = []
        newParent.set(containment, diChildren)
      }

      diChildren.push(businessObject)
    }
  }
}

/**
 * Update the waypoints of a connection.
 *
 * @param connection
 */
VerDatAsUpdater.prototype.updateConnectionWaypoints = function (connection) {
  const di = getDi(connection)

  di.set('waypoint', this._verDatAsFactory.createDiWaypoints(connection.waypoints))
}

/**
 * Attach/detach a connection.
 *
 * @param context
 */
VerDatAsUpdater.prototype.updateConnection = function (context) {
  const connection = context.connection
  const newSource = connection.source
  const newTarget = connection.target

  this.updateConnectionWaypoints(connection)
  this.updateDiConnection(connection, newSource, newTarget)
}

/**
 * Helper function to retrieve the label of a DI.
 *
 * @param di
 */
VerDatAsUpdater.prototype._getLabel = function (di) {
  if (!di.label) {
    di.label = this._verDatAsFactory.createDiLabel()
  }

  return di.label
}

/**
 * Helper function to ensure that the event listener is only called if the touched element is a VerDatAs element.
 *
 * @param fn
 */
function ifVerDatAs(fn) {
  return function (event) {
    const context = event.context
    const element = context.shape || context.connection

    if (is(element, 'verDatAs:GraphElement')) {
      fn(event)
    }
  }
}

/**
 * Helper function to return the bounds of a label, if it exists.
 *
 * @param shape
 */
function getEmbeddedLabelBounds(shape) {
  const di = getDi(shape)

  if (!di) {
    return
  }

  const label = di.get('label')

  if (!label) {
    return
  }

  return label.get('bounds')
}
