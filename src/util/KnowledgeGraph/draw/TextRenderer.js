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
import TextUtil from 'diagram-js/lib/util/Text'
import { assign } from 'min-dash'

export default function TextRenderer(config) {
  // Define general styles and instances
  const defaultStyle = assign(
    {
      fontFamily: '"Open Sans", Verdana, Arial, Helvetica, sans-serif',
      fontSize: 10,
      fontWeight: 'normal',
      lineHeight: 1.1
    },
    (config && config.defaultStyle) || {}
  )

  const fontSize = parseInt(defaultStyle.fontSize, 10)

  const externalStyle = assign(
    {},
    defaultStyle,
    {
      fontSize: fontSize
    },
    (config && config.externalStyle) || {}
  )

  const textUtil = new TextUtil({
    style: defaultStyle
  })

  /**
   * Retrieve the new bounds of an externally rendered and layouted label.
   *
   * @param bounds
   * @param text
   * @param element
   */
  this.getExternalLabelBounds = function (bounds, text, element) {
    const boxWidth = element && element.width ? element.width : 50
    // Define a minor overflow for elements that is accepted by the system
    const overflow = 2
    const layoutedDimensions = textUtil.getDimensions(text, {
      box: {
        width: boxWidth + overflow,
        height: 30,
        x: bounds.width / 2 + bounds.x - overflow / 2,
        y: bounds.height / 2 + bounds.y
      },
      style: externalStyle
    })

    return {
      x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
      y: Math.round(bounds.y),
      width: Math.ceil(layoutedDimensions.width),
      height: Math.ceil(layoutedDimensions.height)
    }
  }

  /**
   * Retrieve the new bounds of a text annotation.
   *
   * @param bounds
   * @param text
   */
  this.getTextAnnotationBounds = function (bounds, text) {
    const layoutedDimensions = textUtil.getDimensions(text, {
      box: bounds,
      style: defaultStyle,
      align: 'left-top',
      padding: 5
    })

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      // 30 = min text annotation height
      height: Math.max(30, Math.round(layoutedDimensions.height))
    }
  }

  /**
   * Create a layouted text element.
   *
   * @param  text
   * @param options
   */
  this.createText = function (text, options) {
    return textUtil.createText(text, options || {})
  }

  /**
   * Retrieve the default text style.
   */
  this.getDefaultStyle = function () {
    return defaultStyle
  }

  /**
   * Retrieve the external text style.
   */
  this.getExternalStyle = function () {
    return externalStyle
  }
}

TextRenderer.$inject = ['config.textRenderer']
