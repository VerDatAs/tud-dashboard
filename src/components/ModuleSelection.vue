<script>
import axios from 'axios'
import { Base64 } from 'js-base64'

export default {
  data: () => ({
    initialRunExecuted: false,
    isLoading: false,
    errorResponse: '',
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
  computed: {
    objectId() {
      return this.courseData?.attributes?.find((attr) => attr.key === 'objectId')?.value
    }
  },
  mounted() {
    this.initializeModuleSelection()
  },
  methods: {
    async initializeModuleSelection() {
      this.isLoading = true
      this.errorResponse = ''
      await this.loadFeatures()
      await this.loadCourseFeatures()
      this.isLoading = false
      this.initialRunExecuted = true
    },
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
        const msg = e.message
        this.errorResponse = 'The features could not be loaded. The displayed features are just for demo purposes.'
        if (msg) {
          this.errorResponse += ' ' + msg
        }
        // prototype features
        // TODO: Remove as soon as loading features does work
        this.features = ['glossary', 'SRL']
      }
    },
    async loadCourseFeatures() {
      if (!this.objectId) {
        this.errorResponse = 'The ID of the course could not be retrieved.'
        return
      }

      // example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
      // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
      const encodedId = Base64.encodeURI(this.objectId)
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
        const msg = e.message
        this.errorResponse = 'The course features could not be retrieved.'
        if (msg) {
          this.errorResponse += ' ' + msg
        }
      }
    },
    async selectCourseFeatures() {
      this.errorResponse = ''
      if (!this.objectId) {
        this.errorResponse = 'The ID of the course could not be retrieved.'
        return
      }

      // example: 'http://localhost/goto.php?target=crs_80&client_id=default&obj_id_lrs=314'
      // base64Url: 'aHR0cDovL2xvY2FsaG9zdC9nb3RvLnBocD90YXJnZXQ9Y3JzXzgwJmNsaWVudF9pZD1kZWZhdWx0Jm9ial9pZF9scnM9MzE0'
      const encodedId = Base64.encodeURI(this.objectId)
      const courseFeaturesURL = this.backendURL + '/api/v1/courses/' + encodedId + '/features'

      const authHeader = {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: 'Bearer ' + this.token
      }

      const request = []

      Object.keys(this.selectedFeatures)?.forEach((key) => {
        if (this.selectedFeatures[key]) {
          request.push({
            feature: {
              key
            },
            enabled: true
          })
        }
      })

      try {
        await axios.put(courseFeaturesURL, request, { headers: authHeader })
        await this.loadCourseFeatures()
      } catch (e) {
        console.log(e)
        const msg = e.message
        this.errorResponse = 'The selected course features could not be saved.'
        if (msg) {
          this.errorResponse += ' ' + msg
        }
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
      <button class="btn btn-primary ms-2" @click="initializeModuleSelection()">Reload</button>
      <hr />
      <template v-if="errorResponse !== ''">
        <div class="alert alert-danger">
          {{ errorResponse }}
        </div>
        <hr />
      </template>
      <h2>Module Selection</h2>
      <template v-if="initialRunExecuted">
        <div v-if="isLoading">Loading features...</div>
        <div v-if="!isLoading && features.length === 0">No features found.</div>
        <ul v-if="!isLoading && features.length > 0" class="ps-3" style="list-style: none">
          <li v-for="(feature, key) in features" :key="feature + '_' + key">
            <input type="checkbox" v-model="selectedFeatures[feature]" /> {{ feature }}
          </li>
        </ul>
        <button class="btn btn-primary" @click="selectCourseFeatures()">Select features</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
#module-selection {
  z-index: 115;
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