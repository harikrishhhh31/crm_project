import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import { Box, Button, Typography } from '@mui/material'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Could not load this view',
  description = 'Something went wrong while loading the data.',
  onRetry,
}: ErrorStateProps) {
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
      <Box sx={{ color: 'error.main' }}>
        <ErrorOutlineRoundedIcon fontSize="large" />
      </Box>
      <Typography variant="h2">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Box>
  )
}
