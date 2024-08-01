import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

interface routeState {
    isRoute: string
}

const initialState: routeState = {
    isRoute: ""
}

export const routeSlice = createSlice({
    name: 'route',
    initialState,
    reducers: {
        stateRoute: (state, action: PayloadAction<routeState>) => {
            const route = action.payload
            state.isRoute = route.isRoute
        }
    },
})

export const { stateRoute } = routeSlice.actions
export const setRoute = (state: RootState) => state.route
export default routeSlice.reducer