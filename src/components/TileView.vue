<script>
export default {
  props: {
    currentView: String,
    viewOnly: Boolean,
    previewMode: Boolean
  },
  methods: {
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
      }
    }
  }
}
</script>

<template>
  <div id="tile-view" class="rasterBackground" v-if="currentView === 'tileView' && !viewOnly">
    <div style="position: absolute; top: 10px; left: 10px" v-if="previewMode">
      Note: <span style="font-style: italic">As you are in edit mode, this is just a preview.</span>
    </div>
    <div class="row row-flex row-flex-wrap tile-row">
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 tile-col">
        <div class="flex-col flex-grow tile-flex-col">
          <button
            class="btn btn-default tile-btn"
            @click="setCurrentView('knowledgeStructure')"
            :disabled="previewMode"
          >
            Knowledge structure
          </button>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 tile-col">
        <div class="flex-col flex-grow tile-flex-col">
          <button class="btn btn-default tile-btn" @click="setCurrentView('moduleSelection')" :disabled="previewMode">
            Choose modules
          </button>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 tile-col">
        <div class="flex-col flex-grow tile-flex-col">
          <button
            class="btn btn-default tile-btn"
            @click="setCurrentView('learningPathManager')"
            :disabled="previewMode"
          >
            Learning paths
          </button>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 tile-col">
        <div class="flex-col flex-grow tile-flex-col">
          <button class="btn btn-default tile-btn" :disabled="previewMode">Settings</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#tile-view {
  z-index: 110;
  position: absolute;
  top: 15px;
  left: 15px;
  height: calc(100% - 30px);
  width: calc(100% - 30px);
  background: #eee;
  border: 1px solid #ccc;
}

.tile-row {
  height: 100%;
}

.tile-col {
  height: 50%;
}

.tile-flex-col {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tile-btn {
  height: 80px;
  width: 80%;
}
</style>
