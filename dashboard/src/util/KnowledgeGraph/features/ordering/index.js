import translate from 'diagram-js/lib/i18n/translate'

import VerDatAsOrderingProvider from './VerDatAsOrderingProvider'

export default {
  __depends__: [translate],
  __init__: ['verDatAsOrderingProvider'],
  verDatAsOrderingProvider: ['type', VerDatAsOrderingProvider]
}
