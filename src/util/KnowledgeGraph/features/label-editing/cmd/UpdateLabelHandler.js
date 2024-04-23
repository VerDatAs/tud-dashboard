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
import { setLabel, getLabel } from '@/util/KnowledgeGraph/features/label-editing/LabelUtil'
import { getExternalLabelMid, isLabelExternal, hasExternalLabel, isLabel } from '@/util/KnowledgeGraph/util/LabelUtil'
import { getDi } from '@/util/KnowledgeGraph/util/ModelUtil'

const NULL_DIMENSIONS = {
  width: 0,
  height: 0
}

/**
 * A handler that updates the text of an element.
 */
export default function UpdateLabelHandler(modeling, textRenderer, verDatAsFactory) {
  /**
   * Creates an empty diLabel attribute for embedded labels.
   *
   * @param element
   * @param text
   */
  function ensureInternalLabelDi(element, text) {
    // Early return for external labels
    if (isLabelExternal(element)) {
      return
    }

    const di = getDi(element)

    if (text && !di.label) {
      di.label = verDatAsFactory.create('verDatAsDi:Label')
    }

    if (!text && di.label) {
      delete di.label
    }
  }

  /**
   * Set the label and return the changed elements.
   *
   * @param element
   * @param text
   */
  function setText(element, text) {
    // External label if present
    const label = element.label || element

    const labelTarget = element.labelTarget || element

    setLabel(label, text, labelTarget !== label)

    ensureInternalLabelDi(element, text)

    return [label, labelTarget]
  }

  /**
   * Define actions that are carried out before the actual execution.
   *
   * @param ctx
   */
  function preExecute(ctx) {
    const element = ctx.element
    const businessObject = element.businessObject
    const newLabel = ctx.newLabel

    if (!isLabel(element) && isLabelExternal(element) && !hasExternalLabel(element) && !isEmptyText(newLabel)) {
      // Create label
      let labelCenter = getExternalLabelMid(element)

      labelCenter = {
        x: labelCenter.x,
        y: labelCenter.y
      }

      modeling.createLabel(element, labelCenter, {
        id: businessObject.id + '_label',
        businessObject: businessObject,
        di: element.di
      })
    }
  }

  /**
   * Define actions during execution.
   *
   * @param ctx
   */
  function execute(ctx) {
    ctx.oldLabel = getLabel(ctx.element)
    return setText(ctx.element, ctx.newLabel)
  }

  /**
   * Define actions that are carried out on revert.
   *
   * @param ctx
   */
  function revert(ctx) {
    return setText(ctx.element, ctx.oldLabel)
  }

  /**
   * Define actions that are carried out after the actual execution.
   *
   * @param ctx
   */
  function postExecute(ctx) {
    const element = ctx.element
    const label = element.label || element
    const newLabel = ctx.newLabel
    let newBounds = ctx.newBounds
    const hints = ctx.hints || {}

    if (!isLabel(label)) {
      return
    }

    if (isLabel(label) && isEmptyText(newLabel)) {
      if (hints.removeShape !== false) {
        modeling.removeShape(label, { unsetLabel: false })
      }

      return
    }

    const text = getLabel(label)

    // Resize element based on label _or_ pre-defined bounds
    if (typeof newBounds === 'undefined') {
      newBounds = textRenderer.getExternalLabelBounds(label, text, element)
    }

    // Setting newBounds to false or _null_ will
    // Disable the postExecute resize operation
    if (newBounds) {
      modeling.resizeShape(label, newBounds, NULL_DIMENSIONS)
    }
  }

  // API specific stuff
  this.preExecute = preExecute
  this.execute = execute
  this.revert = revert
  this.postExecute = postExecute
}

UpdateLabelHandler.$inject = ['modeling', 'textRenderer', 'verDatAsFactory']

function isEmptyText(label) {
  return !label || !label.trim()
}
