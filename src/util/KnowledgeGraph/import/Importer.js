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
import VerDatAsTreeWalker from '@/util/KnowledgeGraph/import/VerDatAsTreeWalker'

/**
 * Import the definitions into a diagram.
 *
 * @param diagram
 * @param definitions
 * @param graphRoot
 */
export function importVerDatAsDiagram(diagram, definitions, graphRoot) {
  let importer
  let eventBus
  let translate

  let error
  const warnings = []

  /**
   * Walk the diagram semantically, importing (= drawing) all elements that are encountered.
   *
   * @param definitions
   * @param graphRoot
   */
  function render(definitions, graphRoot) {
    const visitor = {
      root: function (element) {
        return importer.add(element)
      },

      element: function (element, parentShape) {
        return importer.add(element, parentShape)
      },

      error: function (message, context) {
        warnings.push({ message: message, context: context })
      }
    }

    const walker = new VerDatAsTreeWalker(visitor, translate)

    // Traverse the XML document model, starting at the definitions
    walker.handleDefinitions(definitions, graphRoot)
  }

  return new Promise(function (resolve, reject) {
    try {
      importer = diagram.get('verDatAsImporter')
      eventBus = diagram.get('eventBus')
      translate = diagram.get('translate')

      eventBus.fire('import.render.start', { definitions: definitions })

      render(definitions, graphRoot)

      eventBus.fire('import.render.complete', {
        error: error,
        warnings: warnings
      })

      return resolve({ warnings: warnings })
    } catch (e) {
      return reject(e)
    }
  })
}
