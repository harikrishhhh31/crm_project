import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark'

export interface ThemeContextValue {
  mode: ThemeMode
  toggleTheme: () => void
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
