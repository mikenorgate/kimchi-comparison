import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerBuiltInApps } from './builtin-apps.tsx'

// Register built-in apps before the app renders so the Dock and
// Spotlight are non-empty in production.
registerBuiltInApps()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
