/**
 * Main Entry Point - Chatbot Flow Builder Application
 * 
 * This file serves as the root entry point for the React application.
 * It handles:
 * - React 18 root creation and rendering
 * - StrictMode wrapping for development warnings
 * - Global CSS imports (Tailwind + React Flow styles)
 * - App component mounting to the DOM
 * 
 * Architecture Notes:
 * - Uses React 18's createRoot API for improved performance
 * - StrictMode helps catch potential issues during development
 * - The 'root' element is defined in index.html
 * - CSS imports are processed by Vite build system
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'           // Main application component
import './index.css'                  // Global styles (Tailwind + React Flow)

// Create React 18 root and render the application
// StrictMode enables additional development-time checks and warnings
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
