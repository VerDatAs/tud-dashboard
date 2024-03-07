<script>
import { urlAttributeKeys } from '@/util/GraphHelpers'

export default {
  name: 'BasicTypes',
  data: () => ({
    currentCheckboxValue: false,
    urlAttributeKeys
  }),
  props: {
    element: Object,
    parameter: Object
  },
  computed: {
    computedFormElement: {
      get() {
        if (this.parameter.type === 'Boolean') {
          // FIXME: Workaround, as the checkbox is not checked properly using the value of element.businessObject
          return this.currentCheckboxValue
        } else {
          return this.element?.businessObject?.[this.parameter.name] ?? ''
        }
      },
      set(newValue) {
        // Do not set empty parameters
        if (newValue === '') {
          newValue = null
        }
        this.$emit('changeInput', this.parameter.name, newValue)
      }
    }
  },
  emits: [
    'changeInput'
  ],
  created() {
    this.createOrUpdateCheckboxValue()
  },
  updated() {
    this.createOrUpdateCheckboxValue()
  },
  methods: {
    createOrUpdateCheckboxValue() {
      if (this.parameter.type === 'Boolean') {
        this.currentCheckboxValue = this.element?.businessObject?.[this.parameter.name] ?? false
      }
    },
    changeValue() {
      this.currentCheckboxValue = !this.currentCheckboxValue
    }
  }
}
</script>

<template>
  <div>
    <input
      :id="parameter.name"
      :name="parameter.name"
      :aria-label="parameter.name"
      class="form-control"
      :type="urlAttributeKeys.includes(parameter.name) ? 'url' : 'text'"
      v-if="parameter.type === 'String'"
      v-model="computedFormElement"
    />
    <input
      :id="parameter.name"
      :name="parameter.name"
      :aria-label="parameter.name"
      class="form-control"
      type="number"
      v-if="parameter.type === 'Integer'"
      v-model="computedFormElement"
    />
    <template v-if="parameter.type === 'Boolean'">
      <input
        :id="parameter.name"
        :name="parameter.name"
        :aria-label="parameter.name"
        class="ms-1"
        type="checkbox"
        v-if="parameter.type === 'Boolean'"
        v-model="computedFormElement"
        @change="changeValue"
      />
      <span class="badge">
        {{ currentCheckboxValue ? 'aktiviert' : 'deaktiviert' }}
      </span>
    </template>
  </div>
</template>

<style scoped>
  .badge {
    margin-left: 7px;
    color: inherit !important;
    background-color: #f8f9fa !important;
    border: 1px solid #ddd;
    font-size: 11px;
    font-weight: normal;
  }
</style>
