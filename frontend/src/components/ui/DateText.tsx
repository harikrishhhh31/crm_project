import dayjs from 'dayjs'
import { Typography } from '@mui/material'
import type { TypographyProps } from '@mui/material/Typography'

export function DateText({ value, ...props }: { value: string | Date } & TypographyProps) {
  return (
    <Typography {...props} component={props.component ?? 'span'}>
      {dayjs(value).format('DD MMM YYYY')}
    </Typography>
  )
}
