import { find, forEach } from 'min-dash'

import Refs from 'object-refs'

import { elementToString } from './Util'

var diRefs = new Refs({ name: 'graphElement', enumerable: true }, { name: 'di', configurable: true })

/**
 * Returns true if an element has the given meta-model type
 *
 * @param  {ModdleElement}  element
 * @param  {String}         type
 *
 * @return {Boolean}
 */
function is(element, type) {
  return element.$instanceOf(type)
}

/**
 * Find a suitable display candidate for definitions where the DI does not
 * correctly specify one.
 */
function findDisplayCandidate(definitions) {
  return find(definitions.rootElements, function (e) {
    return is(e, 'verDatAs:KnowledgeGraph')
  })
}

export default function VerDatAsTreeWalker(handler, translate) {
  // list of containers already walked
  var handledElements = {}

  // list of elements to handle deferred to ensure
  // prerequisites are drawn
  var deferred = []

  // Helpers //////////////////////

  function visitRoot(element, diagram) {
    return handler.root(element, diagram)
  }

  function visit(element, ctx) {
    var gfx = element.gfx

    // avoid multiple rendering of elements
    if (gfx) {
      throw new Error(translate('already rendered {element}', { element: elementToString(element) }))
    }

    // call handler
    return handler.element(element, ctx)
  }

  function visitIfDi(element, ctx) {
    try {
      var gfx = element.di && visit(element, ctx)

      handled(element)

      return gfx
    } catch (e) {
      logError(e.message, { element: element, error: e })

      console.error(translate('failed to import {element}', { element: elementToString(element) }))
      console.error(e)
    }
  }

  function logError(message, context) {
    handler.error(message, context)
  }

  function handled(element) {
    handledElements[element.id] = element
  }

  // DI handling //////////////////////

  function registerDi(di) {
    var graphElement = di.graphElement

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

  function handleGraph(diagram) {
    handlePlane(diagram.plane)
  }

  function handlePlane(plane) {
    registerDi(plane)

    forEach(plane.planeElement, handlePlaneElement)
  }

  function handlePlaneElement(planeElement) {
    registerDi(planeElement)
  }

  // Semantic handling //////////////////////

  /**
   * Handle definitions and return the rendered graph (if any)
   *
   * @param {ModdleElement} definitions to walk and import
   * @param {ModdleElement} [graphRoot] specific graph to import and display
   *
   * @throws {Error} if no diagram to display could be found
   */
  function handleDefinitions(definitions, graphRoot) {
    // make sure we walk the correct graphElement

    var graphRoots = definitions.graphRoots

    if (graphRoot && graphRoots.indexOf(graphRoot) === -1) {
      throw new Error(translate('graphRoot not part of verDatAs:Definitions'))
    }

    if (!graphRoot && graphRoots && graphRoots.length) {
      graphRoot = graphRoots[0]
    }

    // no root graph -> nothing to import
    if (!graphRoot) {
      throw new Error(translate('no graphRoot to display'))
    }

    // load DI from selected root graph only
    handleGraph(graphRoot)

    var plane = graphRoot.plane

    if (!plane) {
      throw new Error(translate('no plane for {element}', { element: elementToString(graphRoot) }))
    }

    var rootElement = plane.graphElement

    // ensure we default to a suitable display candidate (graph),
    // even if non is specified in DI
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

        // correct DI on the fly
        plane.graphElement = rootElement
        registerDi(plane)
      }
    }

    var ctx = visitRoot(rootElement, plane)

    if (is(rootElement, 'verDatAs:KnowledgeGraph')) {
      handleKnowledgeGraph(rootElement, ctx)
    }

    // handle all deferred elements
    handleDeferred(deferred)
  }

  function handleDeferred() {
    var fn

    // drain deferred until empty
    while (deferred.length) {
      fn = deferred.shift()

      fn()
    }
  }

  function handleKnowledgeGraph(graph, context) {
    handleGraphElements(graph.graphElements, context)

    // log graph handled
    handled(graph)
  }

  function handleGraphElements(graphElements, context) {
    forEach(graphElements, function (element) {
      if (is(element, 'verDatAs:SequenceFlow')) {
        deferred.push(function () {
          handleSequenceFlow(element, context)
        })
      } else {
        // TODO: Quick fix for Topic, Module, Chapter, InteractiveTask
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
          })
        }
      }
    })
  }

  function handleSequenceFlow(sequenceFlow, context) {
    visitIfDi(sequenceFlow, context)
  }

  // API //////////////////////

  return {
    handleDeferred: handleDeferred,
    handleDefinitions: handleDefinitions,
    registerDi: registerDi
  }
}
