<template>
  <div id="previewContainer">
    <p>Vorschau-Modus</p>
  </div>
</template>

<style scoped>
#previewContainer {
  z-index: 121;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

p {
  font-size: 44px;
  color: var(--secondary);
  text-align: center;
  padding: 10px 20px !important;
  border-radius: 3px;
  background: var(--light);
}
</style>
