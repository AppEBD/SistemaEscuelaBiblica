import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // <--- ¡Agrégala de nuevo! Ahora sí funcionará
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
