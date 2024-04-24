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
import { getLabel } from '@/util/KnowledgeGraph/features/label-editing/LabelUtil'
import { map, filter, sortBy } from 'min-dash'

/**
 * Provides the ability to search through VerDatAs elements.
 */
export default function VerDatAsSearchProvider(elementRegistry, searchPad, canvas) {
  this._elementRegistry = elementRegistry
  this._canvas = canvas

  searchPad.registerProvider(this)
}

VerDatAsSearchProvider.$inject = ['elementRegistry', 'searchPad', 'canvas']

/**
 * Finds all elements that match a given pattern.
 *
 * @param pattern
 */
VerDatAsSearchProvider.prototype.find = function (pattern) {
  const rootElement = this._canvas.getRootElement()

  let elements = this._elementRegistry.filter(function (element) {
    if (element.labelTarget) {
      return false
    }
    return true
  })

  // Do not include the root element
  elements = filter(elements, function (element) {
    return element !== rootElement
  })

  elements = map(elements, function (element) {
    return {
      primaryTokens: matchAndSplit(getLabel(element), pattern),
      secondaryTokens: matchAndSplit(element.id, pattern),
      element: element
    }
  })

  // Exclude non-matched elements
  elements = filter(elements, function (element) {
    return hasMatched(element.primaryTokens) || hasMatched(element.secondaryTokens)
  })

  // Sort by label combined with the element ID
  elements = sortBy(elements, function (element) {
    return getLabel(element.element) + element.element.id
  })

  return elements
}

/**
 * Helper function to check for matched tokens.
 *
 * @param tokens
 */
function hasMatched(tokens) {
  const matched = filter(tokens, function (t) {
    return !!t.matched
  })

  return matched.length > 0
}

/**
 * Helper function to match and split labels.
 *
 * @param text
 * @param pattern
 */
function matchAndSplit(text, pattern) {
  const tokens = []
  const originalText = text

  if (!text) {
    return tokens
  }

  text = text.toLowerCase()
  pattern = pattern.toLowerCase()

  const i = text.indexOf(pattern)

  if (i > -1) {
    if (i !== 0) {
      tokens.push({
        normal: originalText.substr(0, i)
      })
    }

    tokens.push({
      matched: originalText.substr(i, pattern.length)
    })

    if (pattern.length + i < text.length) {
      tokens.push({
        normal: originalText.substr(pattern.length + i, text.length)
      })
    }
  } else {
    tokens.push({
      normal: originalText
    })
  }

  return tokens
}
