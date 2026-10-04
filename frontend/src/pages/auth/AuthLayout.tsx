import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useTheme } from '@mui/material'

export function AuthLayout({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(420px, 0.8fr)' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          p: 8,
          color: 'primary.contrastText',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          alignItems: 'center',
        }}
      >
        <Stack spacing={3} sx={{ maxWidth: 480 }}>
          <Typography variant="h1" sx={{ color: 'inherit' }}>
            Harborline
          </Typography>
          <Typography variant="h2" sx={{ color: 'inherit', fontWeight: 400 }}>
            A calmer way to keep every insurance relationship moving.
          </Typography>
          <Typography sx={{ color: 'primary.light' }}>
            Securely manage renewals, claims, and customer communication in one focused workspace.
          </Typography>
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
