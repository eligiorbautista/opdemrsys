import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const originalWarn = console.warn
console.warn = function filterWarning(message, ...args) {
  if (typeof message === 'string' && message.includes('React Router Future Flag')) {
    return
  }
  originalWarn.apply(console, [message, ...args])
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)