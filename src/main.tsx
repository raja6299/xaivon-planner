import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerServiceWorker } from './pwa/serviceWorkerRegistration'
import { initInstallPrompt } from './pwa/installPrompt'

import './styles/globals.css'

// Capture the install prompt as early as possible (before React mounts).
initInstallPrompt()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register the service worker (offline-first) and start watching for updates.
registerServiceWorker()
