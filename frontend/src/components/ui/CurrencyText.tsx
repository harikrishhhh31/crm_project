import { Typography } from '@mui/material'
import type { TypographyProps } from '@mui/material/Typography'

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function CurrencyText({ value, ...props }: { value: number } & TypographyProps) {
  return (
    <Typography
      {...props}
      component={props.component ?? 'span'}
      sx={{ fontVariantNumeric: 'tabular-nums', ...props.sx }}
    >
      {formatter.format(value)}
    </Typography>
  )
}
