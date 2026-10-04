import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeContext, type ThemeMode } from '@/theme/ThemeContext'
import { getTheme } from '../../theme'

const STORAGE_KEY = 'harborline-theme-mode'

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialTheme)

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem(STORAGE_KEY, newMode)
  }

  const toggleTheme = () => {
    setModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  const currentTheme = useMemo(() => getTheme(mode), [mode])

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode,
    }),
    [mode],
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <NextThemesProvider
        attribute="class"
        forcedTheme={mode}
        defaultTheme={mode}
        enableSystem={false}
      >
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}
