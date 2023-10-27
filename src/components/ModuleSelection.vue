<script>

export default {
  data: () => ({
    }),
  methods: {
    openTab(evt, tabname) {

      const tabcontent = document.getElementsByClassName("tabcontent");
      for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      const tablinks = document.getElementsByClassName("tablinks");
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      document.getElementById(tabname).style.display = "block";
      evt.target.className += " active";
      
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
      <div class="tab">
        <button class="tablinks active" @click="openTab($event, 'features')">Features</button>
        <button class="tablinks" @click="openTab($event, 'feedback')">Feedback Types</button>
      </div>

      <div id="features" class="tabcontent" style="display: block">
        <h3>Features</h3>
        <div class="list">
          <div>
            Feature 1
          </div>
          <div>
            Feature 2
          </div>
          <div>
            Feature 3
          </div>
          <div>
            ...
          </div>
        </div>
        </div>

      <div id="feedback" class="tabcontent">
        <h3>Feedback Types</h3>
        <div class="list">
          <div>
            <input type="checkbox"/>
            Feedback Type 1
          </div>
        <div>
            <input type="checkbox"/>
            Feedback Type 2
          </div>
          <div>
            <input type="checkbox"/>
            Feedback Type 3
          </div>
          <div>
            ...
        </div>
        <button class="save">Save</button>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#module-selection {
  z-index: 115;
  position: absolute;
  top: 15%;
  left: 15%;
  height: calc(100% - 30%);
  width: calc(100% - 30%);
  background: #eee;
  border: 1px solid #ccc;
  }
.tab {
  overflow: hidden;
}

.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
}

.tab button:hover {
  background-color: #ddd;
}

.tab button.active {
  background-color: #ccc;
}

.tabcontent {
  display: none;
  padding: 6px 12px;
}

.save {
  margin-top: 5%;
}
</style>