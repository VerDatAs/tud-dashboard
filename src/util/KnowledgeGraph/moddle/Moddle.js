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
import { isString, assign } from 'min-dash'
import { Moddle } from 'moddle'
import { Reader, Writer } from 'moddle-xml'

/**
 * A sub-class of Moddle to support both importing and exporting VerDatAs XML files.
 *
 * @param packages
 * @param options
 */
export default function VerDatAsModdle(packages, options) {
  Moddle.call(this, packages, options)
}

VerDatAsModdle.prototype = Object.create(Moddle.prototype)

/**
 * Instantiate a VerDatAs model tree from a given XML string.
 *
 * @param xmlStr
 * @param typeName
 * @param options
 */
VerDatAsModdle.prototype.fromXML = function (xmlStr, typeName, options) {
  if (!isString(typeName)) {
    options = typeName
    typeName = 'verDatAs:Definitions'
  }

  const reader = new Reader(assign({ model: this, lax: true }, options))
  const rootHandler = reader.handler(typeName)

  return reader.fromXML(xmlStr, rootHandler)
}

/**
 * Serialize a VerDatAs object tree into XML.
 *
 * @param element
 * @param options
 */
VerDatAsModdle.prototype.toXML = function (element, options) {
  const writer = new Writer(options)

  return new Promise(function (resolve, reject) {
    try {
      const result = writer.toXML(element)

      return resolve({
        xml: result
      })
    } catch (err) {
      return reject(err)
    }
  })
}
