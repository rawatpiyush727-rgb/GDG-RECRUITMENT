import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { ApplicationsProvider } from './context/ApplicationsContext'
import { Toaster } from './components/ui/toaster'
import './index.css'
import App from './App.jsx'

import { isGoogleAuthEnabled, googleClientId } from './lib/googleAuth'

const appTree = (
  <AuthProvider>
    <ApplicationsProvider>
      <App />
      <Toaster />
    </ApplicationsProvider>
  </AuthProvider>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isGoogleAuthEnabled ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        {appTree}
      </GoogleOAuthProvider>
    ) : (
      appTree
    )}
  </StrictMode>,
)
