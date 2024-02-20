<script>
import axios from 'axios'
import { Base64 } from 'js-base64'
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
import { useSettingStore } from '@/stores/settings'
import { useGraphStore } from '@/stores/graph'

export default {
  data: () => ({
    graph: '',
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
  emits: [
    'loadedDiagram',
    'selectedElement',
    'setDiagram',
    'updateCourseNode',
    'updateMetamodel'
  ],
  created() {
    this.initGraphViewer()
  },
  computed: {
    existingLcoId() {
      return this.courseNode.lcoId ?? null
    }
  },
  methods: {
    // Handles the retrieval of the diagram and loading into the editor
    initGraphViewer() {
      if (!this.courseNode?.lcoType || !this.courseNode?.objectId) {
        console.log('The courseNode is incomplete (missing lcoType or objectId).')
        return
      }

      // check whether knowledge_structure exist for the given ref_id
      // yes? -> initialize modeler with the resulting diagram
      // example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
      // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
      const encodedId = Base64.encodeURI(this.courseNode.objectId)
      const knowledgeGraphUrl = this.backendUrl + '/api/v1/lco/search'
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }
      // search for existing knowledge_graphs with a given objectId
      const request = [
        {
          "key": "objectId",
          "value": this.courseNode.objectId
        }
      ]
      axios
        .post(knowledgeGraphUrl, request, { headers: authHeader })
        .then(async (graphResponse) => {
          // Handle response
          // TODO: Make use of async and await functions to avoid using setTimeout multiple times
          console.log('graph data', graphResponse.data)
          if (graphResponse.data?.lcos) {
            const courseTitle = attributeValue(this.courseNode, 'title')
            this.graph = initialModel(encodedId, courseTitle)
            if (graphResponse.data?.lcos[0]) {
              const courseNode = graphResponse.data.lcos[0]
              this.$emit('updateCourseNode', courseNode)
              await this.processKnowledgeGraph(authHeader)
              this.redrawKnowledgeGraph()
            } else {
              // the course node is transferred for the first time
              await this.processKnowledgeGraph(authHeader)
              this.redrawKnowledgeGraph()
              // if at least one attribute exists, save it initially
              if (this.courseNode.attributes?.length > 0) {
                // use setTimeout, as otherwise the knowledge graph might not be ready
                setTimeout(() => {
                  this.saveKnowledgeGraph()
                }, 100)
              }
              else {
                this.showEmptyMessage = true
              }
            }
            // Set that the initial diagram was loaded once
            // Add timeout to avoid loading artifacts
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
    // Handles the entire (Extended-)Viewer creation,
    // the definition of the metamodel,
    // as well as the events happening after importing the diagram (centering, click, update events)
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
      this.$emit('setDiagram', diagram)

      // Retrieve the metamodel and its parameters
      if (diagram._moddle?.registry?.packages?.length > 0) {
        const metamodel = diagram._moddle.registry.packages.find((pkg) => pkg.name === 'VerDatAs')
        metamodel.types = metamodel.types.filter((element) => !excludedTypeNames.includes(element.name))
        this.$emit('updateMetamodel', metamodel)
      }

      const canvas = diagram.get('canvas')
      const elementFactory = diagram.get('elementFactory')
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
          // After importing xml:
          // Center canvas
          centerCanvas(canvas)

          // Update objectId of course
          if (!this.canViewOnly) {
            const knowledgeGraphCourse = elementRegistry.filter((element) => element.type === 'verDatAs:Course')[0]
            const properties = {}
            properties['objectId'] = this.courseNode.objectId
            modeling.updateProperties(knowledgeGraphCourse, properties)

            // Listen to selection changes and show propertiesPanel, inputs and listen for input changes
            eventBus.on('selection.changed', (e) => {
              const element = e.newSelection[0]
              if (element && !nonSelectableElements.includes(element.type)) {
                this.$emit('selectedElement', element)
              } else {
                this.$emit('selectedElement', null)
                //try to auto-save the graph after not selecting another graph element if activated in the settings
                if (this.settings.autosave && this.diagramLoaded) {
                  console.log('auto saving')
                  this.saveKnowledgeGraph()
                }
              }
            })
          } else {
            const url = this.backendUrl + '/api/v1/student/progress'
            const request = {
              subLcos: true,
              userId: this.pseudoId,
              objectId: this.courseNode.objectId
            }
            const studentProgress = await axios.post(url, request, { headers: authHeader })
            this.studentModel = iterateAndFillStudentModel(this.courseNode, studentProgress.data, this.studentModel, true)
            console.log('studentModel', this.studentModel)

            // TODO: Remove, if implemented by VSG
            eventBus.on('element.click', (e) => {
              const element = e.element
              if (element?.businessObject?.objectId) {
                // Hold objectId's locally for demonstration purposes
                const objectId = element.businessObject.objectId
                // Check string, whether it contains a valid URL
                if (objectId.includes('http://') || objectId.includes('https://')) {
                  // let visitedObjects = []
                  // if (localStorage.getItem('visitedObjects')) {
                  //   visitedObjects = JSON.parse(localStorage.getItem('visitedObjects'))
                  // }
                  // if (!visitedObjects.includes(objectId)) {
                  //   visitedObjects.push(objectId)
                  // }
                  // localStorage.setItem('visitedObjects', JSON.stringify(visitedObjects))
                  // Open on click
                  window.open(element.businessObject.objectId, '_self')
                }
              }
            })
            const elementsToHighlight = Object.keys(this.studentModel)
            // iterate elements in registry except of Labels and Connections
            elementRegistry.filter((elem) => !['label', 'verDatAs:SequenceFlow'].includes(elem.type)).forEach((elem) => {
              if (elem.businessObject?.objectId && elementsToHighlight.includes(elem.businessObject.objectId)) {
                const elementModel = this.studentModel[elem.businessObject.objectId]
                if (elementModel.status) {
                  canvas.addMarker(elem, elementModel.status)
                }
              }
            })
          }

          function debounce(fn, timeout) {
            var timer

            return function () {
              if (timer) {
                clearTimeout(timer)
              }
              timer = setTimeout(fn, timeout)
            }
          }

          function setEncoded(link, name, data) {
            var encodedData = encodeURIComponent(data)

            // TODO: Uncaught (in promise) TypeError: Cannot read properties of null (reading 'setAttribute'),
            //       when label-editing an element without prior label
            // The error above is thrown when link is undefined
            if (data && link) {
              // link.classList.add('active');
              link.setAttribute('href', 'data:application/xml;charset=UTF-8,' + encodedData)
              link.setAttribute('download', name)
            } else {
              // link.classList.remove('active');
            }
          }

          // On commandStack change, save the currently modeled diagram and prepare button to load it
          const exportArtifacts = debounce(() => {
            diagram.saveXML({ format: true }).then(function (result) {
              setEncoded(document.getElementById('saveXML'), 'board.xml', result.xml)
            })
          }, 500)

          eventBus.on('commandStack.changed', exportArtifacts)
        })
    },
    redrawKnowledgeGraph() {
      console.log('redrawKnowledgeGraph', this.courseNode)
      if (!this.courseNode?.lcoType || !this.courseNode?.objectId) {
        return
      }

      const encodedId = Base64.encodeURI(this.courseNode.objectId)
      const courseName = attributeValue(this.courseNode, 'name') ?? 'Unknown'

      // First, initialize modeler
      this.loadInitialModel(this.diagram, encodedId, courseName).then(() => {
        // Retrieve general diagram-js controls
        const canvas = this.diagram.get('canvas')
        const moddle = this.diagram.get('moddle')
        const modeling = this.diagram.get('modeling')
        const elementFactory = this.diagram.get('elementFactory')
        const elementRegistry = this.diagram.get('elementRegistry')

        if (modeling) {
          // Replace objectId of the course and set its title as a label
          const knowledgeGraphCourse = elementRegistry.find((element) => element.type === 'verDatAs:Course')
          const knowledgeGraphCourseLabel = elementRegistry.find(
            (element) => element.id === knowledgeGraphCourse.label?.id
          )
          // Update objectId and other attributes
          let properties = {}
          properties['objectId'] = this.courseNode.objectId
          properties = extendAttributes(properties, this.courseNode)
          modeling.updateProperties(knowledgeGraphCourse, properties)

          // Set title of the course
          const courseTitle = attributeValue(this.courseNode, 'title') ?? 'Course'
          modeling.updateLabel(knowledgeGraphCourse, courseTitle)

          // GENERAL IDEA: Draw first and center afterward
          // Define dimensions, offsets and initial positions
          const courseDimensions = getDefaultSize(knowledgeGraphCourse)
          const courseWidth = courseDimensions.width
          const courseHeight = courseDimensions.height

          const offsetBetweenLayers = 75

          const moduleWidth = getDefaultSize('verDatAs:Module').width
          const moduleHeight = getDefaultSize('verDatAs:Module').height
          // TODO: It seems like the initial position y refers to the outer position and all following are the middle of the element
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

          // Reduce list of modules to those that are currently set online
          let filteredModules = []
          const courseModules = attributeValue(this.courseNode, 'modules')
          if (courseModules?.length > 0) {
            filteredModules = courseModules.filter((m) => attributeValue(m, 'offline') === false)
          }

          // Iterate remaining modules
          filteredModules?.forEach((module, moduleIndex) => {
            const moduleChapters = attributeValue(module, 'chapters')
            const chapterCount = moduleChapters?.length || 0
            // Calculate the entire width of all chapters of the module
            const totalChapterWidth = chapterCount * chapterWidth + (chapterCount - 1) * chapterOffset
            // Add it to the total width to get the full width of the graph
            totalWidth += totalChapterWidth

            // Draw module (define type, position and dimensions)
            const moduleType = {
              type: 'verDatAs:Module'
            }
            const modulePosition = {
              // FIXME: the module position is current somehow off 7px
              // Investigate how this happens
              x: chapterPositionX + totalChapterWidth / 2 - 7, // "- moduleWidth / 2" is not longer necessary, as the middle has to be defined
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

            // Update objectId and other attributes
            let moduleProperties = {}
            moduleProperties['objectId'] = module.objectId
            moduleProperties = extendAttributes(moduleProperties, module)
            modeling.updateProperties(moduleShape, moduleProperties)

            // Set title of the module
            const moduleTitle = attributeValue(module, 'title') ?? 'Module ' + (moduleIndex + 1)
            modeling.updateLabel(moduleShape, moduleTitle)

            // Draw connection to the course
            modeling.connect(knowledgeGraphCourse, moduleShape)

            // Iterate chapters of module
            moduleChapters?.forEach((chapter, chapterIndex) => {
              // Draw chapter (define type, position and dimensions)
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

              // Update objectId and other attributes
              let chapterProperties = {}
              chapterProperties['objectId'] = chapter.objectId
              chapterProperties = extendAttributes(chapterProperties, chapter)

              // Set title of the chapter
              const chapterTitle = attributeValue(chapter, 'title') ?? 'Chapter ' + (chapterIndex + 1)
              modeling.updateLabel(chapterShape, chapterTitle)

              // Iterate contentPages of the chapter
              const contentPages = []
              let taskOrDocumentationToolIndex = 0
              attributeValue(chapter, 'contentPages')?.forEach((page, pageIndex) => {
                let taskShapesBusinessObjects = []
                let documentationToolShapesBusinessObjects = []

                // Update objectId and other attributes
                let pageProperties = {
                  objectId: page.objectId,
                  title: attributeValue(page, 'title') || 'ContentPage ' + (pageIndex + 1)
                }
                pageProperties = extendAttributes(pageProperties, page)

                let attributeInteractiveTasks = attributeValue(page, 'interactiveTasks') ?? []
                let attributeDocumentationTools = attributeValue(page, 'documentationTools') ?? []
                let interactiveTaskIndex = 0
                let documentationToolIndex = 0

                // Iterate interactiveTasks and documentationTools of the contentPage
                attributeInteractiveTasks.concat(attributeDocumentationTools)?.forEach((pageChild, childIndex) => {
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
                    // Hint: the children are currently centered, too. In order to remove this, add a small offset
                    x: currentChapterPositionX + (chapterWidth / 2) - (childWidth / 2), // old solution -> x: currentChapterPositionX + 10,
                    // TODO: 75 is a value that currently works good. However, this has not be the case for different knowledge structures
                    // Only use half of the offset, as no further split is made on the next level
                    y:
                      chapterShape.y +
                      chapterShape.height +
                      offsetBetweenLayers / 2 +
                      childHeight / 2 +
                      taskOrDocumentationToolIndex * 75
                  }
                  const childDimensions = getDefaultSize(childType.type)
                  const childAttributes = { ...childPosition, ...childDimensions, ...childType }
                  const childShape = elementFactory.createShape(childAttributes)
                  canvas.addShape(childShape)

                  const defaultTypeName = isInteractiveTask ? 'Task ' + interactiveTaskIndex : 'Diary ' + documentationToolIndex
                  // Set title of the child
                  const childTitle =
                      attributeValue(pageChild, 'title') ?? defaultTypeName
                  modeling.updateLabel(childShape, childTitle)

                  // Update objectId and other attributes
                  let childProperties = {}
                  childProperties['objectId'] = pageChild.objectId
                  childProperties = extendAttributes(childProperties, pageChild)

                  modeling.updateProperties(childShape, childProperties)

                  // Draw connection to the chapter
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

              // Draw connection to the module
              modeling.connect(moduleShape, chapterShape)

              // Set next position
              if (chapterIndex === chapterCount - 1) {
                chapterPositionX =
                  chapterPositionX + chapterIndex * (chapterWidth + chapterOffset) + chapterWidth + offset
              }
            })
            // Draw course
            if (moduleIndex === filteredModules.length - 1) {
              // FIXME: The totalWidth currently somehow misses the width of one chapter in order to be centered
              totalWidth += chapterWidth
              // Move course
              // TODO: This somehow does not move the label of the course
              modeling.moveElements([knowledgeGraphCourse], {
                x: totalWidth / 2 - courseWidth / 2 - knowledgeGraphCourse.x,
                // TODO: 20 are added to reduce the distance from the course to the module
                y: 90 - knowledgeGraphCourse.y + 20 // 90 is the position set on initialization
              })
              // Move course label
              modeling.moveElements([knowledgeGraphCourseLabel], {
                x: totalWidth / 2 - knowledgeGraphCourseLabel.width / 2 - knowledgeGraphCourseLabel.x,
                // TODO: Currently, no offset is used
                // TODO: 20 are added to reduce the distance from the course to the module
                y: 90 + knowledgeGraphCourse.height - knowledgeGraphCourseLabel.y + 20 // 90 + height + offset of label
              })
            } else {
              // increase total width with offset
              totalWidth += offset
            }
          })

          // hide message on successful redraw
          if (this.showEmptyMessage) {
            this.showEmptyMessage = false
          }

          // Center diagram in the final step
          centerCanvas(canvas)
        }
      }, 500)
    },
    loadInitialModel(underlyingDiagram, encodedId, courseName) {
      // Import initial diagram into the modeler
      return underlyingDiagram.importXML(initialModel(encodedId, courseName), 'RootGraph_1').catch(function (err) {
        if (err) {
          return console.error('Could not import VerDatAs board', err)
        }
      })
    },
    saveXML() {
      this.diagram.saveXML({ format: true }).then((result) => {
        // Retrieved from https://stackoverflow.com/a/24191504
        var xmltext = result.xml

        var filename = Math.floor(Date.now() / 1000) + '_verDatAs.xml'
        var pom = document.createElement('a')
        var bb = new Blob([xmltext], { type: 'text/plain' })

        pom.setAttribute('href', window.URL.createObjectURL(bb))
        pom.setAttribute('download', filename)

        pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':')
        pom.draggable = true
        pom.classList.add('dragout')

        pom.click()
      })
    },
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

      const genericCourseFormatRequest = iterateAttributes(courseBusinessObject)
      console.log('1) Generic format as an object', genericCourseFormatRequest)
      console.log('2) Generic format as JSON', JSON.stringify(genericCourseFormatRequest))

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      const url = !this.existingLcoId ? this.backendUrl + '/api/v1/lco' : this.backendUrl + '/api/v1/lco/' + this.existingLcoId

      // if no lcoId exists, create a new lco object
      if (!this.existingLcoId) {
        axios.post(url, genericCourseFormatRequest, { headers: authHeader }).then(() => {
          console.log('Save Graph')
          //visual feedback for the user when graph is saved
          const loading = document.getElementById('loading')
          loading.style.display = 'block'
          const errorMessage = document.getElementById('autosave-message')
          errorMessage.style.display = 'none'
          setTimeout(function () {
            loading.style.display = 'none'
            errorMessage.style.display = 'block'
          }, 2800)
        })
      }
      // if a lcoId exists, update this lco object
      else {
        axios.put(url, genericCourseFormatRequest, { headers: authHeader }).then(() => {
          console.log('Updating Graph')
          //visual feedback for the user when graph is saved
          const loading = document.getElementById('loading')
          loading.style.display = 'block'
          const errorMessage = document.getElementById('autosave-message')
          errorMessage.style.display = 'none'
          setTimeout(function () {
            loading.style.display = 'none'
            errorMessage.style.display = 'block'
          }, 2800)
        })
      }

      // TODO: Remove, if transferred to adjusted functionality
      // const graphs = this.graphStore.graphs

      // this.diagram.saveXML({ format: true }).then((result) => {
      //   console.log('Graphs', graphs)
      //   const courseObjectId = this.courseNode?.objectId
      //   if (!graphs[courseObjectId]) graphs[courseObjectId] = ''
      //
      //   const lastSavedGraphForCourse = graphs[courseObjectId]
      //   // only save graph if something changed compared to the last saved graph
      //   if (result.xml === lastSavedGraphForCourse) {
      //     return
      //   }
      //
      //   //save new graph to store
      //   graphs[courseObjectId] = result.xml
      //
      //   const request = {
      //     graph: result.xml,
      //     format: 'XML'
      //   }
      //
      //   axios.put(url, request, { headers: authHeader }).then(() => {
      //     console.log('Save Graph')
      //     //visual feedback for the user when graph is saved
      //     const loading = document.getElementById('loading')
      //     loading.style.display = 'block'
      //     const errorMessage = document.getElementById('autosave-message')
      //     errorMessage.style.display = 'none'
      //     setTimeout(function () {
      //       loading.style.display = 'none'
      //       errorMessage.style.display = 'block'
      //     }, 2800)
      //   })
      // })
    },
    centerCanvas() {
      const canvas = this.diagram.get('canvas')
      centerCanvas(canvas)
    },
    changeInput(parameterName, newValue) {
      const propertyToDefine = {}
      propertyToDefine[parameterName] = newValue
      // TODO: Quick fix, as it is not allowed to modify this.elementSelected itself
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
      <p id="autosave-message" class="autosave-message">
        {{ settings.autosave ? 'Auto-Save ist aktiviert.' : 'Auto-Save ist deaktiviert.' }}
      </p>
      <p id="loading" class="loading" style="display: none">Speichern<span>.</span><span>.</span><span>.</span></p>
    </div>
  </div>
</template>

<style scoped>
#graph-viewer {
  height: 100%;
  z-index: 5;
}
.rasterBackground {
  background-color: #fff;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEwLjU4MyAxMC41ODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0ibTAuMDAxMjA4MyAxMC41ODN2LTEwLjU4MyIgZmlsbD0iIzgwODA4MCIgc3Ryb2tlPSIjZGVkZWRlIiBzdHJva2Utd2lkdGg9Ii4yNjciLz48cGF0aCBkPSJtMS4zMjUzZS00IC0wLjAwNDk1NzIgMTAuNTgzIDAuMDA5OTE0MyIgc3Ryb2tlPSIjZGVkZWRlIiBzdHJva2Utd2lkdGg9Ii4yNTQ2N3B4Ii8+PC9nPjwvc3ZnPg==');
  background-position: -1px -1px;
  overflow: hidden;
}

.rasterBackground svg.djs-drag-active:not(.drop-not-ok) {
  background-color: #fff !important;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEwLjU4MyAxMC41ODMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8Zz4KICA8cGF0aCBkPSJtMC4wMDEyMDgzIDEwLjU4M3YtMTAuNTgzIiBmaWxsPSIjODA4MDgwIiBzdHJva2U9IiNkZWRlZGUiIHN0cm9rZS13aWR0aD0iLjI2NyIvPgogIDxnIGZpbGw9Im5vbmUiPgogICA8cGF0aCBkPSJtMS4zMjUzZS00IC0wLjAwNDk1NzIgMTAuNTgzIDAuMDA5OTE0MyIgc3Ryb2tlPSIjZGVkZWRlIiBzdHJva2Utd2lkdGg9Ii4yNTQ2N3B4Ii8+CiAgIDxwYXRoIGQ9Im01LjIyNjMgMC4xMzIyOXYxMC40NTEiIHN0cm9rZT0iI2Y3ZjdmNyIgc3Ryb2tlLXdpZHRoPSIuMjY0NDVweCIvPgogICA8cGF0aCBkPSJtMC4xMzIyOSA1LjIyNTVoMTAuNDUxIiBzdHJva2U9IiNmN2Y3ZjciIHN0cm9rZS13aWR0aD0iLjI2NDg3cHgiLz4KICA8L2c+CiA8L2c+Cjwvc3ZnPgo=') !important;
  background-position: -1px -1px !important;
  overflow: hidden !important;
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
}
.autosave p {
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 200px;
  background: white;
  margin: auto;
  padding: 1%;
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
}
.loading span:nth-child(2) {
  animation-delay: 0.2s;
}
.loading span:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
