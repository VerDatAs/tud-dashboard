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
    /**
     * Computed form element with get and set functions.
     */
    computedFormElement: {
      get() {
        if (this.parameter.type === 'Boolean') {
          // TODO: Workaround, as the checkbox is not checked properly using the value of element.businessObject
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
  emits: ['changeInput'],
  created() {
    this.createOrUpdateCheckboxValue()
  },
  updated() {
    this.createOrUpdateCheckboxValue()
  },
  methods: {
    /**
     * Create or update a checkbox value (currently necessary for Boolean types).
     */
    createOrUpdateCheckboxValue() {
      if (this.parameter.type === 'Boolean') {
        this.currentCheckboxValue = this.element?.businessObject?.[this.parameter.name] ?? false
      }
    },
    /**
     * Change detection for the checkbox input (currently necessary for Boolean types).
     */
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
