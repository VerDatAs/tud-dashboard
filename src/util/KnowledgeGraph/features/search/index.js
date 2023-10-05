import SearchPadModule from 'diagram-js/lib/features/search-pad'

import VerDatAsSearchProvider from './VerDatAsSearchProvider'

export default {
  __depends__: [SearchPadModule],
  __init__: ['verDatAsSearch'],
  verDatAsSearch: ['type', VerDatAsSearchProvider]
}
