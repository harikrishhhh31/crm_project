import { Alert, Snackbar } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
interface SnackbarState {
  open: boolean
  message: string
  severity: SnackbarSeverity
}
import { SnackbarContext, type SnackbarSeverity } from '@/components/ui/SnackbarContext'

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackbarState>({ open: false, message: '', severity: 'info' })
  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = 'info') =>
      setState({ open: true, message, severity }),
    [],
  )
  const value = useMemo(
    () => ({
      showSnackbar,
      showSuccess: (message: string) => showSnackbar(message, 'success'),
      showError: (message: string) => showSnackbar(message, 'error'),
    }),
    [showSnackbar],
  )
  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={() => setState((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={state.severity}
          variant="filled"
          onClose={() => setState((current) => ({ ...current, open: false }))}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}
