import EditorActionsModule from 'diagram-js/lib/features/editor-actions'

import VerDatAsEditorActions from './VerDatAsEditorActions'

export default {
  __depends__: [EditorActionsModule],
  editorActions: ['type', VerDatAsEditorActions]
}
