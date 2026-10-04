import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  trend?: { value: string; direction: 'up' | 'down' }
  icon?: ReactNode
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUpRoundedIcon : TrendingDownRoundedIcon
  return (
    <Card>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            {icon && <Box sx={{ color: 'primary.main' }}>{icon}</Box>}
          </Box>
          <Typography
            sx={{
              fontSize: '1.5rem',
              lineHeight: 1.2,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
                color: trend.direction === 'up' ? 'success.main' : 'error.main',
              }}
            >
              <TrendIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">{trend.value}</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
