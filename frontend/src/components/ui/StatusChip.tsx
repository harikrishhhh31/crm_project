import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'

export type StatusVariant =
  'success' | 'warning' | 'error' | 'info' | 'neutral' | 'locked' | 'exception'

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status?: StatusVariant
  label: string
}

export function StatusChip({ status = 'neutral', label, ...props }: StatusChipProps) {
  const palette = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
    neutral: 'default',
    locked: 'locked',
    exception: 'exception',
  } as const
  const color = palette[status]
  return (
    <Chip
      {...props}
      label={label}
      size={props.size ?? 'small'}
      color={color === 'locked' || color === 'exception' ? 'default' : color}
      sx={{
        ...(color === 'locked' ? { color: 'locked.contrastText', bgcolor: 'locked.main' } : {}),
        ...(color === 'exception'
          ? { color: 'exception.contrastText', bgcolor: 'exception.main' }
          : {}),
        ...props.sx,
      }}
    />
  )
}
