<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Sebastian Kucharski, Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script>
import ConfirmationDialog from '@/components/shared/ConfirmationDialog.vue'
import { useSettingStore } from '@/stores/settings'
import { useGraphStore } from '@/stores/graph'
import {
  attributeValue,
  centerCanvas,
  excludedTypeNames,
  extendAttributes,
  getDefaultSize,
  initialModel,
  iterateAndFillStudentModel,
  iterateAttributes,
  nonSelectableElements,
  questionTypes
} from '@/util/GraphHelpers'
import ExtendedViewer from '@/util/KnowledgeGraph/ExtendedViewer'
import Viewer from '@/util/KnowledgeGraph/Viewer'
import axios from 'axios'
import { Base64 } from 'js-base64'
import { createConfirmDialog } from 'vuejs-confirm-dialog'

export default {
  data: () => ({
    dialog: null,
    graph: '',
    existingCourseNode: {},
    showEmptyMessage: false,
    intervalHandle: null,
    settings: useSettingStore(),
    graphStore: useGraphStore(),
    studentModel: {}
  }),
  props: {
    backendUrl: String,
    courseNode: Object,
    token: String,
    diagram: Object,
    diagramLoaded: Boolean,
    elementSelected: Object,
    canViewOnly: Boolean,
    pseudoId: String
  },
  emits: ['loadedDiagram', 'selectedElement', 'setDiagram', 'updateMetamodel'],
  created() {
    this.initGraphViewer()
  },
  computed: {
    /**
     * Return the lcoId of a potentially existing course node.
     */
    existingLcoId() {
      return this.existingCourseNode.lcoId ?? null
    }
  },
  methods: {
    /**
     * Handles the retrieval of the diagram and loading into the editor.
     */
    initGraphViewer() {
      if (!this.courseNode?.lcoType || !this.courseNode?.objectId) {
        console.log('The courseNode is incomplete (missing lcoType or objectId).')
        return
      }

      // Search for existing knowledge structures with a given objectId
      const knowledgeGraphUrl = this.backendUrl + '/api/v1/lco/search'
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }
      const request = [
        {
          key: 'objectId',
          value: this.courseNode.objectId
        }
      ]
      axios
        .post(knowledgeGraphUrl, request, { headers: authHeader })
        .then(async (graphResponse) => {
          // TODO: Use async and await functions to avoid using setTimeout multiple times
          if (graphResponse.data?.lcos) {
            const courseTitle = attributeValue(this.courseNode, 'title')
            // Encode the objectId using Base84
            // Example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
            // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
            const encodedId = Base64.encodeURI(this.courseNode.objectId)
            this.graph = initialModel(encodedId, courseTitle)
            // If a knowledge structure exists, load it into the view
            if (graphResponse.data?.lcos[0]) {
              const courseNode = graphResponse.data.lcos[0]
              this.existingCourseNode = courseNode
              await this.processKnowledgeGraph(authHeader)
              this.redrawKnowledgeGraph(courseNode)
            }
            // Otherwise, the course node is transferred for the first time
            else {
              await this.processKnowledgeGraph(authHeader)
              this.redrawKnowledgeGraph(this.courseNode)
              // If at least one attribute exists, save it initially
              if (this.courseNode.attributes?.length > 0) {
                // Use setTimeout, as otherwise the knowledge graph might not be set properly
                setTimeout(() => {
                  this.saveKnowledgeGraph()
                }, 100)
              } else {
                this.showEmptyMessage = true
              }
            }
            // Emit that the initial diagram was loaded once
            // Add timeout to avoid potential loading artifacts
            setTimeout(() => {
              this.$emit('loadedDiagram', true)
            }, 250)
          }
        })
        .catch((err) => {
          // Handle errors
          console.error(err)
        })
    },
    /**
     * Handles the entire (Extended-)Viewer creation,
     * the definition of the metamodel,
     * as well as the events happening after importing the diagram (centering, click, update events).
     *
     * @param authHeader
     */
    async processKnowledgeGraph(authHeader) {
      if (this.diagramLoaded || !this.graph) {
        return
      }
      let diagram = null
      if (!this.canViewOnly) {
        diagram = new ExtendedViewer({
          container: document.getElementById('graph-viewer')
        })
      } else {
        diagram = new Viewer({
          container: document.getElementById('graph-viewer')
        })
      }
      if (diagram) {
        this.$emit('setDiagram', diagram)
      }

      // Retrieve the metamodel and its parameters
      if (diagram._moddle?.registry?.packages?.length > 0) {
        const metamodel = diagram._moddle.registry.packages.find((pkg) => pkg.name === 'VerDatAs')
        metamodel.types = metamodel.types.filter((element) => !excludedTypeNames.includes(element.name))
        this.$emit('updateMetamodel', metamodel)
      }

      const canvas = diagram.get('canvas')
      const elementRegistry = diagram.get('elementRegistry')
      const eventBus = diagram.get('eventBus')
      const modeling = diagram.get('modeling')

      diagram
        .importXML(this.graph, 'RootGraph_1')
        .catch(function (err) {
          if (err) {
            return console.error('Could not import VerDatAs board', err)
          }
        })
        .then(async () => {
          // After importing XML, center the canvas
          centerCanvas(canvas)

          // Update the objectId of the course, if edit privileges exist
          if (!this.canViewOnly) {
            const knowledgeGraphCourse = elementRegistry.filter((element) => element.type === 'verDatAs:Course')[0]
            const properties = {}
            properties['objectId'] = this.courseNode.objectId
            modeling.updateProperties(knowledgeGraphCourse, properties)

            // Listen to selection changes and show the propertiesPanel with its inputs and listen for input changes
            eventBus.on('selection.changed', (e) => {
              const element = e.newSelection[0]
              if (element && !nonSelectableElements.includes(element.type)) {
                this.$emit('selectedElement', element)
              } else {
                this.$emit('selectedElement', null)
              }
            })
          }
          // As a student without editing privileges, request the current progress
          else {
            const url = this.backendUrl + '/api/v1/student/progress'
            const request = {
              subLcos: true,
              userId: this.pseudoId,
              objectId: this.courseNode.objectId
            }
            const studentProgress = await axios.post(url, request, { headers: authHeader })
            this.studentModel = iterateAndFillStudentModel(
              this.courseNode,
              studentProgress.data,
              this.studentModel,
              true
            )

            // On click, open the link to the selected element
            eventBus.on('element.click', (e) => {
              const element = e.element
              if (element?.businessObject?.objectId) {
                const objectId = element.businessObject.objectId
                // Check string, whether it contains a valid URL
                if (objectId.includes('http://') || objectId.includes('https://')) {
                  // Open the URL in the current tab
                  window.open(element.businessObject.objectId, '_self')
                }
              }
            })
            // Retrieve the elements that might be highlighted
            const elementsToHighlight = Object.keys(this.studentModel)
            // If elements to highlight exist, search for them in the registry
            if (elementsToHighlight?.length > 0) {
              // Iterate elements in the registry except for Labels and Connections
              elementRegistry
                .filter((elem) => !['label', 'verDatAs:SequenceFlow'].includes(elem.type))
                .forEach((elem) => {
                  if (elem.businessObject?.objectId && elementsToHighlight.includes(elem.businessObject.objectId)) {
                    const elementModel = this.studentModel[elem.businessObject.objectId]
                    if (elementModel.status) {
                      canvas.addMarker(elem, elementModel.status)
                    }
                  }
                })
            }
            // Otherwise, draw a stroke around the first object, i.e., the first module
            else {
              const modules = elementRegistry.filter((elem) => elem.type === 'verDatAs:Module')
              if (modules?.length > 0) {
                // Find the first module by sorting the modules after their names
                const sortedModules = modules.sort((a, b) => {
                  const nameA = a.businessObject?.name?.toLowerCase() ?? ''
                  const nameB = b.businessObject?.name?.toLowerCase() ?? ''
                  if (nameA < nameB) {
                    return -1
                  } else if (nameA > nameB) {
                    return 1
                  }
                  return 0
                })
                const firstModule = sortedModules[0]
                if (firstModule) {
                  canvas.addMarker(firstModule, 'initialElement')
                }
              }
            }
          }

          // Helper functions for debouncing and setting the encoded data
          function debounce(fn, timeout) {
            let timer

            return function () {
              if (timer) {
                clearTimeout(timer)
              }
              timer = setTimeout(fn, timeout)
            }
          }

          function setEncoded(link, name, data) {
            if (data && link) {
              link.setAttribute('href', 'data:application/xml;charset=UTF-8,' + encodeURIComponent(data))
              link.setAttribute('download', name)
            }
          }

          // On commandStack change, save the currently modeled diagram and prepare the button to load it
          const exportArtifacts = debounce(() => {
            diagram.saveXML({ format: true }).then(function (result) {
              setEncoded(document.getElementById('saveXML'), 'board.xml', result.xml)
            })
          }, 500)

          eventBus.on('commandStack.changed', exportArtifacts)
        })
    },
    /**
     * Attempt redrawing the knowledge graph using a given course node
     *
     * @param existingCourseNode
     */
    redrawKnowledgeGraph(existingCourseNode) {
      // Depending on whether a course node was input, use this node or the node from the dashboard data (this.courseNode)
      const courseNode = existingCourseNode ? existingCourseNode : this.courseNode
      // Early return, if either no lcoType or no objectId exists
      if (!courseNode?.lcoType || !courseNode?.objectId) {
        return
      }

      // When having an existing course node, redraw the knowledge graph without confirming
      if (existingCourseNode) {
        this.processRedrawKnowledgeGraph(courseNode)
      }
      // In other cases, a confirmation is necessary
      else {
        this.dialog = createConfirmDialog(ConfirmationDialog, {
          title: 'Graph neuzeichnen',
          question:
            'Sind Sie sich sicher, dass Sie den Graph neuzeichnen wollen? Die Parameter, die Sie definiert haben, gehen dadurch verloren.',
          confirmTxt: 'Bestätigen',
          cancelTxt: 'Abbrechen'
        })
        this.dialog.reveal()
        this.dialog.onConfirm(() => {
          this.processRedrawKnowledgeGraph(courseNode)
        })
        this.dialog.onCancel(() => {
          this.dialog.close()
        })
      }
    },
    /**
     * Handle the processing of the redrawing of the knowledge graph using a given course node.
     *
     * @param courseNode
     */
    processRedrawKnowledgeGraph(courseNode) {
      const encodedId = Base64.encodeURI(courseNode.objectId)
      const courseName = attributeValue(courseNode, 'title') ?? 'Unknown'

      // First, initialize the modeler
      this.loadInitialModel(this.diagram, encodedId, courseName).then(() => {
        // Retrieve general diagram-js controls
        const canvas = this.diagram.get('canvas')
        const moddle = this.diagram.get('moddle')
        const modeling = this.diagram.get('modeling')
        const elementFactory = this.diagram.get('elementFactory')
        const elementRegistry = this.diagram.get('elementRegistry')

        if (modeling) {
          // Replace the objectId of the course and set its title as a label
          const knowledgeGraphCourse = elementRegistry.find((element) => element.type === 'verDatAs:Course')
          const knowledgeGraphCourseLabel = elementRegistry.find(
            (element) => element.id === knowledgeGraphCourse.label?.id
          )
          // Update the objectId and other attributes
          let properties = {}
          properties['objectId'] = courseNode.objectId
          properties = extendAttributes(properties, courseNode)
          modeling.updateProperties(knowledgeGraphCourse, properties)

          // Set the title of the course
          const courseTitle = attributeValue(courseNode, 'title') ?? 'Course'
          modeling.updateLabel(knowledgeGraphCourse, courseTitle)

          // General idea: Draw first and center afterward
          // Define dimensions, offsets and initial positions
          const courseDimensions = getDefaultSize(knowledgeGraphCourse)
          const courseWidth = courseDimensions.width
          const courseHeight = courseDimensions.height

          const offsetBetweenLayers = 75

          const moduleHeight = getDefaultSize('verDatAs:Module').height
          // Hint: It seems like the initial position y refers to the outer position and all following are the middle of the element
          const initialModulePosition = knowledgeGraphCourse.y + courseHeight + offsetBetweenLayers + moduleHeight / 2

          const chapterWidth = getDefaultSize('verDatAs:Chapter').width
          const chapterHeight = getDefaultSize('verDatAs:Chapter').height
          const chapterOffset = 10
          let chapterPositionX = 0

          const taskWidth = getDefaultSize('verDatAs:InteractiveTask').width
          const taskHeight = getDefaultSize('verDatAs:InteractiveTask').height
          const documentationToolWidth = getDefaultSize('verDatAs:DocumentationTool').width
          const documentationToolHeight = getDefaultSize('verDatAs:DocumentationTool').height

          const offset = 70
          let totalWidth = 0

          // Reduce the list of the modules to those that are currently set online
          let filteredModules = []
          const courseModules = attributeValue(courseNode, 'modules')
          if (courseModules?.length > 0) {
            filteredModules = courseModules.filter((m) => attributeValue(m, 'offline') === false)
          }

          // Iterate the remaining modules
          filteredModules?.forEach((module, moduleIndex) => {
            const moduleChapters = attributeValue(module, 'chapters')
            const chapterCount = moduleChapters?.length || 0
            // Calculate the entire width of all chapters of the module
            const totalChapterWidth = chapterCount * chapterWidth + (chapterCount - 1) * chapterOffset
            // Add it to the total width to get the full width of the graph
            totalWidth += totalChapterWidth

            // Draw the module (define type, position and dimensions)
            const moduleType = {
              type: 'verDatAs:Module'
            }
            const modulePosition = {
              // TODO: The module position is current somehow off 7px (investigate how this happens)
              x: chapterPositionX + totalChapterWidth / 2 - 7, // "- moduleWidth / 2" is no longer necessary, as the middle has to be defined
              y: initialModulePosition
            }
            const moduleDimensions = getDefaultSize(moduleType.type)
            const moduleAttributes = { ...modulePosition, ...moduleDimensions, ...moduleType }
            const moduleShape = elementFactory.create('shape', moduleAttributes)
            canvas.addShape(moduleShape)

            // Add it to the modeling object
            const existingModules = knowledgeGraphCourse.businessObject?.modules ?? []
            existingModules.push(moduleShape.businessObject)
            modeling.updateProperties(knowledgeGraphCourse, { modules: existingModules })

            // Update the objectId and other attributes
            let moduleProperties = {}
            moduleProperties['objectId'] = module.objectId
            moduleProperties = extendAttributes(moduleProperties, module)
            modeling.updateProperties(moduleShape, moduleProperties)

            // Set the title of the module
            const moduleTitle = attributeValue(module, 'title') ?? 'Module ' + (moduleIndex + 1)
            modeling.updateLabel(moduleShape, moduleTitle)

            // Draw a connection to the course
            modeling.connect(knowledgeGraphCourse, moduleShape)

            // Iterate the chapters of the module
            moduleChapters?.forEach((chapter, chapterIndex) => {
              // Draw the chapter (define type, position and dimensions)
              // Take starting position + the width of the last element + offset + half to the elements width
              const currentChapterPositionX =
                chapterPositionX + chapterIndex * (chapterWidth + chapterOffset) + chapterWidth / 2
              const chapterType = {
                type: 'verDatAs:Chapter'
              }
              const chapterPosition = {
                x: currentChapterPositionX,
                y: modulePosition.y + moduleHeight + offsetBetweenLayers + chapterHeight / 2
              }
              const chapterDimensions = getDefaultSize(chapterType.type)
              const chapterAttributes = { ...chapterPosition, ...chapterDimensions, ...chapterType }
              const chapterShape = elementFactory.createShape(chapterAttributes)
              canvas.addShape(chapterShape)

              // Add it to the modeling object
              const existingChapters = moduleShape.businessObject?.chapters ?? []
              existingChapters.push(chapterShape.businessObject)
              modeling.updateProperties(moduleShape, { chapters: existingChapters })

              // Update the objectId and other attributes
              let chapterProperties = {}
              chapterProperties['objectId'] = chapter.objectId
              chapterProperties = extendAttributes(chapterProperties, chapter)

              // Set the title of the chapter
              const chapterTitle = attributeValue(chapter, 'title') ?? 'Chapter ' + (chapterIndex + 1)
              modeling.updateLabel(chapterShape, chapterTitle)

              // Iterate the contentPages of the chapter
              const contentPages = []
              let taskOrDocumentationToolIndex = 0
              attributeValue(chapter, 'contentPages')?.forEach((page, pageIndex) => {
                let taskShapesBusinessObjects = []
                let documentationToolShapesBusinessObjects = []

                // Update the objectId and other attributes
                let pageProperties = {
                  objectId: page.objectId,
                  title: attributeValue(page, 'title') || 'ContentPage ' + (pageIndex + 1)
                }
                pageProperties = extendAttributes(pageProperties, page)

                let attributeInteractiveTasks = attributeValue(page, 'interactiveTasks') ?? []
                let attributeDocumentationTools = attributeValue(page, 'documentationTools') ?? []
                let interactiveTaskIndex = 0
                let documentationToolIndex = 0

                // Iterate the interactiveTasks and documentationTools of the contentPage
                attributeInteractiveTasks.concat(attributeDocumentationTools)?.forEach((pageChild) => {
                  const isInteractiveTask = questionTypes.includes(pageChild.lcoType)
                  if (isInteractiveTask) {
                    interactiveTaskIndex += 1
                  } else {
                    documentationToolIndex += 1
                  }
                  const childType = {
                    type: isInteractiveTask ? 'verDatAs:InteractiveTask' : 'verDatAs:DocumentationTool'
                  }
                  const childWidth = isInteractiveTask ? taskWidth : documentationToolWidth
                  const childHeight = isInteractiveTask ? taskHeight : documentationToolHeight
                  const childPosition = {
                    // Hint: The children are currently centered, too. In order to remove this, add a small offset
                    x: currentChapterPositionX + chapterWidth / 2 - childWidth / 2, // old solution -> x: currentChapterPositionX + 10,
                    // TODO: 80 is a value that currently works good. However, this has not be the case for different knowledge structures
                    // Only use half of the offset, as no further split is made on the next level
                    y:
                      chapterShape.y +
                      chapterShape.height +
                      offsetBetweenLayers / 2 +
                      childHeight / 2 +
                      taskOrDocumentationToolIndex * 80
                  }
                  const childDimensions = getDefaultSize(childType.type)
                  const childAttributes = { ...childPosition, ...childDimensions, ...childType }
                  const childShape = elementFactory.createShape(childAttributes)
                  canvas.addShape(childShape)

                  const defaultTypeName = isInteractiveTask
                    ? 'Task ' + interactiveTaskIndex
                    : 'Diary ' + documentationToolIndex
                  // Set the title of the child
                  const childTitle = attributeValue(pageChild, 'title') ?? defaultTypeName
                  modeling.updateLabel(childShape, childTitle)

                  // Update the objectId and other attributes
                  let childProperties = {}
                  childProperties['objectId'] = pageChild.objectId
                  childProperties = extendAttributes(childProperties, pageChild)

                  modeling.updateProperties(childShape, childProperties)

                  // Draw a connection to the chapter
                  modeling.connect(chapterShape, childShape)
                  taskOrDocumentationToolIndex += 1
                  if (isInteractiveTask) {
                    taskShapesBusinessObjects.push(childShape.businessObject)
                  } else {
                    documentationToolShapesBusinessObjects.push(childShape.businessObject)
                  }
                })
                pageProperties.interactiveTasks = taskShapesBusinessObjects
                pageProperties.documentationTools = documentationToolShapesBusinessObjects

                const element = moddle.create('verDatAs:ContentPage', pageProperties)
                contentPages.push(element)
              })
              chapterProperties['contentPages'] = contentPages

              modeling.updateProperties(chapterShape, chapterProperties)

              // Draw a connection to the module
              modeling.connect(moduleShape, chapterShape)

              // Set the next chapter position
              if (chapterIndex === chapterCount - 1) {
                chapterPositionX =
                  chapterPositionX + chapterIndex * (chapterWidth + chapterOffset) + chapterWidth + offset
              }
            })
            // Draw the course
            if (moduleIndex === filteredModules.length - 1) {
              // TODO: The totalWidth currently somehow misses the width of one chapter in order to be centered
              totalWidth += chapterWidth
              // Move the course
              // TODO: This somehow does not move the label of the course
              modeling.moveElements([knowledgeGraphCourse], {
                x: totalWidth / 2 - courseWidth / 2 - knowledgeGraphCourse.x,
                // Hint: 20 are added to reduce the distance from the course to the module
                y: 90 - knowledgeGraphCourse.y + 20 // 90 is the position set on initialization
              })
              // Move the course label
              modeling.moveElements([knowledgeGraphCourseLabel], {
                x: totalWidth / 2 - knowledgeGraphCourseLabel.width / 2 - knowledgeGraphCourseLabel.x,
                // TODO: Currently, no offset is used
                // Hint: 20 are added to reduce the distance from the course to the module
                y: 90 + knowledgeGraphCourse.height - knowledgeGraphCourseLabel.y + 20 // 90 + height + offset of label
              })
            } else {
              // Increase total width with offset
              totalWidth += offset
            }
          })

          // Hide the message on successful redraw
          if (this.showEmptyMessage) {
            this.showEmptyMessage = false
          }

          // Center the diagram in the final step
          centerCanvas(canvas)
        }
      }, 500)
    },
    /**
     * Load the initial model by importing it as XML.
     *
     * @param underlyingDiagram
     * @param encodedId
     * @param courseName
     */
    loadInitialModel(underlyingDiagram, encodedId, courseName) {
      return underlyingDiagram.importXML(initialModel(encodedId, courseName), 'RootGraph_1').catch(function (err) {
        if (err) {
          return console.error('Could not import VerDatAs board', err)
        }
      })
    },
    /**
     * Save the knowledge graph as XML.
     */
    saveXML() {
      this.diagram.saveXML({ format: true }).then((result) => {
        // Retrieved from https://stackoverflow.com/a/24191504
        const xmltext = result.xml

        const filename = Math.floor(Date.now() / 1000) + '_verDatAs.xml'
        const pom = document.createElement('a')
        const bb = new Blob([xmltext], { type: 'text/plain' })

        pom.setAttribute('href', window.URL.createObjectURL(bb))
        pom.setAttribute('download', filename)

        pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':')
        pom.draggable = true
        pom.classList.add('dragout')

        pom.click()
      })
    },
    /**
     * Save the knowledge graph by converting it into the generic structure and sending it to the backend.
     */
    saveKnowledgeGraph() {
      const elementRegistry = this.diagram.get('elementRegistry')
      const courses = elementRegistry.filter((element) => element.type === 'verDatAs:Course')
      if (!courses || courses.length === 0) {
        console.error('No course has been defined so far.')
        return
      }
      const knowledgeGraphCourse = courses[0]
      if (!knowledgeGraphCourse?.businessObject?.objectId || knowledgeGraphCourse.businessObject.objectId === '') {
        console.log('No objectId defined for course.')
        return
      }
      const courseBusinessObject = knowledgeGraphCourse.businessObject

      // Generic format as an object
      const genericCourseFormatRequest = iterateAttributes(courseBusinessObject)

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      const url = !this.existingLcoId
        ? this.backendUrl + '/api/v1/lco'
        : this.backendUrl + '/api/v1/lco/' + this.existingLcoId

      // If no lcoId exists, create a new lco object
      if (!this.existingLcoId) {
        axios.post(url, genericCourseFormatRequest, { headers: authHeader }).then(() => {
          console.log('Save Graph')
          // Visual feedback for the user, when the graph is saved
          const loading = document.getElementById('loading')
          loading.style.display = 'block'
          setTimeout(function () {
            loading.style.display = 'none'
          }, 2800)
        })
      }
      // If a lcoId exists, update the according lco object
      else {
        axios.put(url, genericCourseFormatRequest, { headers: authHeader }).then(() => {
          console.log('Updating Graph')
          // Visual feedback for the user when graph is saved
          const loading = document.getElementById('loading')
          loading.style.display = 'block'
          setTimeout(function () {
            loading.style.display = 'none'
          }, 2800)
        })
      }
    },
    /**
     * Center the canvas.
     */
    centerCanvas() {
      const canvas = this.diagram.get('canvas')
      centerCanvas(canvas)
    },
    /**
     * Change the input of a given parameter name and value.
     *
     * @param parameterName
     * @param newValue
     */
    changeInput(parameterName, newValue) {
      const propertyToDefine = {}
      propertyToDefine[parameterName] = newValue
      // TODO: This is a workaround, as it is not allowed to modify this.elementSelected itself
      const elementToUpdate = this.diagram
        .get('elementRegistry')
        .find((element) => element.id === this.elementSelected.id)
      this.diagram.get('modeling').updateProperties(elementToUpdate, propertyToDefine)
    }
  }
}
</script>

<template>
  <div id="graph-viewer" class="rasterBackground" :class="canViewOnly ? 'canViewOnly' : ''">
    <div v-if="!canViewOnly && showEmptyMessage" class="empty">
      <p class="empty-message">
        Bitte fügen Sie Lerninhalte wie Module und interaktive Aufgaben hinzu, um diese hier zu visualisieren.
      </p>
    </div>
    <div v-if="!canViewOnly" class="autosave">
      <p id="loading" class="loading" style="display: none">Speichern<span>.</span><span>.</span><span>.</span></p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#graph-viewer {
  position: relative;
  height: 100%;
  z-index: 5;
}

.rasterBackground {
  background-color: #fff;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEwLjU4MyAxMC41ODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0ibTAuMDAxMjA4MyAxMC41ODN2LTEwLjU4MyIgZmlsbD0iIzgwODA4MCIgc3Ryb2tlPSIjZGVkZWRlIiBzdHJva2Utd2lkdGg9Ii4yNjciLz48cGF0aCBkPSJtMS4zMjUzZS00IC0wLjAwNDk1NzIgMTAuNTgzIDAuMDA5OTE0MyIgc3Ryb2tlPSIjZGVkZWRlIiBzdHJva2Utd2lkdGg9Ii4yNTQ2N3B4Ii8+PC9nPjwvc3ZnPg==');
  background-position: -1px -1px;
  overflow: hidden;

  svg.djs-drag-active:not(.drop-not-ok) {
    background-color: #fff !important;
    background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEwLjU4MyAxMC41ODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8Zz4KICA8cGF0aCBkPSJtMC4wMDEyMDgzIDEwLjU4M3YtMTAuNTgzIiBmaWxsPSIjODA4MDgwIiBzdHJva2U9IiNkZWRlZGUiIHN0cm9rZS13aWR0aD0iLjI2NyIvPgogIDxnIGZpbGw9Im5vbmUiPgogICA8cGF0aCBkPSJtMS4zMjUzZS00IC0wLjAwNDk1NzIgMTAuNTgzIDAuMDA5OTE0MyIgc3Ryb2tlPSIjZGVkZWRlIiBzdHJva2Utd2lkdGg9Ii4yNTQ2N3B4Ii8+CiAgIDxwYXRoIGQ9Im01LjIyNjMgMC4xMzIyOXYxMC40NTEiIHN0cm9rZT0iI2Y3ZjdmNyIgc3Ryb2tlLXdpZHRoPSIuMjY0NDVweCIvPgogICA8cGF0aCBkPSJtMC4xMzIyOSA1LjIyNTVoMTAuNDUxIiBzdHJva2U9IiNmN2Y3ZjciIHN0cm9rZS13aWR0aD0iLjI2NDg3cHgiLz4KICA8L2c+CiA8L2c+Cjwvc3ZnPgo=') !important;
    background-position: -1px -1px !important;
    overflow: hidden !important;
  }
}

.empty {
  text-align: center;
  width: 100%;
  position: absolute;
  top: 20%;
}

.empty-message {
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 75%;
  background: white;
  margin: 0 auto !important;
  padding: 3%;
}

.autosave {
  text-align: center;
  width: 100%;
  position: absolute;
  bottom: 1%;

  p {
    border: 1px solid #ddd;
    border-radius: 3px;
    width: 200px;
    background: white;
    margin: auto;
    padding: 1%;
  }
}

@keyframes saving {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

.loading span {
  animation-name: saving;
  animation-duration: 1.4s;
  animation-iteration-count: 2;
  animation-fill-mode: both;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}
</style>
