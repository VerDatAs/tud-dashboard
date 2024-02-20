<script>
</script>
<template>
  <div id="legend">
    <strong>Legende:</strong>
    <ul>
      <li>
        <span class="me-1 dashed-info-border"></span> Startpunkt
      </li>
      <li>
        <span class="me-1 in-progress"></span> Bearbeitet
      </li>
      <li>
        <span class="me-1 passed"></span> Richtig beantwortet
      </li>
      <li>
        <span class="me-1 failed"></span> Falsch beantwortet
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
  box-shadow: 4px 4px 3px rgba(0, 0, 0, .5);
}

#legend strong {
  text-decoration: underline;
}

#legend ul {
  list-style: none;
  padding-left: 5px;
  margin-bottom: 6px;
}

#legend ul li span {
  display: inline-block;
  padding: 5px;
  border-radius: 5px;
  height: 10px;
}

#legend ul li span.dashed-info-border {
  padding: 3px;
  border-radius: 2px;
  border: 2px dotted var(--info);
  margin-right: .3rem !important;
}

#legend ul li span.in-progress {
  background: var(--in-progress);
}

#legend ul li span.passed {
  background: var(--passed);
}

#legend ul li span.failed {
  background: var(--failed);
}
</style>
