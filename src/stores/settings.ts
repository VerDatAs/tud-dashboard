import { ref  } from 'vue'
import { defineStore } from 'pinia'

export const useDebuggerStore = defineStore('debugger', () => {
  const debuggingMode = ref(false)

  function toggleDebuggingMode() {
    debuggingMode.value = !debuggingMode.value
  }

  return { debuggingMode, toggleDebuggingMode }
})

export const useAutosaveStore = defineStore('autosave', () => {
  const autosaveMode = ref(false)

  function toggleAutosaveMode() {
    autosaveMode.value = !autosaveMode.value
  }

  return { autosaveMode, toggleAutosaveMode }
})