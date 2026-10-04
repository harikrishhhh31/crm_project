import { createContext } from 'react'

export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning'
export interface SnackbarContextValue {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
}
export const SnackbarContext = createContext<SnackbarContextValue | null>(null)
