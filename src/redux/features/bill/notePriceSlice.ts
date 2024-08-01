import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

export interface INote {
    note?: string,
    price: number[]
}

const initialState: INote = {
    note: "",
    price: []
}

export const noteSlice = createSlice({
    name: 'notePrice',
    initialState,
    reducers: {
        addNotePrice: (state, action: PayloadAction<INote>) => {
            const notePrice = action.payload
            state.note = notePrice.note
            state.price = notePrice.price
        },
        deleteNotePrice: (state) => { },
    },
})

export const { addNotePrice, deleteNotePrice } = noteSlice.actions
export const selectBill = (state: RootState) => state.notePrice
export default noteSlice.reducer