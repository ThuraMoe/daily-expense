import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { MaskProvider } from './context/MaskContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <MaskProvider>
          <App />
        </MaskProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
