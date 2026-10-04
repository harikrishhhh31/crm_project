import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Typography } from '@mui/material'

interface ForbiddenStateProps {
  title?: string
  description?: string
}

export function ForbiddenState({
  title = 'Access restricted',
  description = 'Your current role does not have access to this workspace.',
}: ForbiddenStateProps) {
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
      <Box sx={{ color: 'locked.main' }}>
        <LockOutlinedIcon fontSize="large" />
      </Box>
      <Typography variant="h2">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Box>
  )
}
