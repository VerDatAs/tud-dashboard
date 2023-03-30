<script>
export default {
  name: 'BasicTypes',
  props: {
    element: Object,
    parameter: Object
  },
  computed: {
    computedFormElement: {
      get() {
        return this.element?.businessObject?.[this.parameter.name] ?? ''
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
  methods: {}
}
</script>

<template>
  <div>
    <input
      :id="parameter.name"
      :name="parameter.name"
      :aria-label="parameter.name"
      class="form-control"
      type="text"
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
  </div>
</template>

<style scoped></style>
