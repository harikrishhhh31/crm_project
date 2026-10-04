import { Box, Fade } from '@mui/material'
import type { ReactNode } from 'react'

export function FadeIn({ children }: { children: ReactNode }) {
  return (
    <Fade in timeout={180} appear>
      <Box>{children}</Box>
    </Fade>
  )
}
