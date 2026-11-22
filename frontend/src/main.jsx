import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChurchProvider } from './context/ChurchContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ChurchProvider>
          <App />
        </ChurchProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
