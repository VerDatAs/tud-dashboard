<!--
Dashboard for the assistance system developed as part of the VerDatAs project
Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script>
export default {
  name: 'ConfirmationDialog',
  props: {
    cancelTxt: String,
    confirmTxt: String,
    question: String,
    title: String
  },
  emits: ['cancel', 'confirm']
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
        <button class="btn btn-primary" @click="$emit('confirm')">{{ confirmTxt }}</button>
        <button class="btn btn-secondary" @click="$emit('cancel')">{{ cancelTxt }}</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
  background: rgba(77, 77, 77, 0.7);
  transition: all 0.4s;

  .modalHeader {
    margin-bottom: 20px;
  }

  .modalContent {
    border-radius: 4px;
    position: relative;
    width: 500px;
    max-width: 90%;
    background: #fff;
    padding: 0.5em 1em;
  }

  .modalFooter {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e5e5e5;
    text-align: right;

    button {
      margin-left: 5px;
    }
  }

  .modalClose {
    position: absolute;
    top: 5px;
    right: 10px;
    color: #585858;
    text-decoration: none;
    cursor: pointer;
  }
}
</style>
