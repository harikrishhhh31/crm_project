import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { LoginSlideshow } from '@/components/ui/LoginSlideshow'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.15fr) minmax(420px, 0.85fr)' },
        bgcolor: 'background.default',
        position: 'relative',
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
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ position: 'absolute', top: { xs: 12, sm: 20 }, right: { xs: 12, sm: 20 } }}>
          <ThemeToggle />
        </Box>
        {children}
      </Box>
    </Box>
  )
}
