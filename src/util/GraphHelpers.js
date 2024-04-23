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
 * Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Tommy Kubica)
 *
 * In addition to the terms of the MIT license, this file is distributed under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { is } from '@/util/KnowledgeGraph/util/ModelUtil'

const courseType = 'verDatAs:Course'
const moduleType = 'verDatAs:Module'
const chapterType = 'verDatAs:Chapter'
const interactiveTaskType = 'verDatAs:InteractiveTask'
const documentationToolType = 'verDatAs:DocumentationTool'

// Define the SVG representations of the knowledge structure elements
export const svgCourse =
  '<svg version="1.1" width="80" height="90" viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg"><path d="m70.314 47.105h-60.632v-37.053h60.632zm-39.747 5.0526h18.863c0.03368 0.06737 0.03368 0.13474 0.06737 0.2021l5.3221 11.587h-29.642l5.3221-11.587c0.03368-0.06737 0.06737-0.13474 0.06737-0.2021m44.8-3.3684v-40.421c-2e-6 -1.8526-1.5158-3.3684-3.3684-3.3684h-64c-1.8526 0-3.3684 1.5158-3.3684 3.3684v40.421c0 1.8526 1.5158 3.3684 3.3684 3.3684h17.044l-13.44 29.272c-0.57263 1.28-0.03369 2.7621 1.2463 3.3347 0.33684 0.16842 0.70737 0.23579 1.0442 0.23579 0.94316 0 1.8863-0.53895 2.2905-1.4821l5.8947-12.834h35.806l5.8947 12.834c0.43789 0.94316 1.3474 1.4821 2.2905 1.4821 0.33684 0 0.70737-0.06737 1.0442-0.23579 1.28-0.57263 1.8189-2.0884 1.2463-3.3347l-13.406-29.272h17.044c1.8526 0 3.3684-1.5158 3.3684-3.3684" stroke-width=".33684"/><path class="icon-bg" d="m9.6376 10.037v37.003c1.6485 0.23311 3.4761 0.03365 5.1936 0.10007h55.43c0.23311-1.6485 0.03365-3.4761 0.10007-5.1936v-31.91c-1.6485-0.23311-3.4761-0.03365-5.1936-0.10007h-55.43z" fill="#fff" stroke-width=".14981"/></svg>'
export const svgModule =
  '<svg version="1.1" width="60" height="70" viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg"><path d="m41.958 29.335h-19.664v3.6871h19.664zm0-6.4892h-19.664v3.6871h19.664zm7.3741 38.444-32.766 0.02458c-2.5072-0.02458-4.744-2.3106-5.2848-3.5887-0.36871-0.83573-0.58993-4.1049-0.58993-6.6367v-38.911c0.34412 0.39329 0.68825 0.78657 1.0324 1.1307 2.0402 2.0402 4.0312 2.0402 5.3339 2.0402h0.54077l31.684-0.02458zm3.6871 1.8189-0.073741-49.652c0-1.0078-0.83573-1.8435-1.8435-1.8435l-33.503 0.04916h-0.54077c-1.1061 0-1.7944 0-2.753-0.95863-0.54077-0.54077-1.1553-1.2782-1.7206-2.0156h32.864c1.0078 0 1.8435-0.83573 1.8435-1.8435 0-1.0078-0.83573-1.8435-1.8435-1.8435h-36.477c-0.44245 0-0.86031 0.17206-1.2044 0.44245-0.46703 0.34412-0.78657 0.88489-0.78657 1.4994v44.122c0 1.4257 0.073741 6.1697 0.88489 8.1115 1.0078 2.3351 4.449 5.801 8.6769 5.8255l34.634-0.02458c0.49161 0 0.95864-0.19664 1.3028-0.54077 0.3687-0.3687 0.54077-0.83573 0.54077-1.3273" stroke-width=".2458"/><path d="m10.618 12.149c-0.05061 2.1706-0.0071 4.3572-0.02161 6.534 0.01372 10.807-0.03278 21.614 0.04136 32.42 0.04213 2.0813 0.02344 4.1885 0.45263 6.2348 0.3457 1.2372 1.3264 2.1846 2.337 2.9184 0.97285 0.67177 2.1238 1.1806 3.3307 1.0985 7.9527 0.06942 15.906 0.03701 23.859 0.0306 2.8906-0.0025 5.7811-0.02561 8.6715-0.06326 0.2291-0.22658 0.03441-0.68482 0.09878-0.99882v-44.983c-0.22454-0.2313-0.6851-0.03519-0.99882-0.09998-10.767-0.01359-21.534 0.03224-32.3-0.04272-1.8402 0.04214-3.5147-1.0634-4.7235-2.3841-0.23681-0.21939-0.40523-0.52566-0.67078-0.70217l-0.05365 0.0267zm21.501 10.782h9.7576v3.5154h-19.515v-3.5154h9.7576zm0 6.4718h9.7576v3.5154h-19.515v-3.5154h9.7576z" class="icon-bg" fill="#fff" stroke-width=".059924"/></svg>'
export const svgChapter =
  '<svg version="1.1" width="46" height="41" viewBox="0 0 46 41" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(.175 0 0 .175 -5 -7.5)"><path d="m265 245h-210v-170h50l6.7 20h153.3zm15 5v-160c0-5.5-4.5-10-10-10h-143.3l-6.7-20h-80v190c0 5.5 4.5 10 10 10h220c5.5 0 10-4.5 10-10"/></g><path class="icon-bg" d="m4.5244 5.5853c-0.0479 7.6576-0.00684 15.33-0.020529 22.993 0.025511 2.2815-0.051043 4.5867 0.038313 6.8534 6.6282 0.05124 13.275 0.0073 19.91 0.02197h16.895c0.23926-0.38465 0.029-1.0153 0.09993-1.4898v-24.843c-0.38465-0.23926-1.0153-0.029003-1.4898-0.099928h-25.365c-0.37848-1.1354-0.75692-2.2708-1.1353-3.4062-0.76882-0.16082-1.6344-0.021864-2.4402-0.068372h-6.4135l-0.077959 0.038313z" fill="#fff" stroke-width=".086864"/></svg>'
export const svgInteractiveTask =
  '<svg version="1.1" width="38" height="40" viewBox="0 0 38 40" xmlns="http://www.w3.org/2000/svg"><path d="m4.8333 2.8333h28.333v21.25h-9.9167v9.9167h-18.417zm-2.8333-2.8333v36.833h24.083l9.9167-9.9167v-26.917z" stroke-width=".14167"/><path d="m23.254 14.649c0-2.587-2.4829-3.6114-4.7747-3.6114-1.4237 0-2.5002 0.26044-3.733 0.62506l0.1389 2.2571c0.93759-0.34725 1.962-0.60769 2.969-0.60769 1.1112 0 2.2918 0.50352 2.2918 1.7536 0 2.4655-3.1774 2.4655-3.1774 6.2506v0.2778h2.5697v-0.32989c0-3.0558 3.7156-3.351 3.7156-6.6152m-3.542 8.5251h-2.917v2.6217h2.917z" stroke-width=".17363"/><path class="icon-bg" d="m4.763 2.8022v31.241c0.63753 0.19177 1.4248 0.02022 2.1185 0.07545 5.4493-0.01456 10.899-0.02926 16.348-0.044 0.19484-0.63724 0.03096-1.4244 0.09104-2.118 0.01326-2.6089 0.02637-5.2178 0.03951-7.8266h9.8139c0.19297-0.63735 0.02396-1.4247 0.08091-2.1184v-19.21c-0.63734-0.19297-1.4247-0.02396-2.1184-0.080914h-26.293l-0.068604 0.068604zm13.651 8.3332c1.7372 3e-3 3.8161 0.59563 4.5368 2.3564 0.53535 1.3065 0.05613 2.8502-0.97288 3.7895-0.93419 1.1246-2.3845 2.0728-2.4962 3.6647 0.14572 0.75864-0.50584 0.61216-1.044 0.59698-0.41892-0.13946-1.4388 0.31985-1.3845-0.29106-0.0085-1.2718 0.53522-2.5039 1.465-3.3785 0.79216-0.85081 1.9119-1.8083 1.6549-3.1133-0.19686-1.2607-1.7044-1.612-2.7855-1.5062-0.82312 0.02498-1.6707 0.38732-2.4277 0.49017-0.06727-0.67351-0.08853-1.3471-0.12961-2.0224 1.1657-0.34614 2.3641-0.59757 3.5835-0.5861zm-0.18154 12.122c0.44011 0.14737 1.5352-0.36016 1.3744 0.38808v2.0696h-2.7488v-2.4577h1.3744z" fill="#fff" stroke-width=".097022"/></svg>'
export const svgDocumentationTool =
  '<svg version="1.1" width="38" height="40" viewBox="0 0 38 40" xmlns="http://www.w3.org/2000/svg"><path d="m4.8333 2.8333h28.333v21.25h-9.9167v9.9167h-18.417zm-2.8333-2.8333v36.833h24.083l9.9167-9.9167v-26.917z" stroke-width=".14167"/><path class="icon-bg" d="m4.763 2.8022v31.241c0.63753 0.19177 1.4248 0.02022 2.1185 0.07545 5.4493-0.01456 10.899-0.02926 16.348-0.044 0.19484-0.63724 0.03096-1.4244 0.09104-2.118 0.01326-2.6089 0.02637-5.2178 0.03951-7.8266h9.8139c0.19297-0.63735 0.02396-1.4247 0.08091-2.1184v-19.21c-0.63734-0.19297-1.4247-0.02396-2.1184-0.080914h-26.293l-0.068604 0.068604z" fill="#fff" stroke-width=".097022"/><path d="m13.555 23.577h1.1083l7.6028-7.6028-1.1083-1.1083-7.6028 7.6028zm-1.5556 1.5556v-3.3056l10.267-10.247q0.23333-0.21389 0.51528-0.33056 0.28194-0.11667 0.59306-0.11667t0.60278 0.11667q0.29167 0.11667 0.50556 0.35l1.0694 1.0889q0.23333 0.21389 0.34028 0.50556 0.10694 0.29167 0.10694 0.58333 0 0.31111-0.10694 0.59306-0.10694 0.28194-0.34028 0.51528l-10.247 10.247zm12.444-11.356-1.0889-1.0889zm-2.7417 1.6528-0.54444-0.56389 1.1083 1.1083z" stroke-width=".019444"/></svg>'

// Define different types and parameters
export const basicTypes = ['String', 'Integer', 'Boolean']
export const customTypes = ['verDatAs:PriorKnowledge', 'verDatAs:ContentPage']
export const questionTypes = ['ILIAS_INTERACTIVE_TASK']
export const excludedParameters = ['id', 'name', 'objectId', 'modules', 'chapters']
export const excludedTypeNames = [
  'Definitions',
  'KnowledgeGraph',
  'RootElement',
  'ContentPage',
  'SequenceFlow',
  'FlowNode'
]
const excludedVerbs = ['http://adlnet.gov/expapi/verbs/attempted']
export const nonSelectableElements = ['verDatAs:KnowledgeGraph', 'verDatAs:SequenceFlow', 'label']
const supportedObjectAttributeKeys = ['title', 'name']
const supportedAttributeKeys = [
  'content',
  'description',
  'isEntryTest',
  'isFinalTest',
  'lecturerDashboardLink',
  'offline',
  'processingTime'
]
const nestedChildrenKeys = ['modules', 'chapters', 'contentPages', 'interactiveTasks', 'documentationTools']
export const urlAttributeKeys = ['lecturerDashboardLink']
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
/**
 * Helper function to iterate all attributes of a given business object and generate a generic object.
 *
 * @param currentBusinessObject
 * @param iterationDepth
 */
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
  Object.keys(currentBusinessObject)?.forEach((attrKey) => {
    if (supportedAttributeKeys.concat(supportedObjectAttributeKeys).includes(attrKey)) {
      // The title attribute was used as name in the diagram
      const keyToPush = attrKey === 'name' ? 'title' : attrKey
      attributes.push(attributeObject(keyToPush, currentBusinessObject[attrKey]))
    } else if (nestedChildrenKeys.includes(attrKey)) {
      const attrObjects = []
      // The children objects of a businessObject are automatically businessObjects again
      currentBusinessObject[attrKey]?.forEach((childObject) => {
        attrObjects.push(iterateAttributes(childObject, iterationDepth))
      })
      attributes.push(attributeObject(attrKey, attrObjects))
    }
  })
  // All drawn modules are not offline -> thus, set offline false
  if (lcoType === 'ILIAS_MODULE') {
    attributes.push(attributeObject('offline', false))
  }
  genericObject.attributes = attributes
  return genericObject
}
/**
 * Return the value of an attribute.
 *
 * @param assistanceObject
 * @param key
 */
export const attributeValue = (assistanceObject, key) => {
  // Difference between ?? and || -> https://stackoverflow.com/questions/66883181/difference-between-and-operators
  return assistanceObject.attributes?.find((param) => param.key === key)?.value
}
/**
 * Extend existing attributes by a given object.
 *
 * @param existingAttributes
 * @param objectToAdd
 */
export const extendAttributes = (existingAttributes, objectToAdd) => {
  supportedAttributeKeys.forEach((attr) => {
    if (attributeValue(objectToAdd, attr)) {
      existingAttributes[attr] = attributeValue(objectToAdd, attr)
    }
  })
  return existingAttributes
}
/**
 * Retrieve the progress of a given objectId.
 *
 * @param studentProgress
 * @param objectId
 */
const progressForObjectId = (studentProgress, objectId) => {
  const subLco = studentProgress.sub_lco_progress?.find((item) => item.key === objectId)
  return subLco?.value || []
}
/**
 * Process the experiences specified in the student model.
 *
 * @param studentModel
 * @param filteredExperiences
 * @param currentLco
 */
const processExperiences = (studentModel, filteredExperiences, currentLco) => {
  const lcoType = currentLco.lcoType
  let experienceStatus = 'in-progress'
  // Interactive tasks -> attempted, completed, answered
  if (questionTypes.includes(lcoType)) {
    // If a completed exists, all answered statements behind it have not to be taken into account
    const lastCompleted = filteredExperiences.findLast(
      (exp) => exp.verbId === 'http://adlnet.gov/expapi/verbs/completed'
    )
    if (lastCompleted?.result?.score?.scaled !== undefined) {
      // Nested interactive tasks (completed statements) are already considered as passed at 91 percentage
      experienceStatus = lastCompleted.result.score.scaled >= 0.91 ? 'passed' : 'failed'
    } else {
      // If no completed exists, check for answered and the object ID
      const lastAnswered = filteredExperiences.findLast(
        (exp) => exp.verbId === 'http://adlnet.gov/expapi/verbs/answered'
      )
      if (
        lastAnswered &&
        !lastAnswered.objectId?.includes('h5p-subContentId') &&
        lastAnswered?.result?.score?.scaled !== undefined
      ) {
        experienceStatus = lastAnswered.result.score.scaled === 1 ? 'passed' : 'failed'
      }
    }
    // If the experiences do not only include "interacted"-statements, set an entry for the studentModel
    if (filteredExperiences.filter((exp) => exp.verbId !== 'http://adlnet.gov/expapi/verbs/interacted')?.length > 0) {
      studentModel[currentLco.objectId] = {
        experiences: filteredExperiences,
        status: experienceStatus
      }
    }
  }
  // For other types (contentPage, documentationTool), record the in-progress state (even for "interacted"-statements)
  else {
    studentModel[currentLco.objectId] = {
      experiences: filteredExperiences,
      status: experienceStatus
    }
  }
  return studentModel
}
/**
 * Iterate and fill the student model with the provided progress data.
 *
 * @param currentLco
 * @param studentProgress
 * @param studentModel
 * @param progressValue
 */
export const iterateAndFillStudentModel = (currentLco, studentProgress, studentModel, progressValue) => {
  let hasChildren = false
  if (currentLco.attributes) {
    currentLco.attributes?.forEach((attr) => {
      if (nestedChildrenKeys.includes(attr.key)) {
        // Even though ILIAS_CONTENT_PAGE has interactiveTasks and documentationTools as children, the function should not apply for those
        hasChildren = !['interactiveTasks', 'documentationTools'].includes(attr.key)
        attributeValue(currentLco, attr.key)?.forEach((childLco) => {
          // Hint: It should not be necessary to overwrite the studentModel here. However, it feels more transparent.
          studentModel = iterateAndFillStudentModel(childLco, studentProgress, studentModel, true)
          // If at least one child has no status set, the parent cannot have a status, too
          if (!studentModel[childLco.objectId]?.status) {
            progressValue = false
          }
        })
      }
    })
  }
  if (currentLco.objectId && progressForObjectId(studentProgress, currentLco.objectId)?.length > 0) {
    const experiences = progressForObjectId(studentProgress, currentLco.objectId)
    const filteredExperiences = experiences.filter((exp) => !excludedVerbs.includes(exp.verbId))
    // If at least one child has no status set, the parent cannot have a status, too
    if (filteredExperiences.length > 0 && progressValue) {
      // Hint: It should not be necessary to overwrite the studentModel here. However, it feels more transparent.
      studentModel = processExperiences(studentModel, experiences, currentLco)
    }
  }
  // Otherwise, the status of the children decides on the progress value
  else if (hasChildren && progressValue) {
    studentModel[currentLco.objectId] = {
      status: 'in-progress'
    }
  }
  return studentModel
}
/**
 * Specify the initial model.
 *
 * @param courseId
 * @param courseTitle
 */
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
 * Helper function to center the diagram and take into account all panels.
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

  // Reduce canvas width available with padding
  const padding = 25

  // However, we can only reduce one of it, otherwise it will crash
  const newWidthRatio = (outer.width - 2 * padding) / inner.width
  const newHeightRatio = (outer.height - 2 * padding) / inner.height
  const smallerWidthRatio = newWidthRatio < newHeightRatio
  if (smallerWidthRatio) {
    outer.width -= 2 * padding
  } else {
    outer.height -= 2 * padding
  }

  // Display the complete diagram without zooming in.
  // Instead of relying on internal zoom, we perform a
  // hard reset on the canvas viewbox to realize this
  //
  // If diagram does not need to be zoomed in, we focus it around
  // the diagram origin instead

  // Take the smallest scale value of these three
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
 * Helper function to retrieve the default size of elements of VerDatAs.
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
