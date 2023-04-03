import { is } from '@/util/KnowledgeGraph/util/ModelUtil'

const prefix = 'verDatAs'
const elements = ['Topic', 'Module', 'Chapter', 'InteractiveTask']

const topicType = 'verDatAs:Topic'
const moduleType = 'verDatAs:Module'
const chapterType = 'verDatAs:Chapter'
const interactiveTaskType = 'verDatAs:InteractiveTask'

export const basicTypes = ['String', 'Integer']
export const customTypes = ['verDatAs:PriorKnowledge', 'verDatAs:ReferencedTest', 'verDatAs:ContentPage']
export const excludedParameters = ['id', 'name', 'objectId', 'modules', 'chapters']
export const excludedTypeNames = [
  'Definitions',
  'KnowledgeGraph',
  'RootElement',
  'ContentPage',
  'SequenceFlow',
  'FlowNode'
]
export const nonSelectableElements = ['verDatAs:KnowledgeGraph', 'verDatAs:SequenceFlow', 'label']
export const initialModel =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<verDatAs:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:verDatAs="http://some-company/schema/verDatAs" xmlns:verDatAsDi="http://some-company/schema/verDatAsDi" id="sample-diagram">\n' +
  '  <verDatAs:knowledgeGraph id="Graph_1">\n' +
  '    <verDatAs:topic id="Topic_1" name="Topic" />\n' +
  '  </verDatAs:knowledgeGraph>\n' +
  '  <verDatAsDi:knowledgeGraphRoot id="RootGraph_1">\n' +
  '    <verDatAsDi:graphPlane id="GraphPlane_1" graphElement="Graph_1">\n' +
  '      <verDatAsDi:graphShape id="Topic_1_di" graphElement="Topic_1">\n' +
  '        <dc:Bounds x="600" y="90" width="70" height="70" />\n' +
  '      </verDatAsDi:graphShape>\n' +
  '    </verDatAsDi:graphPlane>\n' +
  '  </verDatAsDi:knowledgeGraphRoot>\n' +
  '</verDatAs:definitions>'

/**
 * Helper function to center the diagram and take into account all panels
 * Custom zoom('fit-viewport', 'auto') function
 * Code initially retrieved from diagram.js/lib/core/Canvas.js
 */
export const centerCanvas = (canvasToCenter) => {
  // Idea: Write custom zoom('fit-viewport', 'auto') function
  // Code retrieved from diagram.js/lib/core/Canvas.js
  const vbox = canvasToCenter?.viewbox()
  if (!vbox) {
    return
  }
  const outer = vbox.outer
  const inner = vbox.inner
  let newScale = vbox.newScale
  let newViewbox = vbox.newViewbox

  // reduce canvas width available with padding
  const padding = 25

  // however, we can only reduce one of it, otherwise it will crash
  const newWidthRatio = (outer.width - 2 * padding) / inner.width
  const newHeightRatio = (outer.height - 2 * padding) / inner.height
  const smallerWidthRatio = newWidthRatio < newHeightRatio
  if (smallerWidthRatio) {
    outer.width -= 2 * padding
  } else {
    outer.height -= 2 * padding
  }

  // display the complete diagram without zooming in.
  // instead of relying on internal zoom, we perform a
  // hard reset on the canvas viewbox to realize this
  //
  // if diagram does not need to be zoomed in, we focus it around
  // the diagram origin instead

  // take the smallest scale value of these three
  newScale = Math.min(1, outer.width / inner.width, outer.height / inner.height)
  newViewbox = {
    x: inner.x + inner.width / 2 - outer.width / newScale / 2 - (smallerWidthRatio ? padding / newScale : 0),
    y: inner.y + inner.height / 2 - outer.height / newScale / 2 - (!smallerWidthRatio ? padding / newScale : 0),
    width: outer.width / newScale,
    height: outer.height / newScale
  }

  canvasToCenter?.viewbox(newViewbox)
  return canvasToCenter?.viewbox(false).scale
}

/**
 * Helper function to retrieve the elements of VerDatAs
 */
export const getVerDatAsElements = () => {
  return elements.map((element) => prefix + ':' + element)
}

/**
 * Helper function to retrieve the default size of elements of VerDatAs
 */
export const getDefaultSize = (semantic) => {
  if (is(semantic, topicType) || semantic === topicType) {
    return { width: 80, height: 90 }
  }

  if (is(semantic, moduleType) || semantic === moduleType) {
    return { width: 60, height: 70 }
  }

  if (is(semantic, chapterType) || semantic === chapterType) {
    return { width: 46, height: 41 }
  }

  if (is(semantic, interactiveTaskType) || semantic === interactiveTaskType) {
    return { width: 38, height: 40 }
  }

  return { width: 70, height: 70 }
}
