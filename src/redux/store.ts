import { configureStore } from '@reduxjs/toolkit'
import modalReducer from './features/modal/modalSlice'
import billReducer from "./features/bill/billSlice";
import commissionReducer from './features/bill/commissionSlice'
import notePriceReducer from "./features/bill/notePriceSlice";
import requestReducer from "./features/request/requestSlice";
import routeReducer from "./features/route/routeSlice";

export const store = configureStore({
    reducer: {
        modal: modalReducer,
        bill: billReducer,
        notePrice: notePriceReducer,
        commission: commissionReducer,
        request: requestReducer,
        route: routeReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch