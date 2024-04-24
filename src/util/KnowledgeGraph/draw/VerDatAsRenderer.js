/**
 * This is a modified version of the original file from https://github.com/pinussilvestrus/postit-js (MIT).
 *
 * Copyright 2020 Niklas Kiefer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * -----
 *
 * Adjustments for Dashboard of the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)
 *
 * In addition to the terms of the MIT license, this file is distributed under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { svgCourse, svgModule, svgChapter, svgInteractiveTask, svgDocumentationTool } from '@/util/GraphHelpers'
import { getLabel } from '@/util/KnowledgeGraph/features/label-editing/LabelUtil'
import { is } from '@/util/KnowledgeGraph/util/ModelUtil'
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import inherits from 'inherits'
import { assign } from 'min-dash'
import { append as svgAppend, classes as svgClasses } from 'tiny-svg'

export default function VerDatAsRenderer(eventBus, styles, textRenderer, priority) {
  BaseRenderer.call(this, eventBus, priority)

  /**
   * Handle the rendering of a label.
   *
   * @param parentGfx
   * @param label
   * @param options
   * @param element
   */
  function renderLabel(parentGfx, label, options, element) {
    options = assign(
      {
        size: {
          width: element.width
        }
      },
      options
    )

    // TODO: The label containers itself are still way to large / high. Currently, only the visual text is reduced.
    // Cut off the visual representation of the label depending on the width of the element
    let maxLength = 20
    if (element.width < 40) {
      maxLength = 14
    } else if (element.width >= 40 && element.width < 50) {
      maxLength = 18
    } else if (element.width >= 50 && element.width < 60) {
      maxLength = 24
    }

    // Transform the title into a string with the specified maxLength and leading points
    const transformTitle = (title) => {
      // Check, if the title is too long and exceeds the width with the acceptable offset
      // "+ 1" is necessary to avoid trailing points after maxLength
      if (title.length > maxLength + 1) {
        const listOfNonWantedCharacters = [':', '-', '_', '/', '.']
        const whitespace = ' '
        const trailingPoints = '…'
        // There should be at least two successive characters or a whitespace at the end
        for (let i = maxLength; i >= 1; i--) {
          const lastCharacter = title.charAt(i)
          const secondLastCharacter = title.charAt(i - 1)
          if (lastCharacter === whitespace) {
            return title.substring(0, i + 1) + trailingPoints
          } else if (
            !listOfNonWantedCharacters.includes(lastCharacter) &&
            !listOfNonWantedCharacters.includes(secondLastCharacter)
          ) {
            return title.substring(0, i + 1) + trailingPoints
          }
        }
        // Is this is not possible at all, do a normal return by only considering the last character
        const lastCharacter = title.charAt(maxLength)
        const potentialSpace = lastCharacter === ' ' || lastCharacter === ':' ? ' ' : ''
        return title.substring(0, maxLength + 1) + potentialSpace + trailingPoints
      }
      // Otherwise, return the full title
      return title
    }

    label = transformTitle(label)

    // Dirty workaround for simulating a background of SVG elements
    const textBackground = textRenderer.createText(label || '', options)
    svgClasses(textBackground).add('stroke-background')
    svgAppend(parentGfx, textBackground)

    // This is used to create the normal text
    const text = textRenderer.createText(label || '', options)
    svgClasses(text).add('djs-label')
    svgAppend(parentGfx, text)

    return text
  }

  /**
   * Handle the rendering of an external label.
   *
   * @param parentGfx
   * @param element
   */
  function renderExternalLabel(parentGfx, element) {
    const box = {
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

  /**
   * Define handlers for specific VerDatAs elements.
   */
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

/**
 * Check, whether a given element can be rendered.
 *
 * @param element
 */
VerDatAsRenderer.prototype.canRender = function (element) {
  return is(element, 'verDatAs:GraphElement')
}

/**
 * Draw the shape of a given element.
 *
 * @param parentGfx
 * @param element
 */
VerDatAsRenderer.prototype.drawShape = function (parentGfx, element) {
  const type = element.type
  // TODO: This is a dirty workaround to properly set the dimensions of the course.
  // For the remaining types, this workaround is not necessary.
  if (type === 'verDatAs:Course') {
    element.width = 80
    element.height = 90
  }
  const h = this.handlers[type]

  /* jshint -W040 */
  return h(parentGfx, element)
}
