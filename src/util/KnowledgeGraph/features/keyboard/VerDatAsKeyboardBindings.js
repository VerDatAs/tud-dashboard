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
import KeyboardBindings from 'diagram-js/lib/features/keyboard/KeyboardBindings'
import inherits from 'inherits'

/**
 * VerDatAs specific keyboard bindings.
 *
 * @param injector
 */
export default function VerDatAsKeyboardBindings(injector) {
  injector.invoke(KeyboardBindings, this)
}

inherits(VerDatAsKeyboardBindings, KeyboardBindings)

VerDatAsKeyboardBindings.$inject = ['injector']

/**
 * Register available keyboard bindings.
 *
 * @param keyboard
 * @param editorActions
 */
VerDatAsKeyboardBindings.prototype.registerBindings = function (keyboard, editorActions) {
  // Remove several keyboard actions defined by diagram-js
  // TODO: Is there a better option to overwrite the keyboard actions?
  const actionsToRemove = ['undo', 'redo', 'copy', 'paste', 'removeSelection']
  actionsToRemove.forEach((action) => {
    editorActions._actions[action] = () => {
      return
    }
  })

  // Inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(this, keyboard, editorActions)

  /**
   * Add keyboard binding if respective editor action is registered.
   *
   * @param action
   * @param fn
   */
  function addListener(action, fn) {
    if (editorActions.isRegistered(action)) {
      keyboard.addListener(fn)
    }
  }

  // Search labels (CTRL + F)
  addListener('find', function (context) {
    const event = context.keyEvent

    if (keyboard.isKey(['f', 'F'], event) && keyboard.isCmd(event)) {
      editorActions.trigger('find')
      return true
    }
  })

  // Activate direct editing (E)
  addListener('directEditing', function (context) {
    const event = context.keyEvent

    if (keyboard.hasModifier(event)) {
      return
    }

    if (keyboard.isKey(['e', 'E'], event)) {
      editorActions.trigger('directEditing')
      return true
    }
  })
}
