import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './assets/fonts/IBMPlexSansThai-Regular.ttf'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { AuthContextProvider } from './context/AuthContextProvider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthContextProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </AuthContextProvider>
  </React.StrictMode>
)
