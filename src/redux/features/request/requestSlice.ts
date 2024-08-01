import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

interface RequestState {
    isRequest: boolean
}

const initialState: RequestState = {
    isRequest: false
}

export const requestSlice = createSlice({
    name: 'request',
    initialState,
    reducers: {
        stateRequest: (state, action: PayloadAction<RequestState>) => {
            const request = action.payload
            state.isRequest = request.isRequest
        }
    },
})

export const { stateRequest } = requestSlice.actions
export const sendRequest = (state: RootState) => state.request
export default requestSlice.reducer