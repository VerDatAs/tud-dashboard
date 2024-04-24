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
import EditorActions from 'diagram-js/lib/features/editor-actions/EditorActions'
import { getBBox } from 'diagram-js/lib/util/Elements'
import inherits from 'inherits-browser'

/**
 * Registers and executes VerDatAs specific editor actions.
 *
 * @param injector
 */
export default function VerDatAsEditorActions(injector) {
  injector.invoke(EditorActions, this)
}

inherits(VerDatAsEditorActions, EditorActions)

VerDatAsEditorActions.$inject = ['injector']

/**
 * Register default actions.
 *
 * @param injector
 */
VerDatAsEditorActions.prototype._registerDefaultActions = function (injector) {
  // (0) Invoke super method
  EditorActions.prototype._registerDefaultActions.call(this, injector)

  // (1) Retrieve optional components to integrate with
  const canvas = injector.get('canvas', false)
  const elementRegistry = injector.get('elementRegistry', false)
  const selection = injector.get('selection', false)
  const spaceTool = injector.get('spaceTool', false)
  const lassoTool = injector.get('lassoTool', false)
  const handTool = injector.get('handTool', false)
  const distributeElements = injector.get('distributeElements', false)
  const alignElements = injector.get('alignElements', false)
  const directEditing = injector.get('directEditing', false)
  const searchPad = injector.get('searchPad', false)
  const modeling = injector.get('modeling', false)

  // (2) Check components and register actions
  if (canvas && elementRegistry && selection) {
    this._registerAction('selectElements', function () {
      // Select all elements except for the invisible
      const rootElement = canvas.getRootElement()

      const elements = elementRegistry.filter(function (element) {
        return element !== rootElement
      })

      selection.select(elements)

      return elements
    })
  }

  if (spaceTool) {
    this._registerAction('spaceTool', function () {
      spaceTool.toggle()
    })
  }

  if (lassoTool) {
    this._registerAction('lassoTool', function () {
      lassoTool.toggle()
    })
  }

  if (handTool) {
    this._registerAction('handTool', function () {
      handTool.toggle()
    })
  }

  if (selection && distributeElements) {
    this._registerAction('distributeElements', function (opts) {
      const currentSelection = selection.get()
      const type = opts.type

      if (currentSelection.length) {
        distributeElements.trigger(currentSelection, type)
      }
    })
  }

  if (selection && alignElements) {
    this._registerAction('alignElements', function (opts) {
      const currentSelection = selection.get()
      const type = opts.type

      if (currentSelection.length) {
        alignElements.trigger(currentSelection, type)
      }
    })
  }

  if (selection && modeling) {
    this._registerAction('setColor', function (opts) {
      const currentSelection = selection.get()

      if (currentSelection.length) {
        modeling.setColor(currentSelection, opts)
      }
    })
  }

  if (selection && directEditing) {
    this._registerAction('directEditing', function () {
      const currentSelection = selection.get()

      if (currentSelection.length) {
        directEditing.activate(currentSelection[0])
      }
    })
  }

  if (searchPad) {
    this._registerAction('find', function () {
      searchPad.toggle()
    })
  }

  if (canvas && modeling) {
    this._registerAction('moveToOrigin', function () {
      const rootElement = canvas.getRootElement()
      let boundingBox

      const elements = elementRegistry.filter(function (element) {
        return element !== rootElement
      })

      boundingBox = getBBox(elements)

      modeling.moveElements(elements, { x: -boundingBox.x, y: -boundingBox.y }, rootElement)
    })
  }
}
