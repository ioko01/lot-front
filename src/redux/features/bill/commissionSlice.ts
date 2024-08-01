import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import { ICommission, ICommissionMySQL } from '../../../models/Commission'

const initialState: ICommissionMySQL = {
    one_digits: {
        top: "0",
        bottom: "0"
    },
    two_digits: {
        top: "0",
        bottom: "0"
    },
    three_digits: {
        top: "0",
        toad: "0"
    },
    constructor: { name: "RowDataPacket" }
}

export const commissionSlice = createSlice({
    name: 'commission',
    initialState,
    reducers: {
        addCommission: (state, action: PayloadAction<ICommissionMySQL>) => state = action.payload,
        deleteCommission: (state) => state = {
            one_digits: {
                top: "0",
                bottom: "0"
            },
            two_digits: {
                top: "0",
                bottom: "0"
            },
            three_digits: {
                top: "0",
                toad: "0"
            },
            constructor: { name: "RowDataPacket" }
        }
    },
})

export const { addCommission, deleteCommission } = commissionSlice.actions
export const selectBill = (state: RootState) => state.commission
export default commissionSlice.reducer