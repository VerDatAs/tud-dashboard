import { getDi } from '../../util/ModelUtil'

import { filter, forEach, map } from 'min-dash'

import { selfAndAllChildren } from 'diagram-js/lib/util/Elements'

var HIGH_PRIORITY = 2000

export default function VerDatAsDiOrdering(eventBus, canvas) {
  eventBus.on('saveXML.start', HIGH_PRIORITY, orderDi)

  function orderDi() {
    var rootElements = canvas.getRootElements()

    forEach(rootElements, function (root) {
      var rootDi = getDi(root),
        elements,
        diElements

      elements = selfAndAllChildren([root], false)

      // only bpmndi:Shape and bpmndi:Edge can be direct children of bpmndi:Plane
      elements = filter(elements, function (element) {
        return element !== root && !element.labelTarget
      })

      diElements = map(elements, getDi)
      // TODO: This ensures that the elements are ordered properly
      // Is there a more easy method to do?
      // Sort sequenceFlows to the end
      diElements.sort(function (a, b) {
        return a.id - b.id || a.id.localeCompare(b.id)
      })
      // Sort topic to the beginning
      diElements.unshift(diElements.pop())

      // TODO: Is this really the correct way to go?
      if (rootDi) {
        rootDi.set('planeElement', diElements)
      }
    })
  }
}

VerDatAsDiOrdering.$inject = ['eventBus', 'canvas']
