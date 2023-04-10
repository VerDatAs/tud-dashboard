<script>
import axios from 'axios'

export default {
  data: () => ({
    features: [],
    courseFeatures: [],
    // This is just a workaround for making both courseFeatures and checkboxes map working
    selectedFeatures: {}
  }),
  props: {
    backendURL: String,
    courseData: Object,
    token: String,
    diagram: Object
  },
  async mounted() {
    await this.loadFeatures()
    await this.loadCourseFeatures()
  },
  methods: {
    async loadFeatures() {
      const featuresURL = this.backendURL + '/api/v1/features'

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      try {
        const featuresResult = await axios.get(featuresURL, { headers: authHeader })
        this.features = featuresResult.data
      } catch (e) {
        console.log(e)
        // prototype features
        // TODO: Remove as soon as loading features does work
        this.features = ['glossary', 'SRL']
      }
    },
    async loadCourseFeatures() {
      const objectId = this.courseData['object_id']
      if (!objectId) {
        return
      }

      // example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
      // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
      const encodedId = btoa(objectId)
      const courseFeaturesURL = this.backendURL + '/api/v1/courses/' + encodedId + '/features'

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      try {
        const courseFeaturesResult = await axios.get(courseFeaturesURL, { headers: authHeader })
        this.courseFeatures = courseFeaturesResult.data
        this.selectedFeatures = {}
        // example: [ { "feature": { "key": "SRL" }, "enabled": true }, { "feature": { "key": "glossary" }, "enabled": true } ]
        this.courseFeatures?.forEach((courseFeature) => {
          if (courseFeature.enabled) {
            this.selectedFeatures[courseFeature.feature.key] = true
          }
        })
      } catch (e) {
        console.log(e)
      }
    },
    async selectCourseFeature() {
      const objectId = this.courseData['object_id']
      if (!objectId) {
        return
      }

      // example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
      // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
      const encodedId = btoa(objectId)
      const courseFeaturesURL = this.backendURL + '/api/v1/courses/' + encodedId + '/features'

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      const request = []

      Object.keys(this.selectedFeatures)?.forEach(key => {
        if (this.selectedFeatures[key]) {
          request.push({
            "feature": {
              key
            },
            "enabled": true
          })
        }
      })

      try {
        await axios.put(courseFeaturesURL, request, { headers: authHeader })
        await this.loadCourseFeatures()
      } catch (e) {
        console.log(e)
      }
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
  <div id="module-selection">
    <div class="container py-4" style="max-width: 100%">
      <button class="btn btn-primary" @click="setCurrentView('tileView')">Back</button>
      <button class="btn btn-primary ms-2" @click="loadCourseFeatures()">Reload</button>
      <hr />
      <h2>
        Module Selection
      </h2>
      <ul v-if="features.length > 0">
        <li v-for="(feature, key) in features" :key="feature + '_' + key">
          {{ feature }} <input type="checkbox" v-model="selectedFeatures[feature]" />
        </li>
      </ul>
      <button class="btn btn-primary" @click="selectCourseFeature()">Select course feature</button>
    </div>
  </div>
</template>

<style scoped>
#module-selection {
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
</style>
