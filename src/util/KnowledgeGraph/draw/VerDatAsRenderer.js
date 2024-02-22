import inherits from 'inherits'

import { assign } from 'min-dash'

import { append as svgAppend, classes as svgClasses } from 'tiny-svg'

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'

import { getLabel } from '../features/label-editing/LabelUtil'

import { is } from '../util/ModelUtil'

import { svgCourse, svgModule, svgChapter, svgInteractiveTask, svgDocumentationTool } from '@/util/GraphHelpers'

export default function VerDatAsRenderer(eventBus, styles, textRenderer, priority) {
  BaseRenderer.call(this, eventBus, priority)

  function renderLabel(parentGfx, label, options, element) {
    options = assign(
      {
        size: {
          width: element.width
        }
      },
      options
    )

    // TODO: The label containers itself are still way to large / height. Only the visual text is reduced.
    // cut off visual representation of the label
    let maxLength = 20
    if (element.width < 40) {
      maxLength = 10
    } else if (element.width >= 40 && element.width < 50) {
      maxLength = 14
    } else if (element.width >= 50 && element.width < 60) {
      maxLength = 17
    }

    // Transform the title into a string with maxLength and ...
    const transformTitle = (title) => {
      if (title.length > maxLength) {
        const lastCharacter = title.charAt(maxLength)
        const potentialSpace = lastCharacter === ' ' || lastCharacter === ':' ? ' ' : ''
        title = title.substring(0, maxLength) + potentialSpace + '...'
      }
      return title
    }

    label = transformTitle(label)

    var text = textRenderer.createText(label || '', options)

    svgClasses(text).add('djs-label')

    svgAppend(parentGfx, text)

    return text
  }

  function renderExternalLabel(parentGfx, element) {
    var box = {
      width: element.width,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    }

    return renderLabel(
      parentGfx,
      getLabel(element),
      {
        box: box,
        fitBox: true,
        style: assign({}, textRenderer.getExternalStyle(), {
          fill: 'black'
        })
      },
      element
    )
  }

  this.handlers = {
    'verDatAs:Course': function (parentGfx) {
      const customIconSvg = document.createRange().createContextualFragment(svgCourse)
      svgAppend(parentGfx, customIconSvg)
      return customIconSvg
    },

    'verDatAs:Module': function (parentGfx) {
      const customIconSvg = document.createRange().createContextualFragment(svgModule)
      svgAppend(parentGfx, customIconSvg)
      return customIconSvg
    },

    'verDatAs:Chapter': function (parentGfx) {
      const customIconSvg = document.createRange().createContextualFragment(svgChapter)
      svgAppend(parentGfx, customIconSvg)
      return customIconSvg
    },

    'verDatAs:InteractiveTask': function (parentGfx) {
      const customIconSvg = document.createRange().createContextualFragment(svgInteractiveTask)
      svgAppend(parentGfx, customIconSvg)
      return customIconSvg
    },

    'verDatAs:DocumentationTool': function (parentGfx) {
      const customIconSvg = document.createRange().createContextualFragment(svgDocumentationTool)
      svgAppend(parentGfx, customIconSvg)
      return customIconSvg
    },

    label: function (parentGfx, element) {
      return renderExternalLabel(parentGfx, element)
    }
  }
}

inherits(VerDatAsRenderer, BaseRenderer)

VerDatAsRenderer.$inject = ['eventBus', 'styles', 'textRenderer']

VerDatAsRenderer.prototype.canRender = function (element) {
  return is(element, 'verDatAs:GraphElement')
}

VerDatAsRenderer.prototype.drawShape = function (parentGfx, element) {
  var type = element.type
  // TODO: This is a dirty workaround to properly set the dimensions of the course.
  //       For modules, chapters, interactiveTasks and documentationTools, it works without the workaround.
  if (type === 'verDatAs:Course') {
    element.width = 80
    element.height = 90
  }
  var h = this.handlers[type]

  /* jshint -W040 */
  return h(parentGfx, element)
}
