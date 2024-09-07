import { ref, type Ref } from 'vue'

// Currently only used as fallback, no real use case
export const SDefaultModal: Symbol = Symbol('DefaultModal')

export const SAddOperationModal = Symbol('AddOperationModal')
export const SSaveAndExitModal = Symbol('SaveAndExitModal')

export class CModalManager {
  private showModalRef: Ref<boolean>

  constructor(defaultShowModal: boolean = false) {
    this.showModalRef = ref(defaultShowModal)
  }

  get getShowModal(): Readonly<boolean> {
    return this.showModalRef.value
  }

  showModal = () => {
    this.showModalRef.value = true
  }
  hideModal = () => {
    this.showModalRef.value = false
  }
}
