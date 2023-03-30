import inherits from 'inherits'

import KeyboardBindings from 'diagram-js/lib/features/keyboard/KeyboardBindings'

/**
 * VerDatAs specific keyboard bindings.
 *
 * @param {Injector} injector
 */
export default function VerDatAsKeyboardBindings(injector) {
  injector.invoke(KeyboardBindings, this)
}

inherits(VerDatAsKeyboardBindings, KeyboardBindings)

VerDatAsKeyboardBindings.$inject = ['injector']

/**
 * Register available keyboard bindings.
 *
 * @param {Keyboard} keyboard
 * @param {EditorActions} editorActions
 */
VerDatAsKeyboardBindings.prototype.registerBindings = function (keyboard, editorActions) {
  // Remove several keyboard actions defined by diagram-js
  // TODO: Is there another option to overwrite the keyboard actions?
  const actionsToRemove = ['undo', 'redo', 'copy', 'paste', 'removeSelection']
  actionsToRemove.forEach((action) => {
    editorActions._actions[action] = () => {
      return
    }
  })

  // inherit default bindings
  KeyboardBindings.prototype.registerBindings.call(this, keyboard, editorActions)

  /**
   * Add keyboard binding if respective editor action
   * is registered.
   *
   * @param {string} action name
   * @param {Function} fn that implements the key binding
   */
  function addListener(action, fn) {
    if (editorActions.isRegistered(action)) {
      keyboard.addListener(fn)
    }
  }

  // search labels
  // CTRL + F
  addListener('find', function (context) {
    var event = context.keyEvent

    if (keyboard.isKey(['f', 'F'], event) && keyboard.isCmd(event)) {
      editorActions.trigger('find')

      return true
    }
  })

  // activate direct editing
  // E
  addListener('directEditing', function (context) {
    var event = context.keyEvent

    if (keyboard.hasModifier(event)) {
      return
    }

    if (keyboard.isKey(['e', 'E'], event)) {
      editorActions.trigger('directEditing')

      return true
    }
  })
}
