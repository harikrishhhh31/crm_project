import { Alert, Box, Button, CircularProgress, Skeleton, Stack, Typography } from '@mui/material'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { FadeIn } from '@/components/ui/FadeIn'

interface PageStateProps {
  loading?: boolean
  empty?: boolean
  error?: boolean
  forbidden?: boolean
  onRetry?: () => void
  children: React.ReactNode
}

export function PageState({ loading, empty, error, forbidden, onRetry, children }: PageStateProps) {
  if (loading)
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={72} />
        <Skeleton variant="rounded" height={360} />
      </Stack>
    )
  if (forbidden)
    return (
      <State
        icon={<LockOutlinedIcon />}
        title="Access restricted"
        detail="Your current role does not have access to this workspace."
      />
    )
  if (error)
    return (
      <State
        icon={<ErrorOutlineRoundedIcon />}
        title="Could not load this view"
        detail="The local data source did not respond."
        action={onRetry ? <Button onClick={onRetry}>Try again</Button> : undefined}
      />
    )
  if (empty)
    return <State title="Nothing here yet" detail="There are no records to show in this view." />
  return <FadeIn>{children}</FadeIn>
}

function State({
  icon,
  title,
  detail,
  action,
}: {
  icon?: React.ReactNode
  title: string
  detail: string
  action?: React.ReactNode
}) {
  return (
    <Box sx={{ py: 10, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: 'primary.main' }}>{icon ?? <CircularProgress size={28} />}</Box>
        <Typography variant="h3">{title}</Typography>
        <Typography color="text.secondary">{detail}</Typography>
        {action}
      </Box>
      <Alert severity="info" sx={{ mt: 4, textAlign: 'left' }}>
        This frontend is connected to local mock data.
      </Alert>
    </Box>
  )
}
