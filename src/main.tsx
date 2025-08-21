/**
 * Application entry point
 * 
 * Sets up React 18 root with StrictMode for development warnings
 * Imports global styles (Tailwind CSS + React Flow)
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// React 18 root with StrictMode for development checks
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
