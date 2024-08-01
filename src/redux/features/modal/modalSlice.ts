import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

export type Modal = "DETAIL" | "DELETE" | "CONFIRM" | "CONFIG" | "TIMEOUT" | "ADDBILLTRUE" | "ADDBILLFALSE" | "NO_CREDIT" | "SUCCESS" | "DIGITS_CLOSE" | "DIGITS_SEMI"

interface ModalState {
  show: boolean,
  openModal: Modal,
  confirm?: boolean
}

const initialState: ModalState = {
  show: false,
  openModal: "DELETE",
  confirm: false
}

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    stateModal: (state, action: PayloadAction<ModalState>) => {
      const modal = action.payload
      state.show = modal.show
      state.openModal = modal.openModal
      state.confirm = modal.confirm
    }
  },
})

export const { stateModal } = modalSlice.actions
export const selectModal = (state: RootState) => state.modal
export default modalSlice.reducer