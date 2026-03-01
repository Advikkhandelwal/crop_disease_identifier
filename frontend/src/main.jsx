import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
