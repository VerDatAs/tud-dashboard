<script>
import { useDebuggerStore } from '@/stores/settings'

export default {
  data() {
    return {
      debugging: useDebuggerStore(),
    } 
  },
  props: {
    autosave: Boolean,
  },
  computed: {
    autosavecmp: {
      get: function() {
        return this.autosave;
      },
      set: function(val) {
        this.$emit('toggleAutosave')
      },
    }
  }
}
</script>

<template>
  <div id="settings">
    <div class="container py-4" style="max-width: 100%">
        <h1>Settings</h1>
        <div class="setting">
            <input type="checkbox" v-model="autosavecmp"/>
            Auto-Save
            <font-awesome-icon class="icon" icon="circle-info" size="md" title="This activates the Auto-Save function, which will save your changes when working with the Knowledge Structure every ... seconds."/>
        </div>
        <div class="setting">
            <input type="checkbox" v-model="debugging.debuggingMode" @click="debugging.toggleDebuggingMode()"/>
            Debugging Mode
            <font-awesome-icon class="icon" icon="circle-info" size="md" title="This actives the debugging mode which currently allows you to download and redraw the graph in the Knowledge Structure component."/>
        </div>
    </div>
  </div>
</template>

<style scoped>
#settings {
  margin-left: 5%;
}

.setting {
  margin-top: 5px;
}

.icon {
  cursor: pointer;
}
</style>