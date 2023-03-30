import { assign } from 'min-dash'

import { getLabel } from './LabelUtil'

import { is } from '../../util/ModelUtil'

import { getExternalLabelMid, isLabelExternal, hasExternalLabel, isLabel } from '../../util/LabelUtil'

var HIGH_PRIORITY = 2000

export default function LabelEditingProvider(eventBus, verDatAsFactory, canvas, directEditing, modeling, textRenderer) {
  this._verDatAsFactory = verDatAsFactory
  this._canvas = canvas
  this._modeling = modeling
  this._textRenderer = textRenderer

  directEditing.registerProvider(this)

  // listen to dblclick on non-root elements
  eventBus.on('element.dblclick', function (event) {
    activateDirectEdit(event.element, true)
  })

  // complete on followup canvas operation
  eventBus.on(
    [
      'autoPlace.start',
      'canvas.viewbox.changing',
      'drag.init',
      'element.mousedown',
      'popupMenu.open',
      'root.set',
      'selection.changed'
    ],
    function () {
      if (directEditing.isActive()) {
        directEditing.complete()
      }
    }
  )

  eventBus.on(['shape.remove', 'connection.remove'], HIGH_PRIORITY, function (event) {
    if (directEditing.isActive(event.element)) {
      directEditing.cancel()
    }
  })

  // cancel on command stack changes
  eventBus.on(['commandStack.changed'], function () {
    if (directEditing.isActive()) {
      directEditing.cancel()
    }
  })

  function activateDirectEdit(element, force) {
    if ((force || is(element, 'verDatAs:GraphElement')) && !is(element, 'verDatAs:SequenceFlow')) {
      directEditing.activate(element)
    }
  }
}

LabelEditingProvider.$inject = ['eventBus', 'verDatAsFactory', 'canvas', 'directEditing', 'modeling', 'textRenderer']

/**
 * Activate direct editing for activities and text annotations.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} an object with properties bounds (position and size), text and options
 */
LabelEditingProvider.prototype.activate = function (element) {
  // text
  var text = getLabel(element)

  if (text === undefined) {
    return
  }

  var context = {
    text: text
  }

  // bounds
  var bounds = this.getEditingBBox(element)

  assign(context, bounds)

  var options = {}

  // external labels
  if (isLabelExternal(element)) {
    assign(options, {
      autoResize: true
    })
  }

  assign(context, {
    options: options
  })

  return context
}

/**
 * Get the editing bounding box based on the element's size and position
 *
 * @param  {djs.model.Base} element
 *
 * @return {Object} an object containing information about position
 *                  and size (fixed or minimum and/or maximum)
 */
LabelEditingProvider.prototype.getEditingBBox = function (element) {
  var canvas = this._canvas

  var target = element.label || element

  var bbox = canvas.getAbsoluteBBox(target)

  var mid = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  }

  // default position
  var bounds = { x: bbox.x, y: bbox.y }

  var zoom = canvas.zoom()

  var externalStyle = this._textRenderer.getExternalStyle()

  // take zoom into account
  var externalFontSize = externalStyle.fontSize * zoom,
    externalLineHeight = externalStyle.lineHeight

  var style = {
    fontFamily: this._textRenderer.getDefaultStyle().fontFamily,
    fontWeight: this._textRenderer.getDefaultStyle().fontWeight
  }

  var width = 90 * zoom,
    paddingTop = 7 * zoom,
    paddingBottom = 4 * zoom

  // external labels for events, data elements, gateways, groups and connections
  if (target.labelTarget) {
    assign(bounds, {
      width: width,
      height: bbox.height + paddingTop + paddingBottom,
      x: mid.x - width / 2,
      y: bbox.y - paddingTop
    })

    assign(style, {
      fontSize: externalFontSize + 'px',
      lineHeight: externalLineHeight,
      paddingTop: paddingTop + 'px',
      paddingBottom: paddingBottom + 'px'
    })
  }

  // external label not yet created
  if (isLabelExternal(target) && !hasExternalLabel(target) && !isLabel(target)) {
    var externalLabelMid = getExternalLabelMid(element)

    var absoluteBBox = canvas.getAbsoluteBBox({
      x: externalLabelMid.x,
      y: externalLabelMid.y,
      width: 0,
      height: 0
    })

    var height = externalFontSize + paddingTop + paddingBottom

    assign(bounds, {
      width: width,
      height: height,
      x: absoluteBBox.x - width / 2,
      y: absoluteBBox.y - height / 2
    })

    assign(style, {
      fontSize: externalFontSize + 'px',
      lineHeight: externalLineHeight,
      paddingTop: paddingTop + 'px',
      paddingBottom: paddingBottom + 'px'
    })
  }

  return { bounds: bounds, style: style }
}

LabelEditingProvider.prototype.update = function (element, newLabel) {
  if (isEmptyText(newLabel)) {
    newLabel = null
  }

  this._modeling.updateLabel(element, newLabel)
}

// helpers //////////////////////

function isEmptyText(label) {
  return !label || !label.trim()
}
