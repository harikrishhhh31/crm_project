import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <Stack spacing={1.5} sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
        }}
      >
        <Stack spacing={0.5}>
          {breadcrumbs && (
            <Breadcrumbs aria-label="Breadcrumb">
              <Link color="inherit" href="#" underline="hover">
                Home
              </Link>
              {breadcrumbs.map((item) =>
                item.href ? (
                  <Link key={item.label} color="inherit" href={item.href} underline="hover">
                    {item.label}
                  </Link>
                ) : (
                  <Typography key={item.label} color="text.primary">
                    {item.label}
                  </Typography>
                ),
              )}
            </Breadcrumbs>
          )}
          <Typography variant="h1">{title}</Typography>
          {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        </Stack>
        {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{actions}</Box>}
      </Box>
    </Stack>
  )
}
