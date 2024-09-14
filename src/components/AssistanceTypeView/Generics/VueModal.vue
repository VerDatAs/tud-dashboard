<script setup lang="ts">
import { CModalManager, SDefaultModal } from '@/util/AssistanceType/modalHelper'
import { inject } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The title of the modal */
    symbol?: Symbol
    title?: string
    divider?: boolean
    closeOnBackgroundClick?: boolean
  }>(),
  {
    symbol: () => SDefaultModal,
    divider: true,
    closeOnBackgroundClick: true
  }
)

const { hideModal } = inject(props.symbol, () => new CModalManager(), true)

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <Teleport to="#verdatas-dashboard">
    <div v-bind="$attrs">
      <div class="background" @click.self="closeOnBackgroundClick ? hideModal() : ''"></div>
      <slot name="override">
        <div class="at-modal">
          <slot name="window">
            <div class="modal-title">
              <slot name="title">
                <p>{{ title }}</p>
              </slot>
            </div>
            <div v-if="divider" class="divider"></div>
            <div class="modal-main">
              <slot name="default"></slot>
            </div>
            <slot name="close-icon">
              <div class="close-icon" @click="hideModal()">
                <font-awesome-icon class="icon" icon="xmark" size="lg" title="Schließen"></font-awesome-icon>
              </div>
            </slot>
          </slot>
        </div>
      </slot>
    </div>
  </Teleport>
</template>

<style lang="scss">
#verdatas-dashboard {
  position: relative;
}
</style>

<style scoped lang="scss">
.close-icon {
  position: absolute;
  top: 10px;
  right: 15px;
  cursor: pointer;
  padding: 2px;
}
.divider {
  display: block;
  margin: auto;
  width: 95%;
  border-bottom: 2px dotted #000;
}
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}
.at-modal {
  position: absolute;
  top: 10%;
  left: 20%;
  width: 60%;
  height: var(--modal-height, 80%);
  background-color: rgba(255, 255, 255, 1);
  padding: 10px;
  border-radius: 10px;

  .modal-title {
    text-align: center;
    font-weight: bold;
    font-size: 1.5em;
  }

  .modal-main {
    margin-top: 1em;
    overflow: auto;
    height: calc(100% - 50px);
  }
}
</style>
