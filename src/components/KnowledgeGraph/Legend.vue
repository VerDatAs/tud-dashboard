<script>
</script>
<template>
  <div id="legend">
    <strong>Legende:</strong>
    <ul>
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

  strong {
    text-decoration: underline;
  }

  ul {
    list-style: none;
    padding-left: 5px;
    margin-bottom: 6px;

    li span {
      display: inline-block;
      padding: 5px;
      border-radius: 5px;
      height: 10px;

      &.in-progress {
        background: var(--in-progress)
      }

      &.passed {
        background: var(--passed)
      }

      &.failed {
        background: var(--failed)
      }
    }
  }
}
</style>
