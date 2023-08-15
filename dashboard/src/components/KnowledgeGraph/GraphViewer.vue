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

export default {
  data: () => ({
    graph: ''
  }),
  props: {
    backendURL: String,
    courseData: Object,
    token: String,
    diagram: Object,
    diagramLoaded: Boolean,
    elementSelected: Object,
    viewOnly: Boolean
  },
  created() {
    this.createGraphListener()
  },
  methods: {
    createGraphListener() {
      document.addEventListener('init-graph', (event) => {
        // https://github.com/vaadin/vaadin-upload/issues/138#issuecomment-266773430
        console.log('init-graph', event.detail)
        const { detail } = event
        const backendURL = detail.backendURL
        this.$emit('setBackendURL', backendURL)
        const token = detail.token
        this.$emit('setToken', token)
        const courseData = detail.courseNode
        this.$emit('setCourseData', courseData)
        this.$emit('updateViewOnly', detail.canViewOnly)
        this.$emit('setPreviewMode', detail.previewMode)
        if (courseData?.ref_id) {
          this.retrieveKnowledgeGraph(courseData, backendURL, token)
        } else {
          console.error('There was no ref_id found for the course.')
        }
      })
    },
    async retrieveKnowledgeGraph(courseData, backendURL, token) {
      const objectId = courseData['object_id']
      if (!objectId) {
        return
      }

      // check whether knowledge_structure exist for the given ref_id
      // yes? -> initialize modeler with the resulting diagram
      // example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
      // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
      const encodedId = Base64.encodeURI(objectId)
      const knowledgeGraphUrl = backendURL + '/api/v1/courses/' + encodedId + '/knowledge-graph'
      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + token
      }
      axios
        .get(knowledgeGraphUrl, { headers: authHeader })
        .then((graphResponse) => {
          // Handle response
          console.log(graphResponse.data)
          if (graphResponse.data.graph) {
            this.graph = graphResponse.data.graph
            this.processKnowledgeGraph(courseData)
          }
        })
        .catch((err) => {
          // Handle errors
          console.error(err)
          this.graph = initialModel(encodedId)
          this.processKnowledgeGraph(courseData)
        })
    },
    processKnowledgeGraph(courseData) {
      // console.log(graphResponse);
      if (!this.diagramLoaded && this.graph) {
        let diagram = null
        if (!this.viewOnly) {
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
            if (!this.viewOnly) {
              const knowledgeGraphTopic = elementRegistry.filter((element) => element.type === 'verDatAs:Topic')[0]
              const properties = {}
              properties['objectId'] = courseData['object_id']
              modeling.updateProperties(knowledgeGraphTopic, properties)

              // Listen to selection changes and show propertiesPanel, inputs and listen for input changes
              eventBus.on('selection.changed', (e) => {
                const element = e.newSelection[0]
                if (element && !nonSelectableElements.includes(element.type)) {
                  this.$emit('selectedElement', element)
                } else {
                  this.$emit('selectedElement', null)
                }
              })
            } else {
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
            this.$emit('loadedDiagram', true)
          })
      }
    },
    redrawKnowledgeGraph() {
      console.log('redrawKnowledgeGraph', this.courseData)
      if (!this.courseData || !this.courseData['ref_id'] || !this.courseData['object_id']) {
        return
      }

      const objectId = this.courseData['object_id']
      const encodedId = Base64.encodeURI(objectId)

      // First, initialize modeler
      this.loadInitialModel(this.diagram, encodedId).then(() => {
        // Replace objectId of topic
        const canvas = this.diagram.get('canvas')
        const moddle = this.diagram.get('moddle')
        const modeling = this.diagram.get('modeling')
        const elementFactory = this.diagram.get('elementFactory')
        const elementRegistry = this.diagram.get('elementRegistry')

        if (modeling) {
          const knowledgeGraphTopic = elementRegistry.find((element) => element.type === 'verDatAs:Topic')
          const knowledgeGraphTopicLabel = elementRegistry.find(
            (element) => element.id === knowledgeGraphTopic.label?.id
          )
          const properties = {}
          properties['objectId'] = this.courseData['object_id']
          modeling.updateProperties(knowledgeGraphTopic, properties)
          const topicTitle = this.courseData.title ?? 'Topic'
          modeling.updateLabel(knowledgeGraphTopic, topicTitle)

          // Next, try to redraw the knowledge graph
          const courseRefId = this.courseData['ref_id']

          // Get dimensions of the editor
          const editorContainer = document.getElementById('graph-viewer')
          const editorWidth = editorContainer.offsetWidth

          // Insert elements
          const parentElement = elementRegistry.find((element) => element.type === 'verDatAs:KnowledgeGraph')
          const rootElement = canvas.getRootElement()

          // Add tests to KnowledgeGraph
          let tests = this.courseData['tests']
          if (tests?.length > 0) {
            tests = tests.filter((m) => m.offline === '0')
            const knowledgeGraphTests = []
            tests?.forEach((test, testIndex) => {
              const learningPathElementObject = this.diagram.get('moddle').create('verDatAs:Test', {
                objectId: test['object_id'] || test['ref_id'],
                title: test.title || 'Test ' + (testIndex + 1)
              })
              knowledgeGraphTests.push(learningPathElementObject)
            })
            this.diagram.get('modeling').updateProperties(rootElement, { tests: knowledgeGraphTests })
          }

          // General idea: Draw first and center afterwards
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
          if (this.courseData.modules && this.courseData.modules.length > 0) {
            filteredModules = this.courseData.modules.filter((m) => m.offline === '0')
          }

          // Iterate remaining modules
          filteredModules?.forEach((module, moduleIndex) => {
            const chapterCount = module?.chapters?.length || 0
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
            moduleProperties['objectId'] = module['object_id']
            modeling.updateProperties(moduleShape, moduleProperties)

            const moduleTitle = module.title ?? 'Module'
            modeling.updateLabel(moduleShape, moduleTitle)

            // Draw connection to the topic
            modeling.connect(knowledgeGraphTopic, moduleShape)

            // Iterate chapters of module
            module?.chapters?.forEach((chapter, chapterIndex) => {
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
              const chapterTitle = chapter.title ?? 'Chapter'
              modeling.updateLabel(chapterShape, chapterTitle)

              // Add it to the modeling object of the knowledgeGraphTopic
              const existingChapters = moduleShape.businessObject?.chapters ?? []
              existingChapters.push(chapterShape.businessObject)
              modeling.updateProperties(moduleShape, { chapters: existingChapters })

              // Update objectId, contentPages and label
              const chapterProperties = {}
              chapterProperties['objectId'] = chapter['object_id']

              // Iterate contentPages and its interactive tasks
              const contentPages = []
              let taskIndex = 0
              chapter['pages']?.forEach((page, pageIndex) => {
                let taskShapesBusinessObjects = []
                const pageProperties = {
                  objectId: page['object_id'],
                  title: page.title || 'ContentPage ' + (pageIndex + 1)
                }
                // Add interactiveTasks here
                if (page?.interactiveTasks?.length > 0) {
                  page.interactiveTasks.forEach((interactiveTask) => {
                    const taskType = {
                      type: 'verDatAs:InteractiveTask'
                    }
                    const taskPosition = {
                      x: currentChapterPositionX + 10,
                      y:
                        chapterShape.y +
                        chapterShape.height +
                        offsetBetweenLayers / 2 +
                        taskIndex * (offset / 2 + taskWidth / 2 + 15) // TODO: Rework
                    }
                    const taskDimensions = getDefaultSize(taskType.type)
                    const taskAttributes = { ...taskPosition, ...taskDimensions, ...taskType }
                    const taskShape = elementFactory.createShape(taskAttributes)
                    taskShape.businessObject.objectId = interactiveTask['object_id']
                    canvas.addShape(taskShape)
                    // set title of the task and connect it to the chapter shape
                    const taskTitle = interactiveTask.title ?? 'Task'
                    modeling.updateLabel(taskShape, taskTitle)
                    modeling.connect(chapterShape, taskShape)
                    taskIndex += 1
                    taskShapesBusinessObjects.push(taskShape.businessObject)
                  })
                  pageProperties.interactiveTasks = taskShapesBusinessObjects
                }

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

          // Center diagram in the final step
          centerCanvas(canvas)
        }
      }, 500)
    },
    loadInitialModel(underlyingDiagram, encodedId) {
      // Import initial diagram into the modeler
      return underlyingDiagram.importXML(initialModel(encodedId), 'RootGraph_1').catch(function (err) {
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
      if (knowledgeGraphTopic?.businessObject?.objectId && knowledgeGraphTopic.businessObject.objectId !== '') {
        // example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
        // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
        const encodedId = Base64.encodeURI(knowledgeGraphTopic.businessObject.objectId)
        const url = this.backendURL + '/api/v1/courses/' + encodedId + '/knowledge-graph'

        const authHeader = {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: 'Bearer ' + this.token
        }

        this.diagram.saveXML({ format: true }).then(function (result) {
          const request = {
            graph: result.xml,
            format: 'XML'
          }
          axios.put(url, request, { headers: authHeader }).then(() => {
            console.log('Save Graph')
          })
        })
      } else {
        console.log('No objectId defined for topic.')
      }
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
  <div id="graph-viewer" class="rasterBackground" :class="viewOnly ? 'viewOnly' : ''"></div>
</template>

<style scoped>
#graph-viewer {
  height: 100%;
  z-index: 997; /* z-index: 1001; */
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
</style>
