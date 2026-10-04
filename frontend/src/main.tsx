import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import { theme } from '../theme'
import App from '@/App'
import '@/index.css'
import { RoleProvider } from '@/layout/RoleProvider'
import { AuthProvider } from '@/auth/AuthProvider'
import { SnackbarProvider } from '@/components/ui/SnackbarProvider'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <RoleProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </RoleProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>,
)
