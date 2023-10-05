import VerDatAsTreeWalker from './VerDatAsTreeWalker'

/**
 * The importPostitDiagram result.
 *
 * @typedef {Object} importPostitDiagramResult
 *
 * @property {Array<string>} warnings
 */

/**
 * The importPostitDiagram error.
 *
 * @typedef {Error} importPostitDiagramError
 *
 * @property {Array<string>} warnings
 */

/**
 * Import the definitions into a diagram.
 *
 * Errors and warnings are reported through the specified callback.
 *
 * @param  {djs.Diagram} diagram
 * @param  {ModdleElement<Definitions>} definitions
 * @param  {ModdleElement<KnowledgeGraphRoot>} [graphRoot] the diagram to be rendered
 * (if not provided, the first one will be rendered)
 *
 * Returns {Promise<importPostitDiagramResult, importPostitDiagramError>}
 */
export function importVerDatAsDiagram(diagram, definitions, graphRoot) {
  var importer, eventBus, translate

  var error,
    warnings = []

  /**
   * Walk the diagram semantically, importing (=drawing)
   * all elements you encounter.
   *
   * @param {ModdleElement<Definitions>} definitions
   * @param {ModdleElement<KnowledgeGraphRoot>} graphRoot
   */
  function render(definitions, graphRoot) {
    var visitor = {
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

    var walker = new VerDatAsTreeWalker(visitor, translate)

    // traverse xml document model,
    // starting at definitions
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
