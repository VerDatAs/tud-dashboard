import KeyboardModule from 'diagram-js/lib/features/keyboard'

import VerDatAsKeyboardBindings from './VerDatAsKeyboardBindings'

export default {
  __depends__: [KeyboardModule],
  __init__: ['keyboardBindings'],
  keyboardBindings: ['type', VerDatAsKeyboardBindings]
}
