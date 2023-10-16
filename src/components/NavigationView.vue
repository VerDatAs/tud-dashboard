<script>
export default {
  props: {
    currentView: String,
    viewOnly: Boolean,
    previewMode: Boolean
  },
  data() {
    return {
      showNavigation: false,
    }
  },  
  methods: {
    setCurrentView(viewName) {
      if (viewName && viewName !== '') {
        this.$emit('setCurrentView', viewName)
        this.showNavigation = false;
        document.getElementsByName('tab').forEach( (tab) => 
           tab.classList.remove('active') 
        )
        document.getElementById(viewName).classList.add("active");
      }
    }
  }
}
</script>

<template>
  <div id="menu">
    <font-awesome-icon icon="bars" size="xl" @click="showNavigation = !showNavigation"/> 
  </div>
  <div id="navigation-view" v-show="showNavigation">
    <div style="position: absolute; top: 10px; left: 10px" v-if="previewMode">
      Note: <span style="font-style: italic">As you are in edit mode, this is just a preview.</span>
    </div>
    <div class="tabs">
      <div name="tab" id="knowledgeStructure" class="tab active"
            @click="setCurrentView('knowledgeStructure')"
            :disabled="previewMode"
          >
          <font-awesome-icon class="icon" icon="sitemap" size="lg"/>
            Knowledge structure
      </div>
      <div name="tab" id="moduleSelection" class="tab" @click="setCurrentView('moduleSelection')" :disabled="previewMode">
            <font-awesome-icon class="icon" icon="folder" size="lg"/>
            Choose modules

      </div>
      <div name="tab" id="learningPathManager" class="tab"
            @click="setCurrentView('learningPathManager')"
            :disabled="previewMode"
          >
          <font-awesome-icon class="icon" icon="bezier-curve" size="lg"/>
            Learning paths

      </div>
      <div name="tab" id="settings" class="tab" :disabled="previewMode" @click="setCurrentView('settings')">
            <font-awesome-icon class="icon" icon="gear" size="lg"/>
            Settings
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  margin-top: 15%;
  margin-left: 5%;
}   
.tab {
  cursor: pointer;
  display: block;
  padding: 5% 0 5% 5%;
  width: 95%;
}
.tab:hover {
    background:#c9c7c7;
}
.active {
  background:#c9c7c7;
}
#navigation-view {
  z-index: 120;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 20%;
  background:#dfdddd;
}
#menu{
  cursor: pointer;
  position: absolute;
  top: 1%;
  left: 1%;
  z-index: 130;
}
.icon {
  width: 10%;
  margin-right: 2%;
}
</style>
