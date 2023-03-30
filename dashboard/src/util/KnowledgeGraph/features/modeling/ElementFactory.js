import { assign, forEach, isObject, omit } from 'min-dash'

import inherits from 'inherits-browser'

import { is } from '../../util/ModelUtil'

import { isAny } from './util/ModelingUtil'

import BaseElementFactory from 'diagram-js/lib/core/ElementFactory'

import { DEFAULT_LABEL_SIZE } from '../../util/LabelUtil'

import { ensureCompatDiRef } from '../../util/CompatibilityUtil'

/**
 * A bpmn-aware factory for diagram-js shapes
 */
export default function ElementFactory(verDatAsFactory, moddle, translate) {
  BaseElementFactory.call(this)

  this._verDatAsFactory = verDatAsFactory
  this._moddle = moddle
  this._translate = translate
}

inherits(ElementFactory, BaseElementFactory)

ElementFactory.$inject = ['verDatAsFactory', 'moddle', 'translate']

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create

ElementFactory.prototype.create = function (elementType, attrs) {
  // no special magic for labels,
  // we assume their businessObjects have already been created
  // and wired via attrs
  if (elementType === 'label') {
    var di = attrs.di || this._verDatAsFactory.createDiLabel()
    return this.baseCreate(elementType, assign({ type: 'label', di: di }, DEFAULT_LABEL_SIZE, attrs))
  }

  // TODO: This should be done automatically
  if (elementType === 'connection') {
    if (!attrs) {
      attrs = {}
    }
    attrs.type = 'verDatAs:SequenceFlow'
  }

  return this.createVerDatAsElement(elementType, attrs)
}

ElementFactory.prototype.createVerDatAsElement = function (elementType, attrs) {
  var size,
    translate = this._translate

  attrs = assign({}, attrs || {})

  var businessObject = attrs.businessObject,
    di = attrs.di

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error(translate('no shape type specified'))
    }

    businessObject = this._verDatAsFactory.create(attrs.type)

    ensureCompatDiRef(businessObject)
  }

  if (!isModdleDi(di)) {
    var diAttrs = assign({}, di || {}, { id: businessObject.id + '_di' })

    if (elementType === 'root') {
      di = this._verDatAsFactory.createDiPlane(businessObject, diAttrs)
    } else if (elementType === 'connection') {
      di = this._verDatAsFactory.createDiEdge(businessObject, diAttrs)
    } else {
      di = this._verDatAsFactory.createDiShape(businessObject, diAttrs)
    }
  }

  attrs = applyAttributes(businessObject, attrs, [
    'processRef',
    'isInterrupting',
    'associationDirection',
    'isForCompensation'
  ])

  size = this.getDefaultSize(businessObject, di)

  attrs = assign(
    {
      id: businessObject.id
    },
    size,
    attrs,
    {
      businessObject: businessObject,
      di: di
    }
  )

  return this.baseCreate(elementType, attrs)
}

ElementFactory.prototype.getDefaultSize = function (element, di) {
  if (is(element, 'verDatAs:Topic')) {
    return { width: 70, height: 70 }
  }

  if (is(element, 'verDatAs:Module')) {
    return { width: 100, height: 70 }
  }

  if (is(element, 'verDatAs:Chapter')) {
    return { width: 49, height: 70 }
  }

  if (is(element, 'verDatAs:InteractiveTask')) {
    return { width: 49, height: 24.5 }
  }

  return { width: 100, height: 80 }
}

/**
 * Create participant.
 *
 * @param {boolean|Object} [attrs] attrs
 *
 * @returns {djs.model.Shape}
 */
ElementFactory.prototype.createParticipantShape = function (attrs) {
  if (!isObject(attrs)) {
    attrs = { isExpanded: attrs }
  }

  attrs = assign({ type: 'bpmn:Participant' }, attrs || {})

  // participants are expanded by default
  if (attrs.isExpanded !== false) {
    attrs.processRef = this._verDatAsFactory.create('bpmn:Process')
  }

  return this.createShape(attrs)
}

// helpers //////////////////////

/**
 * Apply attributes from a map to the given element,
 * remove attribute from the map on application.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {Array<string>} attributeNames name of attributes to apply
 *
 * @return {Object} changed attrs
 */
function applyAttributes(element, attrs, attributeNames) {
  forEach(attributeNames, function (property) {
    attrs = applyAttribute(element, attrs, property)
  })

  return attrs
}

/**
 * Apply named property to element and drain it from the attrs
 * collection.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {string} attributeName to apply
 *
 * @return {Object} changed attrs
 */
function applyAttribute(element, attrs, attributeName) {
  if (attrs[attributeName] === undefined) {
    return attrs
  }

  element[attributeName] = attrs[attributeName]

  return omit(attrs, [attributeName])
}

function isModdleDi(element) {
  return isAny(element, [
    'verDatAsDi:KnowledgeGraphRoot',
    'verDatAsDi:GraphShape',
    'verDatAsDi:GraphEdge',
    'verDatAsDi:GraphPlane',
    'verDatAsDi:GraphElement',
    'verDatAsDi:Graph'
  ])
}
