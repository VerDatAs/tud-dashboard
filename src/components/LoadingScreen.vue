<script>
export default {
  props: {
    diagramLoaded: Boolean,
    path: String
  }
}
</script>

<template>
  <div id="loadingScreen" v-if="!diagramLoaded">
    <div>
      <img
        :src="path + '/logo.jpeg'"
        width="400"
        alt="VerDatAs logo containing both the icon itself as well as the text VerDatAs"
      />
      <p>lädt ...</p>
    </div>
  </div>
</template>

<style scoped>
#loadingScreen {
  z-index: 10;
  position: absolute;
  height: 100%;
  width: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

p {
  margin-top: 10px;
  font-size: 20px;
  color: #00517d;
  text-align: center;
}
</style>
