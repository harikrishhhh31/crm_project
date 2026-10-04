import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { LoginSlideshow } from '@/components/ui/LoginSlideshow'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(420px, 0.85fr)' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          height: '100%',
        }}
      >
        <LoginSlideshow />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
