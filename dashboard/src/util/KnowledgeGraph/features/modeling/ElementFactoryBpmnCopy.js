import { assign, forEach, isObject } from 'min-dash'

import inherits from 'inherits'

import { is } from '../../util/ModelUtil'

import BaseElementFactory from 'diagram-js/lib/core/ElementFactory'

import { DEFAULT_LABEL_SIZE } from '../../util/LabelUtil'

import { getDefaultSize } from '@/util/GraphHelpers'

/**
 * A VerDatAs-aware factory for diagram-js shapes
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
    return this.baseCreate(elementType, assign({ type: 'label' }, DEFAULT_LABEL_SIZE, attrs))
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

  attrs = attrs || {}

  var businessObject = attrs.businessObject

  if (!businessObject) {
    if (!attrs.type) {
      throw new Error(translate('no shape type specified'))
    }

    businessObject = this._verDatAsFactory.create(attrs.type)
  }

  size = this._getDefaultSize(businessObject)

  if (!businessObject.di) {
    if (elementType === 'root') {
      businessObject.di = this._verDatAsFactory.createDiPlane(businessObject, {
        id: businessObject.id + '_di'
      })
    } else if (elementType === 'connection') {
      businessObject.di = this._verDatAsFactory.createDiEdge(businessObject, {
        id: businessObject.id + '_di'
      })
    } else {
      // TODO: This is currently necessary to define the bounds
      // Why are the bounds not set automatically?
      businessObject.di = this._verDatAsFactory.createDiShape(businessObject, {
        id: businessObject.id + '_di',
        x: attrs.x,
        y: attrs.y,
        width: size.width,
        height: size.height
      })
    }
  }

  if (attrs.di) {
    assign(businessObject.di, attrs.di)

    delete attrs.di
  }

  applyAttributes(businessObject, attrs, ['processRef', 'isInterrupting', 'associationDirection', 'isForCompensation'])

  if (attrs.isExpanded) {
    applyAttribute(businessObject.di, attrs, 'isExpanded')
  }

  if (is(businessObject, 'bpmn:ExclusiveGateway')) {
    businessObject.di.isMarkerVisible = true
  }

  var eventDefinitions, newEventDefinition

  if (attrs.eventDefinitionType) {
    eventDefinitions = businessObject.get('eventDefinitions') || []
    newEventDefinition = this._verDatAsFactory.create(attrs.eventDefinitionType)

    if (attrs.eventDefinitionType === 'bpmn:ConditionalEventDefinition') {
      newEventDefinition.condition = this._verDatAsFactory.create('bpmn:FormalExpression')
    }

    eventDefinitions.push(newEventDefinition)

    newEventDefinition.$parent = businessObject
    businessObject.eventDefinitions = eventDefinitions

    delete attrs.eventDefinitionType
  }

  attrs = assign(
    {
      businessObject: businessObject,
      id: businessObject.id
    },
    size,
    attrs
  )

  return this.baseCreate(elementType, attrs)
}

ElementFactory.prototype._getDefaultSize = function (semantic) {
  return getDefaultSize(semantic)
}

// helpers //////////////////////

/**
 * Apply attributes from a map to the given element,
 * remove attribute from the map on application.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {Array<String>} attributeNames name of attributes to apply
 */
function applyAttributes(element, attrs, attributeNames) {
  forEach(attributeNames, function (property) {
    if (attrs[property] !== undefined) {
      applyAttribute(element, attrs, property)
    }
  })
}

/**
 * Apply named property to element and drain it from the attrs
 * collection.
 *
 * @param {Base} element
 * @param {Object} attrs (in/out map of attributes)
 * @param {String} attributeName to apply
 */
function applyAttribute(element, attrs, attributeName) {
  element[attributeName] = attrs[attributeName]

  delete attrs[attributeName]
}
