import { ref  } from 'vue'
import { defineStore } from 'pinia'

export const useDebuggerStore = defineStore('debugger', () => {
  const debuggingMode = ref(false)

  function toggleDebuggingMode() {
    debuggingMode.value = !debuggingMode.value
  }

  return { debuggingMode, toggleDebuggingMode }
})