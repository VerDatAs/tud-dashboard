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
        :src="path + '/logo.jpg'"
        width="400"
        alt="VerDatAs logo containing both the icon itself as well as the word VerDatAs"
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

  p {
    margin-top: 10px;
    font-size: 20px;
    color: var(--secondary);
    text-align: center;
  }
}
</style>
