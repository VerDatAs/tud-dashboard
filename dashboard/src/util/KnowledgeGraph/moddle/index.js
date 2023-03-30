import { assign } from 'min-dash'

import Moddle from './Moddle'

import VerDatAsDescriptors from './resources/verDatAs.json'
import DiDescriptors from './resources/verDatAsDi.json'
import DcDescriptors from './resources/dc.json'

var packages = {
  verDatAs: VerDatAsDescriptors,
  verDatAsDi: DiDescriptors,
  dc: DcDescriptors
}

export default function (additionalPackages, options) {
  var pks = assign({}, packages, additionalPackages)

  return new Moddle(pks, options)
}
