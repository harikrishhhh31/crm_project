import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'There are no records to show in this view.',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        py: 8,
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: 'text.secondary' }}>{icon ?? <InboxOutlinedIcon fontSize="large" />}</Box>
      <Typography variant="h2">{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
      {action}
    </Box>
  )
}
