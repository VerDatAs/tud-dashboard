<script>
import { svgCourse, svgModule, svgChapter, svgInteractiveTask, svgDocumentationTool } from '@/util/GraphHelpers'
export default {
  name: 'Legend',
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
  <div id="legend">
    <strong>Legende:</strong>
    <ul>
      <li>
        <span v-html="svgCourse"></span> Kurs
      </li>
      <li>
        <span v-html="svgModule"></span> Lernmodul
      </li>
      <li>
        <span v-html="svgChapter"></span> Kapitel
      </li>
      <li>
        <span v-html="svgInteractiveTask"></span> Interaktive Aufgabe
      </li>
      <li>
        <span v-html="svgDocumentationTool"></span> Lerntagebuch
      </li>
    </ul>
  </div>
</template>

<style scoped>
#legend {
  position: absolute;
  top: -1px;
  left: -1px;
  z-index: 6;
  background: #fff;
  padding: 10px 16px 10px 10px;
  border: 1px solid #ddd;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, .3);
}

#legend strong {
  margin-left: 5px;
  text-decoration: underline;
}

#legend ul {
  list-style: none;
  font-size: 0.825rem;
  padding-left: 5px;
  margin-top: 10px;
  margin-bottom: 6px;
}

#legend ul li {
  height: 22px;
}

#legend ul li span {
  display: inline-block;
  padding-right: 5px;
  border-radius: 5px;
  height: 10px;
}
</style>
