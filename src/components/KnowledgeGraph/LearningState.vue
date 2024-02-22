<template>
  <div id="learningState">
    <strong>Lernstand:</strong>
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
#learningState {
  position: absolute;
  top: -1px;
  right: 0;
  z-index: 6;
  background: #fff;
  padding: 10px 16px 10px 10px;
  border: 1px solid #ddd;
  box-shadow: -3px 3px 3px rgba(0, 0, 0, .3);
}

#learningState strong {
  margin-left: 5px;
  text-decoration: underline;
}

#learningState ul {
  list-style: none;
  font-size: 0.825rem;
  padding-left: 5px;
  margin-top: 10px;
  margin-bottom: 6px;
}

#learningState ul li {
  height: 22px;
}

#learningState ul li span {
  display: inline-block;
  padding: 5px;
  border-radius: 5px;
  height: 10px;
}

#learningState ul li span.dashed-info-border {
  padding: 3px;
  border-radius: 2px;
  border: 2px dotted var(--info);
  margin-right: .3rem !important;
}

#learningState ul li span.in-progress {
  background: var(--in-progress);
}

#learningState ul li span.passed {
  background: var(--passed);
}

#learningState ul li span.failed {
  background: var(--failed);
}
</style>
