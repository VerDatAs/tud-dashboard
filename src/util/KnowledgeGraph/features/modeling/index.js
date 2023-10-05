import DiOrderingModule from '../di-ordering'
import OrderingModule from '../ordering'

import VerDatAsFactory from './VerDatAsFactory'
// TODO: Using VerDatAsUpdater instead of VerDatAsUpdaterBpmnCopy works here, as we modified ../../util/ModelUtil.js getDi
import VerDatAsUpdater from './VerDatAsUpdater'
// TODO: A decision between using .di or .businessObject.di has to be made (usage of .di has to be fixed)
import ElementFactory from './ElementFactoryBpmnCopy'
import Modeling from './Modeling'
import BpmnLayouter from './BpmnLayouter'
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking'

export default {
  __init__: ['modeling', 'verDatAsUpdater'],
  __depends__: [DiOrderingModule, OrderingModule],
  verDatAsFactory: ['type', VerDatAsFactory],
  verDatAsUpdater: ['type', VerDatAsUpdater],
  elementFactory: ['type', ElementFactory],
  modeling: ['type', Modeling],
  layouter: ['type', BpmnLayouter],
  connectionDocking: ['type', CroppingConnectionDocking]
}
