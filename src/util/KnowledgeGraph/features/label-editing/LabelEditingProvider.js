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
import { getExternalLabelMid, isLabelExternal, hasExternalLabel, isLabel } from '@/util/KnowledgeGraph/util/LabelUtil'
import { is } from '@/util/KnowledgeGraph/util/ModelUtil'
import { assign } from 'min-dash'

export default function LabelEditingProvider(eventBus, verDatAsFactory, canvas, directEditing, modeling, textRenderer) {
  this._verDatAsFactory = verDatAsFactory
  this._canvas = canvas
  this._modeling = modeling
  this._textRenderer = textRenderer

  directEditing.registerProvider(this)

  /**
   * Listen to double-click on non-root elements to activate the direct editing.
   */
  eventBus.on('element.dblclick', function (event) {
    activateDirectEdit(event.element, true)
  })

  /**
   * Complete the direct editing on followup canvas operations.
   */
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

  /**
   * Cancel the direct editing if either a shape or a connection is removed.
   * 2000 = high priority
   */
  eventBus.on(['shape.remove', 'connection.remove'], 2000, function (event) {
    if (directEditing.isActive(event.element)) {
      directEditing.cancel()
    }
  })

  /**
   * Cancel the direct editing if the command stack changes.
   */
  eventBus.on(['commandStack.changed'], function () {
    if (directEditing.isActive()) {
      directEditing.cancel()
    }
  })

  /**
   * Function to (forcefully) activate the direct editing.
   *
   * @param element
   * @param force
   */
  function activateDirectEdit(element, force) {
    if ((force || is(element, 'verDatAs:GraphElement')) && !is(element, 'verDatAs:SequenceFlow')) {
      directEditing.activate(element)
    }
  }
}

LabelEditingProvider.$inject = ['eventBus', 'verDatAsFactory', 'canvas', 'directEditing', 'modeling', 'textRenderer']

/**
 * Activate the direct editing.
 *
 * @param element
 */
LabelEditingProvider.prototype.activate = function (element) {
  const text = getLabel(element)

  if (text === undefined) {
    return
  }

  const context = {
    text: text
  }

  const bounds = this.getEditingBBox(element)

  assign(context, bounds)

  const options = {}

  // External labels
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
 * Retrieve the editing bounding box based on the element's size and position.
 *
 * @param element
 *
 */
LabelEditingProvider.prototype.getEditingBBox = function (element) {
  const canvas = this._canvas

  const target = element.label || element

  const bbox = canvas.getAbsoluteBBox(target)

  const mid = {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2
  }

  // Default position
  const bounds = { x: bbox.x, y: bbox.y }

  const zoom = canvas.zoom()

  const externalStyle = this._textRenderer.getExternalStyle()

  // Take zoom into account
  const externalFontSize = externalStyle.fontSize * zoom
  const externalLineHeight = externalStyle.lineHeight

  const style = {
    fontFamily: this._textRenderer.getDefaultStyle().fontFamily,
    fontWeight: this._textRenderer.getDefaultStyle().fontWeight
  }

  const width = 90 * zoom
  const paddingTop = 7 * zoom
  const paddingBottom = 4 * zoom

  // External labels for events, data elements, gateways, groups and connections
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

  // External label is not yet created
  if (isLabelExternal(target) && !hasExternalLabel(target) && !isLabel(target)) {
    const externalLabelMid = getExternalLabelMid(element)

    const absoluteBBox = canvas.getAbsoluteBBox({
      x: externalLabelMid.x,
      y: externalLabelMid.y,
      width: 0,
      height: 0
    })

    const height = externalFontSize + paddingTop + paddingBottom

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

/**
 * Update action for label editing.
 *
 * @param element
 * @param newLabel
 */
LabelEditingProvider.prototype.update = function (element, newLabel) {
  if (isEmptyText(newLabel)) {
    newLabel = null
  }

  this._modeling.updateLabel(element, newLabel)
}

function isEmptyText(label) {
  return !label || !label.trim()
}
