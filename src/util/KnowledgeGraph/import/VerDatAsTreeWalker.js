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
import { elementToString } from '@/util/KnowledgeGraph/import/Util'
import { find, forEach } from 'min-dash'
import Refs from 'object-refs'

const diRefs = new Refs({ name: 'graphElement', enumerable: true }, { name: 'di', configurable: true })

/**
 * Return, whether an element has the given meta-model type.
 *
 * @param element
 * @param type
 */
function is(element, type) {
  return element.$instanceOf(type)
}

/**
 * Find a suitable display candidate for definitions where the DI does not correctly specify one.
 *
 * @param definitions
 */
function findDisplayCandidate(definitions) {
  return find(definitions.rootElements, function (e) {
    return is(e, 'verDatAs:KnowledgeGraph')
  })
}

/**
 * A tree walker that iterates all elements of a graph.
 *
 * @param handler
 * @param translate
 */
export default function VerDatAsTreeWalker(handler, translate) {
  // List of containers already walked
  const handledElements = {}

  // List of elements to handle deferred to ensure prerequisites are drawn
  const deferred = []

  /**
   * Helper function to visit the root element.
   *
   * @param element
   * @param diagram
   */
  function visitRoot(element, diagram) {
    return handler.root(element, diagram)
  }

  /**
   * Helper function to visit an element.
   *
   * @param element
   * @param ctx
   */
  function visit(element, ctx) {
    const gfx = element.gfx

    // Avoid multiple rendering of elements
    if (gfx) {
      throw new Error(translate('already rendered {element}', { element: elementToString(element) }))
    }

    // Call handler
    return handler.element(element, ctx)
  }

  /**
   * Helper function to visit an element if a DI exists.
   *
   * @param element
   * @param ctx
   */
  function visitIfDi(element, ctx) {
    try {
      const gfx = element.di && visit(element, ctx)

      handled(element)

      return gfx
    } catch (e) {
      logError(e.message, { element: element, error: e })

      console.error(translate('failed to import {element}', { element: elementToString(element) }))
      console.error(e)
    }
  }

  /**
   * Log an error.
   *
   * @param message
   * @param context
   */
  function logError(message, context) {
    handler.error(message, context)
  }

  /**
   * Store an element into the handled elements.
   *
   * @param element
   */
  function handled(element) {
    handledElements[element.id] = element
  }

  /**
   * Register a DI.
   *
   * @param di
   */
  function registerDi(di) {
    const graphElement = di.graphElement

    if (graphElement) {
      if (graphElement.di) {
        logError(
          translate('multiple DI elements defined for {element}', {
            element: elementToString(graphElement)
          }),
          { element: graphElement }
        )
      } else {
        diRefs.bind(graphElement, 'di')
        graphElement.di = di
      }
    } else {
      logError(
        translate('no graphElement referenced in {element}', {
          element: elementToString(di)
        }),
        { element: di }
      )
    }
  }

  /**
   * Handle the graph of a given diagram.
   *
   * @param diagram
   */
  function handleGraph(diagram) {
    handlePlane(diagram.plane)
  }

  /**
   * Handle a given plane with its elements.
   *
   * @param plane
   */
  function handlePlane(plane) {
    registerDi(plane)

    forEach(plane.planeElement, handlePlaneElement)
  }

  /**
   * Handle a given plane element.
   *
   * @param planeElement
   */
  function handlePlaneElement(planeElement) {
    registerDi(planeElement)
  }

  /**
   * Handle given definitions and return the rendered graph (if any exist).
   *
   * @param definitions
   * @param graphRoot
   */
  function handleDefinitions(definitions, graphRoot) {
    // Make sure that the correct graphElement is walked
    const graphRoots = definitions.graphRoots

    if (graphRoot && graphRoots.indexOf(graphRoot) === -1) {
      throw new Error(translate('graphRoot not part of verDatAs:Definitions'))
    }

    if (!graphRoot && graphRoots && graphRoots.length) {
      graphRoot = graphRoots[0]
    }

    // No root graph -> nothing to import
    if (!graphRoot) {
      throw new Error(translate('no graphRoot to display'))
    }

    // Load DI from the selected root graph only
    handleGraph(graphRoot)

    const plane = graphRoot.plane

    if (!plane) {
      throw new Error(translate('no plane for {element}', { element: elementToString(graphRoot) }))
    }

    let rootElement = plane.graphElement

    // Ensure we default to a suitable display candidate (graph), even if non is specified in DI
    if (!rootElement) {
      rootElement = findDisplayCandidate(definitions)

      if (!rootElement) {
        throw new Error(translate('no graph to display'))
      } else {
        logError(
          translate('correcting missing graphElement on {plane} to {rootElement}', {
            plane: elementToString(plane),
            rootElement: elementToString(rootElement)
          })
        )

        // Correct DI on the fly
        plane.graphElement = rootElement
        registerDi(plane)
      }
    }

    const ctx = visitRoot(rootElement, plane)

    if (is(rootElement, 'verDatAs:KnowledgeGraph')) {
      handleKnowledgeGraph(rootElement, ctx)
    }

    // Handle all deferred elements
    handleDeferred(deferred)
  }

  /**
   * Handle deferred elements.
   */
  function handleDeferred() {
    let fn

    // Drain deferred until empty
    while (deferred.length) {
      fn = deferred.shift()

      fn()
    }
  }

  /**
   * Handle the knowledge graph.
   *
   * @param graph
   * @param context
   */
  function handleKnowledgeGraph(graph, context) {
    handleGraphElements(graph.graphElements, context)

    // Log graph handled
    handled(graph)
  }

  /**
   * Handle a list of provided graph elements.
   *
   * @param graphElements
   * @param context
   */
  function handleGraphElements(graphElements, context) {
    forEach(graphElements, function (element) {
      if (is(element, 'verDatAs:SequenceFlow')) {
        deferred.push(function () {
          handleSequenceFlow(element, context)
        })
      } else {
        // TODO: Workaround for Course, Module, Chapter, InteractiveTask, DocumentationTool
        visitIfDi(element, context)
        if (element.modules) {
          handleGraphElements(element.modules, context)
        }
        if (element.chapters) {
          handleGraphElements(element.chapters, context)
        }
        if (element.contentPages) {
          element.contentPages?.forEach((page) => {
            if (page.interactiveTasks) {
              handleGraphElements(page.interactiveTasks, context)
            }
            if (page.documentationTools) {
              handleGraphElements(page.documentationTools, context)
            }
          })
        }
      }
    })
  }

  /**
   * Handle a given sequence flow.
   *
   * @param sequenceFlow
   * @param context
   */
  function handleSequenceFlow(sequenceFlow, context) {
    visitIfDi(sequenceFlow, context)
  }

  // API specific stuff

  return {
    handleDeferred: handleDeferred,
    handleDefinitions: handleDefinitions,
    registerDi: registerDi
  }
}
