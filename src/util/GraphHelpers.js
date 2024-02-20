import { is } from '@/util/KnowledgeGraph/util/ModelUtil'

const prefix = 'verDatAs'
const elements = [
  'Course',
  'Module',
  'Chapter',
  'InteractiveTask',
  'DocumentationTool'
]

const courseType = 'verDatAs:Course'
const moduleType = 'verDatAs:Module'
const chapterType = 'verDatAs:Chapter'
const interactiveTaskType = 'verDatAs:InteractiveTask'
const documentationToolType = 'verDatAs:DocumentationTool'

export const basicTypes = [
  'String',
  'Integer',
  'Boolean'
]
export const customTypes = [
  'verDatAs:PriorKnowledge',
  'verDatAs:ContentPage'
]
export const questionTypes = [
  'ILIAS_INTERACTIVE_TASK'
]
const documentationToolTypes = [
  'ILIAS_DOCUMENTATION_TOOL'
]
export const excludedParameters = [
  'id',
  'name',
  'objectId',
  'modules',
  'chapters'
]
export const excludedTypeNames = [
  'Definitions',
  'KnowledgeGraph',
  'RootElement',
  'ContentPage',
  'SequenceFlow',
  'FlowNode'
]
const excludedVerbs = [
  'http://adlnet.gov/expapi/verbs/attempted'
]
export const nonSelectableElements = [
  'verDatAs:KnowledgeGraph',
  'verDatAs:SequenceFlow',
  'label'
]
const supportedObjectAttributeKeys = [
  'title',
  'name'
]
const supportedAttributeKeys = [
  'content',
  'description',
  'isEntryTest',
  'isFinalTest',
  'lecturerDashboardLink',
  'offline',
  'processingTime'
]
const nestedChildrenKeys = [
  'modules',
  'chapters',
  'contentPages',
  'interactiveTasks',
  'documentationTools'
]
export const urlAttributeKeys = [
  'lecturerDashboardLink'
]
const childKeyToLcoType = {
  'verDatAs:Course': 'ILIAS_COURSE',
  'verDatAs:Module': 'ILIAS_MODULE',
  'verDatAs:Chapter': 'ILIAS_CHAPTER',
  'verDatAs:ContentPage': 'ILIAS_CONTENT_PAGE',
  'verDatAs:InteractiveTask': 'ILIAS_INTERACTIVE_TASK',
  'verDatAs:DocumentationTool': 'ILIAS_DOCUMENTATION_TOOL'
}
const attributeObject = (key, value) => {
  return { key, value }
}
export const iterateAttributes = (currentBusinessObject, iterationDepth) => {
  const genericObject = {}
  if (!iterationDepth) {
    if (currentBusinessObject.lcoId) {
      genericObject.lcoId = currentBusinessObject.lcoId
    }
    iterationDepth = 1
  } else {
    iterationDepth += 1
  }
  const lcoType = childKeyToLcoType[currentBusinessObject['$type']] ?? 'UNKNOWN'
  genericObject.lcoType = lcoType
  const objectId = currentBusinessObject.objectId ?? ''
  if (objectId !== '') {
    genericObject.objectId = objectId
  }
  const attributes = []
  console.log('attributes of ' + lcoType, Object.keys(currentBusinessObject))
  Object.keys(currentBusinessObject)?.forEach((attrKey) => {
    console.log('iterate ' + lcoType + ' -> ' + attrKey)
    if (supportedAttributeKeys.concat(supportedObjectAttributeKeys).includes(attrKey)) {
      // the title attribute was used as name in the diagram
      const keyToPush = attrKey === 'name' ? 'title' : attrKey
      attributes.push(attributeObject(keyToPush, currentBusinessObject[attrKey]))
    } else if (nestedChildrenKeys.includes(attrKey)) {
      const attrObjects = []
      // the children objects of a businessObject are automatically businessObjects again
      currentBusinessObject[attrKey]?.forEach((childObject) => {
        attrObjects.push(iterateAttributes(childObject, iterationDepth))
      })
      attributes.push(attributeObject(attrKey, attrObjects))
    }
  })
  // all drawn modules are not offline -> thus, set offline false
  if (lcoType === 'ILIAS_MODULE') {
    attributes.push(attributeObject('offline', false))
  }
  genericObject.attributes = attributes
  return genericObject
}
export const attributeValue = (assistanceObject, key) => {
  // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
  return assistanceObject.attributes?.find((param) => param.key === key)?.value;
}
export const extendAttributes = (existingAttributes, objectToAdd) => {
  supportedAttributeKeys.forEach((attr) => {
    if (attributeValue(objectToAdd, attr)) {
      existingAttributes[attr] = attributeValue(objectToAdd, attr)
    }
  })
  return existingAttributes
}
const progressForObjectId = (studentProgress, objectId) => {
  const subLco = studentProgress.sub_lco_progress?.find((item) => item.key === objectId)
  return subLco?.value || []
}
const processExperiences = (studentModel, filteredExperiences, currentLco) => {
  const lcoType = currentLco.lcoType
  let experienceStatus = 'in-progress'
  // interactive tasks -> attempted, completed, answered
  if (questionTypes.includes(lcoType)) {
    // console.log('question', filteredExperiences)
    // if a completed exists, all answered statements behind it have not to be taken into account
    const lastCompleted = filteredExperiences.findLast(exp => exp.verbId === 'http://adlnet.gov/expapi/verbs/completed')
    if (lastCompleted?.result?.score?.scaled !== undefined) {
      experienceStatus = lastCompleted.result.score.scaled === 1 ? 'passed' : 'failed'
    } else {
      // if no completed exists, check for answered and the object ID
      const lastAnswered = filteredExperiences.findLast(exp => exp.verbId === 'http://adlnet.gov/expapi/verbs/answered')
      if (lastAnswered && !lastAnswered.objectId?.includes('h5p-subContentId') && lastAnswered?.result?.score?.scaled !== undefined) {
        experienceStatus = lastAnswered.result.score.scaled === 1 ? 'passed' : 'failed'
      }
    }
    // if the experiences do not only include "interacted"-statements, set an entry for the studentModel
    if (filteredExperiences.filter(exp => exp.verbId !== 'http://adlnet.gov/expapi/verbs/interacted')?.length > 0) {
      studentModel[currentLco.objectId] = {
        experiences: filteredExperiences,
        status: experienceStatus
      }
    }
  }
  // for other types (contentPage, documentationTool), record the in-progress state (even for "interacted"-statements)
  else {
    studentModel[currentLco.objectId] = {
      experiences: filteredExperiences,
      status: experienceStatus
    }
  }
  return studentModel
}
export const iterateAndFillStudentModel = (currentLco, studentProgress, studentModel, progressValue) => {
  let hasChildren = false
  if (currentLco.attributes) {
    currentLco.attributes?.forEach((attr) => {
      if (nestedChildrenKeys.includes(attr.key)) {
        // even though ILIAS_CONTENT_PAGE has interactiveTasks and documentationTools as children, the function should not apply for those
        hasChildren = !['interactiveTasks', 'documentationTools'].includes(attr.key)
        attributeValue(currentLco, attr.key)?.forEach((childLco) => {
          // Hint: It should not be necessary to overwrite the studentModel here. However, it feels more transparent.
          studentModel = iterateAndFillStudentModel(childLco, studentProgress, studentModel, true)
          // if at least one child has no status set, the parent cannot have a status, too
          if (!studentModel[childLco.objectId]?.status) {
            progressValue = false
          }
        })
      }
    })
  }
  if (currentLco.objectId && progressForObjectId(studentProgress, currentLco.objectId)?.length > 0) {
    const experiences = progressForObjectId(studentProgress, currentLco.objectId)
    const filteredExperiences = experiences.filter(exp => !excludedVerbs.includes(exp.verbId))
    // if at least one child has no status set, the parent cannot have a status, too
    if (filteredExperiences.length > 0 && progressValue) {
      // Hint: It should not be necessary to overwrite the studentModel here. However, it feels more transparent.
      studentModel = processExperiences(studentModel, experiences, currentLco)
    }
  }
  // otherwise, the status of the children decides on the progress value
  else if (hasChildren && progressValue) {
    studentModel[currentLco.objectId] = {
      status: 'in-progress'
    }
  }
  return studentModel
}
export const initialModel = (courseId, courseTitle) =>
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<verDatAs:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:verDatAs="http://verdatas.de/schema/verDatAs" xmlns:verDatAsDi="http://verdatas.de/schema/verDatAsDi" id="verdatas-diagram">\n' +
  '  <verDatAs:knowledgeGraph id="Graph_' +
  courseId +
  '">\n' +
  '    <verDatAs:course id="Course_1" name="' +
  courseTitle +
  '" />\n' +
  '  </verDatAs:knowledgeGraph>\n' +
  '  <verDatAsDi:knowledgeGraphRoot id="RootGraph_1">\n' +
  '    <verDatAsDi:graphPlane id="GraphPlane_1" graphElement="Graph_' +
  courseId +
  '">\n' +
  '      <verDatAsDi:graphShape id="Course_1_di" graphElement="Course_1">\n' +
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
  if (is(semantic, courseType) || semantic === courseType) {
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

  if (is(semantic, documentationToolType) || semantic === documentationToolType) {
    return { width: 38, height: 40 }
  }

  return { width: 70, height: 70 }
}
