import { createTheme, type Theme } from '@mui/material/styles'
import type {} from '@mui/x-data-grid/themeAugmentation'

declare module '@mui/material/styles' {
  interface Palette {
    locked: Palette['primary']
    exception: Palette['primary']
  }
  interface PaletteOptions {
    locked?: PaletteOptions['primary']
    exception?: PaletteOptions['primary']
  }
}

export const surfaceBorder = '#E5E7EF'
export const surfaceBorderDark = '#242427'
export const subtleShadow = '0 1px 2px rgba(16, 24, 40, 0.06)'
export const subtleShadowDark = '0 4px 20px rgba(0, 0, 0, 0.6)'

export function getTheme(mode: 'light' | 'dark' = 'light'): Theme {
  const isDark = mode === 'dark'
  const currentBorder = isDark ? surfaceBorderDark : surfaceBorder
  const currentShadow = isDark ? subtleShadowDark : subtleShadow

  return createTheme({
    palette: {
      mode,
      primary: isDark
        ? {
            main: '#FAFAFA',
            light: 'rgba(255, 255, 255, 0.08)',
            dark: '#E4E4E7',
            contrastText: '#121214',
          }
        : {
            main: '#18181B',
            light: '#F4F4F5',
            dark: '#09090B',
            contrastText: '#FFFFFF',
          },
      background: {
        default: isDark ? '#0B0B0D' : '#F6F7FB',
        paper: isDark ? '#141416' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#FAFAFA' : '#18181B',
        secondary: isDark ? '#A1A1AA' : '#71717A',
      },
      divider: currentBorder,
      success: isDark
        ? {
            main: '#10B981',
            light: 'rgba(16, 185, 129, 0.12)',
            dark: '#059669',
            contrastText: '#FFFFFF',
          }
        : { main: '#059669', light: '#ECFDF5', dark: '#047857', contrastText: '#FFFFFF' },
      warning: isDark
        ? {
            main: '#F59E0B',
            light: 'rgba(245, 158, 11, 0.12)',
            dark: '#D97706',
            contrastText: '#FFFFFF',
          }
        : { main: '#D97706', light: '#FFFBEB', dark: '#B45309', contrastText: '#FFFFFF' },
      error: isDark
        ? {
            main: '#EF4444',
            light: 'rgba(239, 68, 68, 0.12)',
            dark: '#DC2626',
            contrastText: '#FFFFFF',
          }
        : { main: '#DC2626', light: '#FEF2F2', dark: '#B91C1C', contrastText: '#FFFFFF' },
      info: isDark
        ? {
            main: '#A1A1AA',
            light: 'rgba(255, 255, 255, 0.08)',
            dark: '#D4D4D8',
            contrastText: '#121214',
          }
        : { main: '#52525B', light: '#F4F4F5', dark: '#27272A', contrastText: '#FFFFFF' },
      locked: isDark
        ? {
            main: '#71717A',
            light: 'rgba(255, 255, 255, 0.06)',
            dark: '#A1A1AA',
            contrastText: '#FAFAFA',
          }
        : { main: '#71717A', light: '#F4F4F5', dark: '#3F3F46', contrastText: '#FFFFFF' },
      exception: isDark
        ? {
            main: '#F97316',
            light: 'rgba(249, 115, 22, 0.12)',
            dark: '#EA580C',
            contrastText: '#FFFFFF',
          }
        : { main: '#EA580C', light: '#FFF7ED', dark: '#C2410C', contrastText: '#FFFFFF' },
    },
    typography: {
      fontFamily: 'Inter Variable, Inter, sans-serif',
      fontSize: 14,
      h1: { fontSize: '1.5rem', lineHeight: 1.35, fontWeight: 600, letterSpacing: 0 },
      h2: { fontSize: '1.125rem', lineHeight: 1.45, fontWeight: 600, letterSpacing: 0 },
      h3: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600, letterSpacing: 0 },
      body1: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400 },
      caption: { fontSize: '0.75rem', lineHeight: 1.4, fontWeight: 400 },
      button: { fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 8 },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*:focus-visible': {
            outline: `2px solid ${isDark ? '#FAFAFA' : '#18181B'}`,
            outlineOffset: 2,
          },
          '.MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within': {
            outline: `2px solid ${isDark ? '#FAFAFA' : '#18181B'} !important`,
            outlineOffset: -2,
          },
          body: {
            fontVariantNumeric: 'proportional-nums',
            backgroundColor: isDark ? '#0B0B0D' : '#F6F7FB',
            color: isDark ? '#FAFAFA' : '#18181B',
            transition: 'background-color 200ms ease, color 200ms ease',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 8,
            boxShadow: 'none',
            transition:
              'background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease',
            '&:hover': { boxShadow: 'none' },
          },
          contained: {
            backgroundColor: isDark ? '#FAFAFA' : '#18181B',
            color: isDark ? '#121214' : '#FFFFFF',
            '&:hover': {
              backgroundColor: isDark ? '#E4E4E7' : '#27272A',
            },
          },
          outlined: {
            borderColor: currentBorder,
            color: isDark ? '#FAFAFA' : '#18181B',
            '&:hover': {
              borderColor: isDark ? '#52525B' : '#A1A1AA',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${currentBorder}`,
            boxShadow: currentShadow,
            transition:
              'background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${currentBorder}`,
            boxShadow: currentShadow,
            transition:
              'box-shadow 160ms ease, transform 160ms ease, background-color 200ms ease, border-color 200ms ease',
            '&:hover': { boxShadow: currentShadow, transform: 'translateY(-1px)' },
          },
        },
      },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 8,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: currentBorder },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#52525B' : '#A1A1AA',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
          indicator: {
            height: 2,
            borderRadius: 2,
            backgroundColor: isDark ? '#FAFAFA' : '#18181B',
            transition: 'all 160ms ease',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 600,
            paddingInline: 16,
            color: isDark ? '#A1A1AA' : '#71717A',
            '&.Mui-selected': {
              color: isDark ? '#FAFAFA' : '#18181B',
            },
            transition: 'color 160ms ease, background-color 160ms ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 600 },
          sizeSmall: { height: 24, fontSize: '0.75rem' },
        },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 12, boxShadow: currentShadow } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            borderRadius: 6,
            backgroundColor: isDark ? '#27272A' : '#18181B',
            color: '#FAFAFA',
          },
          arrow: { color: isDark ? '#27272A' : '#18181B' },
        },
      },
      MuiSkeleton: {
        defaultProps: { animation: 'wave' },
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDark ? '#1C1C20' : '#EEF0F5',
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: { root: { borderRadius: 8, boxShadow: currentShadow } },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark ? '#161619' : '#F9FAFB',
              borderBottom: `1px solid ${currentBorder}`,
            },
            '& .MuiDataGrid-cell': { borderBottom: `1px solid ${currentBorder}` },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
            },
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
              },
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
          },
        },
      },
    },
  })
}

export const theme = getTheme('light')
