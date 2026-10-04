import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from '@/theme/ThemeContext'

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider')
  }
  return context
}
