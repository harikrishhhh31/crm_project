import { createTheme } from '@mui/material/styles'
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

export const tonalScale = {
  50: '#F1F3FF',
  100: '#E5E9FF',
  200: '#CBD3FF',
  300: '#AAB7FF',
  400: '#8295F3',
  500: '#5D76E8',
  600: '#3B5BDB',
  700: '#3049B5',
  800: '#283B8F',
  900: '#202F70',
} as const

export const surfaceBorder = '#E5E7EF'
export const subtleShadow = '0 1px 2px rgba(16, 24, 40, 0.06)'

export const theme = createTheme({
  palette: {
    primary: {
      main: tonalScale[600],
      light: tonalScale[100],
      dark: tonalScale[800],
      contrastText: '#FFFFFF',
    },
    background: { default: '#F6F7FB', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#667085' },
    divider: surfaceBorder,
    success: { main: '#16825D', light: '#E8F6F0', dark: '#0D6044', contrastText: '#FFFFFF' },
    warning: { main: '#B54708', light: '#FFF3E8', dark: '#843A06', contrastText: '#FFFFFF' },
    error: { main: '#C43232', light: '#FDECEC', dark: '#932323', contrastText: '#FFFFFF' },
    info: { main: '#2563A9', light: '#EAF3FF', dark: '#194879', contrastText: '#FFFFFF' },
    locked: { main: '#6941C6', light: '#F2EDFF', dark: '#4A2A9A', contrastText: '#FFFFFF' },
    exception: { main: '#C2410C', light: '#FFF0E8', dark: '#8A2C08', contrastText: '#FFFFFF' },
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
        '*:focus-visible': { outline: `3px solid ${tonalScale[300]}`, outlineOffset: 2 },
        '.MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within': {
          outline: `3px solid ${tonalScale[300]} !important`,
          outlineOffset: -2,
        },
        body: { fontVariantNumeric: 'proportional-nums' },
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
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${surfaceBorder}`,
          boxShadow: subtleShadow,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${surfaceBorder}`,
          boxShadow: subtleShadow,
          transition: 'box-shadow 160ms ease, transform 160ms ease',
          '&:hover': { boxShadow: subtleShadow, transform: 'translateY(-1px)' },
        },
      },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: surfaceBorder },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tonalScale[400] },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 40 },
        indicator: { height: 2, borderRadius: 2, transition: 'all 160ms ease' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          textTransform: 'none',
          fontWeight: 600,
          paddingInline: 16,
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
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12, boxShadow: subtleShadow } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem', borderRadius: 6, backgroundColor: '#1F2937' },
        arrow: { color: '#1F2937' },
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: { root: { borderRadius: 8, backgroundColor: '#EEF0F5' } },
    },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 8, boxShadow: subtleShadow } } },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 0,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F9FAFB',
            borderBottom: `1px solid ${surfaceBorder}`,
          },
          '& .MuiDataGrid-cell': { borderBottom: `1px solid ${surfaceBorder}` },
          '& .MuiDataGrid-row:hover': { backgroundColor: tonalScale[50] },
          '& .MuiDataGrid-columnSeparator': { display: 'none' },
        },
      },
    },
  },
})
