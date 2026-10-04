import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material'

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={44} />
      ))}
    </Stack>
  )
}
export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Skeleton width="35%" height={18} />
          <Skeleton width="70%" height={30} />
          <Skeleton variant="rounded" height={48} />
        </Stack>
      </CardContent>
    </Card>
  )
}
export function SummarySkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={128} sx={{ flex: 1 }} />
      ))}
    </Box>
  )
}
