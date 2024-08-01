import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { Bill } from '../../../components/member/Bill'

const initialState: Bill[] = []

export const billSlice = createSlice({
    name: 'bill',
    initialState,
    reducers: {
        addBill: (state, action: PayloadAction<Bill[]>) => state = action.payload,
        deleteBill: (state) => state = []
    },
})

export const { addBill, deleteBill } = billSlice.actions
export const selectBill = (state: RootState) => state.bill
export default billSlice.reducer