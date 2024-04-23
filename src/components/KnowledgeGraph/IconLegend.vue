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
import { svgCourse, svgModule, svgChapter, svgInteractiveTask, svgDocumentationTool } from '@/util/GraphHelpers'
export default {
  name: 'IconLegend',
  data: () => ({
    svgCourse,
    svgModule,
    svgChapter,
    svgInteractiveTask,
    svgDocumentationTool
  })
}
</script>

<template>
  <div id="iconLegend">
    <strong>Legende:</strong>
    <ul>
      <li><span v-html="svgCourse"></span> Kurs</li>
      <li><span v-html="svgModule"></span> Lernmodul</li>
      <li><span v-html="svgChapter"></span> Kapitel</li>
      <li><span v-html="svgInteractiveTask"></span> Interaktive Aufgabe</li>
      <li><span v-html="svgDocumentationTool"></span> Lerntagebuch</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
#iconLegend {
  position: absolute;
  top: -1px;
  left: -1px;
  z-index: 6;
  background: #fff;
  padding: 10px 16px 10px 10px;
  border: 1px solid #ddd;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.3);

  strong {
    margin-left: 5px;
    text-decoration: underline;
  }

  ul {
    list-style: none;
    font-size: 0.825rem;
    padding-left: 5px;
    margin-top: 10px;
    margin-bottom: 6px;

    li {
      height: 22px;

      span {
        display: inline-block;
        padding-right: 5px;
        border-radius: 5px;
        height: 10px;
      }
    }
  }
}
</style>
