import translate from 'diagram-js/lib/i18n/translate'

import VerDatAsImporter from './VerDatAsImporter'

export default {
  __depends__: [translate],
  verDatAsImporter: ['type', VerDatAsImporter]
}
