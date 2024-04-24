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
import BaseModeling from 'diagram-js/lib/features/modeling/Modeling'
import inherits from 'inherits-browser'
import UpdateLabelHandler from '@/util/KnowledgeGraph/features/label-editing/cmd/UpdateLabelHandler'
import UpdatePropertiesHandler from '@/util/KnowledgeGraph/features/modeling/cmd/UpdatePropertiesHandler'

/**
 * VerDatAs modeling features activator.
 *
 * @param eventBus
 * @param elementFactory
 * @param commandStack
 */
export default function Modeling(eventBus, elementFactory, commandStack) {
  BaseModeling.call(this, eventBus, elementFactory, commandStack)
}

inherits(Modeling, BaseModeling)

Modeling.$inject = ['eventBus', 'elementFactory', 'commandStack']

/**
 * Retrieve specified handlers.
 */
Modeling.prototype.getHandlers = function () {
  const handlers = BaseModeling.prototype.getHandlers.call(this)

  handlers['element.updateProperties'] = UpdatePropertiesHandler
  handlers['element.updateLabel'] = UpdateLabelHandler

  return handlers
}

/**
 * Update the label of an element.
 *
 * @param element
 * @param newLabel
 * @param newBounds
 * @param hints
 */
Modeling.prototype.updateLabel = function (element, newLabel, newBounds, hints) {
  this._commandStack.execute('element.updateLabel', {
    element: element,
    newLabel: newLabel,
    newBounds: newBounds,
    hints: hints || {}
  })
}

/**
 * Update the properties of an element.
 *
 * @param element
 * @param properties
 */
Modeling.prototype.updateProperties = function (element, properties) {
  this._commandStack.execute('element.updateProperties', {
    element: element,
    properties: properties
  })
}
