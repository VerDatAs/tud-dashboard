<script>
export default {
  name: 'ConfirmationDialog',
  props: [
    'title',
    'question',
    'confirmTxt',
    'cancelTxt'
  ],
  emits: [
    'cancel',
    'confirm'
  ]
}
</script>
<template>
  <div class="confirmationModal">
    <div class="modalContent">
      <div class="modalHeader">
        <h3>{{ title }}</h3>
        <span class="modalClose" @click="$emit('cancel')">&times;</span>
      </div>
      <div class="modalBody">
        {{ question }}
      </div>
      <div class="modalFooter">
        <button class="btn btn-primary" @click="$emit('confirm')" >{{ confirmTxt }}</button>
        <button class="btn btn-secondary" @click="$emit('cancel')">{{ cancelTxt }}</button>
      </div>
    </div>
  </div>
</template>
<style>
.confirmationModal {
  z-index: 9;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(77, 77, 77, .7);
  transition: all .4s;
}

.confirmationModal .modalHeader {
  margin-bottom: 20px;
}

.confirmationModal .modalContent {
  border-radius: 4px;
  position: relative;
  width: 500px;
  max-width: 90%;
  background: #fff;
  padding: 0.5em 1em;
}

.confirmationModal .modalFooter {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e5e5;
  text-align: right;
}

.confirmationModal .modalFooter button {
  margin-left: 5px;
}

.confirmationModal .modalClose {
  position: absolute;
  top: 5px;
  right: 10px;
  color: #585858;
  text-decoration: none;
  cursor: pointer;
}
</style>
