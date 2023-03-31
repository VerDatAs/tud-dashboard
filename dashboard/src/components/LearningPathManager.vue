<script>
const selectableElements = ['verDatAs:Chapter']

export default {
  data: () => ({
    // forcing computed values to recompute: https://stackoverflow.com/a/70737805/3623608
    refreshKey: 0
  }),
  props: {
    diagram: Object
  },
  computed: {
    elementOptions() {
      this.refreshKey
      // idea: chapters include contentPages as parameters
      const chapters = this.diagram
        ?.get('elementRegistry')
        ?.filter((element) => selectableElements.includes(element.type))
      let selectableOptions = []
      // Add contentPages to the selectable options
      chapters?.forEach((chapter) => {
        if (chapter?.businessObject?.contentPages?.length > 0) {
          // TODO: ContentPages need a name, too
          selectableOptions = selectableOptions.concat(
            chapter.businessObject.contentPages.map((element) => {
              return {
                text: element.objectId + ' (Chapter: ' + chapter.businessObject.name + ')',
                value: element.objectId
              }
            })
          )
        }
      })
      // Add tests to the selectable options
      this.currentKnowledgeGraph?.businessObject?.tests?.forEach((test, testIndex) => {
        selectableOptions = selectableOptions.concat({
          text: test.objectId + ' (Test: ' + (testIndex + 1) + ')',
          value: test.objectId
        })
      })
      return selectableOptions
    },
    currentKnowledgeGraph() {
      this.refreshKey
      return this.diagram?.get('canvas')?.getRootElement()
    },
    learningPaths() {
      this.refreshKey
      let learningPaths = []
      if (this.currentKnowledgeGraph?.businessObject?.learningPaths) {
        learningPaths = this.currentKnowledgeGraph.businessObject.learningPaths
      }
      return learningPaths
    }
  },
  methods: {
    addLearningPath() {
      const learningPaths = this.currentKnowledgeGraph?.businessObject?.learningPaths ?? []
      // Empty "verDatAs:LearningPathElement"
      const learningPathElementObject = this.diagram.get('moddle').create('verDatAs:LearningPathElement')
      const learningPathObject = this.diagram.get('moddle').create('verDatAs:LearningPath', {
        title: 'LearningPath' + (learningPaths.length + 1),
        learningPathElements: [learningPathElementObject]
      })
      learningPaths.push(learningPathObject)
      this.updateLearningPaths(learningPaths)
    },
    removeLearningPath(index) {
      const learningPaths = this.learningPaths
      this.updateLearningPaths(learningPaths.filter((path, pathIndex) => pathIndex !== index))
    },
    addLearningPathElement(pathIndex) {
      const learningPaths = this.learningPaths
      const currentLearningPath = learningPaths?.[pathIndex]
      const learningPathElements = currentLearningPath?.learningPathElements ?? []
      const learningPathElementObject = this.diagram.get('moddle').create('verDatAs:LearningPathElement')
      learningPathElements.push(learningPathElementObject)
      this.updateLearningPaths(learningPaths)
    },
    removeLearningPathElement(pathIndex, index) {
      const learningPaths = this.learningPaths
      // Remove element with index from learningPathElements
      if (learningPaths?.[pathIndex]?.learningPathElements) {
        learningPaths[pathIndex].learningPathElements =
          learningPaths[pathIndex].learningPathElements?.filter((element, elementIndex) => elementIndex !== index) ?? []
        this.updateLearningPaths(learningPaths)
      }
    },
    setLearningPathTitle(index, title) {
      const learningPaths = this.learningPaths
      learningPaths[index].title = title
      this.updateLearningPaths(learningPaths)
    },
    setLearningPathElementId(pathIndex, pathElementIndex, elementId) {
      const learningPaths = this.learningPaths
      if (learningPaths?.[pathIndex]?.learningPathElements?.[pathElementIndex]) {
        learningPaths[pathIndex].learningPathElements[pathElementIndex].elementId = elementId
      }
      this.updateLearningPaths(learningPaths)
    },
    updateLearningPaths(learningPaths) {
      this.diagram.get('modeling').updateProperties(this.currentKnowledgeGraph, { learningPaths })
      this.refreshKey++
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
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
      }
    }
  }
}
</script>

<template>
  <div id="learning-path-manager">
    <div class="container py-4" style="max-width: 100%">
      <button class="btn btn-primary" @click="setCurrentView('tileView')">Back</button>
      <button class="btn btn-primary ms-2" @click="saveXML">Download</button>
      <hr />
      <h2>
        LearningPath Manager
        <button class="btn btn-primary ms-2" title="Add learning path" @click="addLearningPath">+</button>
      </h2>
      <p v-if="!learningPaths || learningPaths.length === 0" class="alert alert-info">No learning path created yet.</p>
      <div v-if="learningPaths && learningPaths.length > 0">
        <div
          v-for="(learningPath, learningPathIndex) in learningPaths"
          :key="'learningPath' + learningPathIndex"
          class="learning-path mb-2 py-2"
        >
          <div class="close-btn" title="Remove learning path" @click="removeLearningPath(learningPathIndex)">
            &times;
          </div>
          <!-- v-model vs. v-bind:value - https://stackoverflow.com/a/44678583/3623608 -->
          <div class="form-group mx-2">
            <label :for="'learningPathTitle' + learningPathIndex">Title</label>
            <input
              type="text"
              :id="'learningPathTitle' + learningPathIndex"
              class="form-control"
              :value="learningPath.title"
              placeholder="Title of the learning path"
              @change="setLearningPathTitle(learningPathIndex, $event.target.value)"
            />
          </div>
          <div class="form-group mx-2">
            <strong>
              Elements:
              <button
                class="btn btn-primary ms-2"
                title="Add learning path element"
                @click="addLearningPathElement(learningPathIndex)"
              >
                +
              </button>
            </strong>
            <br />
            <p
              v-if="!learningPath.learningPathElements || learningPath.learningPathElements.length === 0"
              class="alert alert-info"
            >
              No learning path elements exist.
            </p>
            <template v-if="learningPath.learningPathElements && learningPath.learningPathElements.length > 0">
              <div
                class="learning-path-element"
                v-for="(learningPathElement, learningPathElementIndex) in learningPath.learningPathElements"
                :key="'learningPathElement' + learningPathIndex + '-' + learningPathElementIndex"
              >
                <div
                  class="close-btn"
                  title="Remove learning path element"
                  @click="removeLearningPathElement(learningPathIndex, learningPathElementIndex)"
                >
                  &times;
                </div>
                <select
                  class="form-control my-2"
                  @change="setLearningPathElementId(learningPathIndex, learningPathElementIndex, $event.target.value)"
                >
                  <option disabled value="">Please select an element</option>
                  <option
                    v-for="(option, optionKey) in elementOptions"
                    :selected="learningPathElement.objectId"
                    :value="option.value"
                    :key="'Option' + learningPathElementIndex + '-' + optionKey"
                  >
                    {{ option.text }}
                  </option>
                </select>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#learning-path-manager {
  z-index: 999;
  position: absolute;
  top: 15px;
  left: 15px;
  height: calc(100% - 30px);
  width: calc(100% - 30px);
  background: #eee;
  border: 1px solid #ccc;
  overflow-y: scroll;
}
.learning-path {
  position: relative;
  background: #fff;
}
.learning-path-element {
  position: relative;
}
.close-btn {
  position: absolute;
  top: 0;
  right: 5px;
  cursor: pointer;
}
</style>
