<script>
import axios from 'axios'
import { Base64 } from 'js-base64'
import {
  centerCanvas,
  excludedTypeNames,
  getDefaultSize,
  initialModel,
  nonSelectableElements
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
    graphStore: useGraphStore()
  }),
  props: {
    backendUrl: String,
    courseNode: Object,
    token: String,
    diagram: Object,
    diagramLoaded: Boolean,
    elementSelected: Object,
    canViewOnly: Boolean
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
        .then((graphResponse) => {
          // Handle response
          console.log('graph data', graphResponse.data)
          if (graphResponse.data?.lcos) {
            const courseTitle = this.getAttributeValue(this.courseNode, 'title')
            this.graph = initialModel(encodedId, courseTitle)
            this.processKnowledgeGraph()
            setTimeout(() => {
              if (graphResponse.data?.lcos[0]) {
                const courseNode = graphResponse.data.lcos[0]
                this.$emit('updateCourseNode', courseNode)
                this.redrawKnowledgeGraph()
              } else {
                // the course node is transferred for the first time
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
            }, 100)
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
    processKnowledgeGraph() {
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
        .then(() => {
          // After importing xml:
          // Center canvas
          centerCanvas(canvas)

          // Update objectId of topic
          if (!this.canViewOnly) {
            const knowledgeGraphTopic = elementRegistry.filter((element) => element.type === 'verDatAs:Topic')[0]
            const properties = {}
            properties['objectId'] = this.courseNode.objectId
            modeling.updateProperties(knowledgeGraphTopic, properties)

            // Listen to selection changes and show propertiesPanel, inputs and listen for input changes
            eventBus.on('selection.changed', (e) => {
              const element = e.newSelection[0]
              if (element && !nonSelectableElements.includes(element.type)) {
                this.$emit('selectedElement', element)
              } else {
                this.$emit('selectedElement', null)
                //try to auto-save the graph after not selecting another graph element if activated in the settings
                if (this.settings.autosave) {
                  this.saveKnowledgeGraph()
                }
              }
            })
          } else {
            // TODO: Remove, if implemented by VSG
            eventBus.on('element.click', (e) => {
              const element = e.element
              if (element?.businessObject?.objectId) {
                // Hold objectId's locally for demonstration purposes
                const objectId = element.businessObject.objectId
                // Check string, whether it contains a valid URL
                if (objectId.includes('http://') || objectId.includes('https://')) {
                  let visitedObjects = []
                  if (localStorage.getItem('visitedObjects')) {
                    visitedObjects = JSON.parse(localStorage.getItem('visitedObjects'))
                  }
                  if (!visitedObjects.includes(objectId)) {
                    visitedObjects.push(objectId)
                  }
                  localStorage.setItem('visitedObjects', JSON.stringify(visitedObjects))
                  // Open on click
                  window.open(element.businessObject.objectId, '_self')
                }
              }
            })
            // Add markers for highlighting the visitedObjects
            if (localStorage.getItem('visitedObjects')) {
              const elementsToHighlight = JSON.parse(localStorage.getItem('visitedObjects'))
              elementRegistry.forEach((elem) => {
                if (elementsToHighlight.includes(elem?.businessObject?.objectId)) {
                  canvas.addMarker(elem, 'highlight')
                }
              })
            }
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

          // Set that the initial diagram was loaded once
          // Add timeout to avoid loading artifacts
          setTimeout(() => {
            this.$emit('loadedDiagram', true)
          }, 250)
        })
    },
    redrawKnowledgeGraph() {
      console.log('redrawKnowledgeGraph', this.courseNode)
      if (!this.courseNode?.lcoType || !this.courseNode?.objectId) {
        return
      }

      const encodedId = Base64.encodeURI(this.courseNode.objectId)
      const courseName = this.getAttributeValue(this.courseNode, 'name') ?? 'Unknown'

      // First, initialize modeler
      this.loadInitialModel(this.diagram, encodedId, courseName).then(() => {
        // Retrieve general diagram-js controls
        const canvas = this.diagram.get('canvas')
        const moddle = this.diagram.get('moddle')
        const modeling = this.diagram.get('modeling')
        const elementFactory = this.diagram.get('elementFactory')
        const elementRegistry = this.diagram.get('elementRegistry')

        if (modeling) {
          // Replace objectId of the topic and set its title as a label
          const knowledgeGraphTopic = elementRegistry.find((element) => element.type === 'verDatAs:Topic')
          const knowledgeGraphTopicLabel = elementRegistry.find(
            (element) => element.id === knowledgeGraphTopic.label?.id
          )
          const properties = {}
          properties['objectId'] = this.courseNode.objectId
          modeling.updateProperties(knowledgeGraphTopic, properties)
          const topicTitle = this.getAttributeValue(this.courseNode, 'title') ?? 'Topic'
          modeling.updateLabel(knowledgeGraphTopic, topicTitle)

          // Add tests to KnowledgeGraph
          const rootElement = canvas.getRootElement()

          let tests = this.getAttributeValue(this.courseNode, 'tests')
          if (tests?.length > 0) {
            tests = tests.filter((m) => this.getAttributeValue(m, 'offline') === false)
            const knowledgeGraphTests = []
            tests?.forEach((test, testIndex) => {
              const learningPathElementObject = this.diagram.get('moddle').create('verDatAs:Test', {
                objectId: test.objectId || 'test' + (testIndex + 1),
                title: this.getAttributeValue(test, 'title') || 'Test ' + (testIndex + 1)
              })
              knowledgeGraphTests.push(learningPathElementObject)
            })
            this.diagram.get('modeling').updateProperties(rootElement, { tests: knowledgeGraphTests })
          }

          // GENERAL IDEA: Draw first and center afterward
          // Define dimensions, offsets and initial positions
          const topicDimensions = getDefaultSize(knowledgeGraphTopic)
          const topicWidth = topicDimensions.width
          const topicHeight = topicDimensions.height

          const offsetBetweenLayers = 160

          const moduleWidth = getDefaultSize('verDatAs:Module').width
          const initialModulePosition = knowledgeGraphTopic.y + topicHeight + (2 * offsetBetweenLayers) / 3

          const chapterWidth = getDefaultSize('verDatAs:Chapter').width
          const chapterOffset = 10
          let chapterPositionX = 0

          const taskWidth = getDefaultSize('verDatAs:InteractiveTask').width

          const offset = 70
          let totalWidth = 0

          // Reduce list of modules to those that are currently set online
          let filteredModules = []
          const courseModules = this.getAttributeValue(this.courseNode, 'modules')
          if (courseModules?.length > 0) {
            filteredModules = courseModules.filter((m) => this.getAttributeValue(m, 'offline') === false)
          }

          // Iterate remaining modules
          filteredModules?.forEach((module, moduleIndex) => {
            const moduleChapters = this.getAttributeValue(module, 'chapters')
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
              x: chapterPositionX + totalChapterWidth / 2, // "- moduleWidth / 2" is not longer necessary, as the middle has to be defined
              y: initialModulePosition
            }
            const moduleDimensions = getDefaultSize(moduleType.type)
            const moduleAttributes = { ...modulePosition, ...moduleDimensions, ...moduleType }
            const moduleShape = elementFactory.create('shape', moduleAttributes)
            canvas.addShape(moduleShape)

            // Add it to the modeling object of the knowledgeGraphTopic
            const existingModules = knowledgeGraphTopic.businessObject?.modules ?? []
            existingModules.push(moduleShape.businessObject)
            modeling.updateProperties(knowledgeGraphTopic, { modules: existingModules })

            // Update objectId and label
            const moduleProperties = {}
            moduleProperties['objectId'] = module.objectId
            modeling.updateProperties(moduleShape, moduleProperties)

            const moduleTitle = this.getAttributeValue(module, 'title') ?? 'Module ' + (moduleIndex + 1)
            modeling.updateLabel(moduleShape, moduleTitle)

            // Draw connection to the topic
            modeling.connect(knowledgeGraphTopic, moduleShape)

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
                y: modulePosition.y + offsetBetweenLayers
              }
              const chapterDimensions = getDefaultSize(chapterType.type)
              const chapterAttributes = { ...chapterPosition, ...chapterDimensions, ...chapterType }
              const chapterShape = elementFactory.createShape(chapterAttributes)
              canvas.addShape(chapterShape)

              // Set title of the chapter
              const chapterTitle = this.getAttributeValue(chapter, 'title') ?? 'Chapter ' + (chapterIndex + 1)
              modeling.updateLabel(chapterShape, chapterTitle)

              // Add it to the modeling object of the knowledgeGraphTopic
              const existingChapters = moduleShape.businessObject?.chapters ?? []
              existingChapters.push(chapterShape.businessObject)
              modeling.updateProperties(moduleShape, { chapters: existingChapters })

              // Update objectId and contentPages
              const chapterProperties = {}
              chapterProperties['objectId'] = chapter.objectId

              // Iterate contentPages of the chapter
              const contentPages = []
              let taskIndex = 0
              this.getAttributeValue(chapter, 'contentPages')?.forEach((page, pageIndex) => {
                let taskShapesBusinessObjects = []
                const pageProperties = {
                  objectId: page.objectId,
                  title: this.getAttributeValue(page, 'title') || 'ContentPage ' + (pageIndex + 1)
                }
                // Iterate interactiveTasks of the contentPage
                this.getAttributeValue(page, 'interactiveTasks')?.forEach((interactiveTask, interactiveTaskIndex) => {
                  const taskType = {
                    type: 'verDatAs:InteractiveTask'
                  }
                  const taskPosition = {
                    x: currentChapterPositionX + 10,
                    y:
                      chapterShape.y +
                      chapterShape.height +
                      offsetBetweenLayers / 2 +
                      taskIndex * (offset / 2 + taskWidth / 2 + 15) // TODO: Rework necessary, as this does not make sense
                  }
                  const taskDimensions = getDefaultSize(taskType.type)
                  const taskAttributes = { ...taskPosition, ...taskDimensions, ...taskType }
                  const taskShape = elementFactory.createShape(taskAttributes)
                  taskShape.businessObject.objectId = interactiveTask.objectId
                  canvas.addShape(taskShape)
                  // set title of the task and connect it to the chapter shape
                  const taskTitle =
                    this.getAttributeValue(interactiveTask, 'title') ?? 'Task ' + (interactiveTaskIndex + 1)
                  modeling.updateLabel(taskShape, taskTitle)
                  modeling.connect(chapterShape, taskShape)
                  taskIndex += 1
                  taskShapesBusinessObjects.push(taskShape.businessObject)
                })
                pageProperties.interactiveTasks = taskShapesBusinessObjects

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
            // Draw topic
            if (moduleIndex === filteredModules.length - 1) {
              // Move topic
              // TODO: This somehow does not move the label of the topic
              modeling.moveElements([knowledgeGraphTopic], {
                x: totalWidth / 2 - topicWidth / 2 - knowledgeGraphTopic.x,
                y: 90 - knowledgeGraphTopic.y // 90 is the position set on initialization
              })
              // Move topic label
              modeling.moveElements([knowledgeGraphTopicLabel], {
                x: totalWidth / 2 - knowledgeGraphTopicLabel.width / 2 - knowledgeGraphTopicLabel.x,
                // TODO: Currently, no offset is used
                y: 90 + knowledgeGraphTopic.height - knowledgeGraphTopicLabel.y // 90 + height + offset of label
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
      const topics = elementRegistry.filter((element) => element.type === 'verDatAs:Topic')
      if (!topics || topics.length === 0) {
        console.error('No topic has been defined so far.')
        return
      }
      const knowledgeGraphTopic = topics[0]
      if (!knowledgeGraphTopic?.businessObject?.objectId || knowledgeGraphTopic.businessObject.objectId === '') {
        console.log('No objectId defined for topic.')
        return
      }
      const topicBusinessObject = knowledgeGraphTopic.businessObject

      // TODO: Add other attributes that can be set by the editor
      const supportedAttributeKeys = [
        'title',
        'name',
        'description',
        'offline',
        'content',
        'processingTime'
      ]

      const nestedChildrenKeys = [
        'modules',
        'chapters',
        'contentPages',
        'interactiveTasks'
      ]

      const childKeyToLcoType = {
        'verDatAs:Topic': 'ILIAS_COURSE',
        'verDatAs:Module': 'ILIAS_MODULE',
        'verDatAs:Chapter': 'ILIAS_CHAPTER',
        'verDatAs:ContentPage': 'ILIAS_CONTENT_PAGE',
        'verDatAs:InteractiveTask': 'ILIAS_INTERACTIVE_TASK'
      }

      const attributeObject = (key, value) => {
        return { key, value }
      }

      const iterateAttributes = (currentBusinessObject, iterationDepth) => {
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
          if (supportedAttributeKeys.includes(attrKey)) {
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

      const genericCourseFormatRequest = iterateAttributes(topicBusinessObject)
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
      //   console.log('Test', graphs)
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
    },
    getAttributeValue(dataObject, key) {
      return dataObject?.attributes?.find((attr) => attr.key === key)?.value
    }
  }
}
</script>

<template>
  <div id="graph-viewer" class="rasterBackground" :class="canViewOnly ? 'canViewOnly' : ''">
    <div v-if="!canViewOnly && showEmptyMessage" class="empty">
      <p class="empty-message">
        Bitte fügen Sie Lerninhalte wie Module, Kapitel und Tests hinzu, um diese hier zu visualisieren.
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
