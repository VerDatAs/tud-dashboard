import { map, assign, pick } from 'min-dash'

import { isAny } from './util/ModelingUtil'

export default function VerDatAsFactory(moddle) {
  this._model = moddle
}

VerDatAsFactory.$inject = ['moddle']

VerDatAsFactory.prototype._needsId = function (element) {
  return isAny(element, ['verDatAs:GraphElement'])
}

VerDatAsFactory.prototype._ensureId = function (element) {
  if (element.id) {
    this._model.ids.claim(element.id, element)
    return
  }

  // generate semantic ids for elements
  // bpmn:SequenceFlow -> SequenceFlow_ID
  var prefix

  // TODO: This seems to be a hardcoded workaround
  if (!element.$type) {
    prefix = 'verDatAs'
  } else {
    prefix = (element.$type || '').replace(/^[^:]*:/g, '')
  }

  prefix += '_'

  if (!element.id && this._needsId(element)) {
    element.id = this._model.ids.nextPrefixed(prefix, element)
  }
}

VerDatAsFactory.prototype.create = function (type, attrs) {
  var element = this._model.create(type, attrs || {})

  this._ensureId(element)

  return element
}

VerDatAsFactory.prototype.createDiLabel = function () {
  return this.create('verDatAsDi:GraphLabel', {
    bounds: this.createDiBounds()
  })
}

VerDatAsFactory.prototype.createDiShape = function (semantic, attrs) {
  // Previous version
  // return this.create('bpmndi:BPMNShape', assign({
  //   bpmnElement: semantic,
  //   bounds: this.createDiBounds()
  // }, attrs));
  // TODO: The bounds are not set automatically
  const attributes = assign(
    {
      graphElement: semantic,
      bounds: this.createDiBounds({ x: attrs.x, y: attrs.y, width: attrs.width, height: attrs.height })
    },
    { id: attrs.id }
  )
  return this.create('verDatAsDi:GraphShape', attributes)
}

VerDatAsFactory.prototype.createDiBounds = function (bounds) {
  return this.create('dc:Bounds', bounds)
}

VerDatAsFactory.prototype.createDiWaypoints = function (waypoints) {
  var self = this

  return map(waypoints, function (pos) {
    return self.createDiWaypoint(pos)
  })
}

VerDatAsFactory.prototype.createDiWaypoint = function (point) {
  return this.create('dc:Point', pick(point, ['x', 'y']))
}

VerDatAsFactory.prototype.createDiEdge = function (semantic, attrs) {
  return this.create(
    'verDatAsDi:GraphEdge',
    assign(
      {
        graphElement: semantic,
        waypoint: this.createDiWaypoints([])
      },
      attrs
    )
  )
}

VerDatAsFactory.prototype.createDiPlane = function (semantic, attrs) {
  return this.create(
    'verDatAsDi:GraphPlane',
    assign(
      {
        graphElement: semantic
      },
      attrs
    )
  )
}
