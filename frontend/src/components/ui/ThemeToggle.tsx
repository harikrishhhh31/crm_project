import { IconButton, Tooltip, type IconButtonProps } from '@mui/material'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { useThemeMode } from '@/theme/useThemeMode'

export interface ThemeToggleProps extends Omit<IconButtonProps, 'onClick'> {
  showTooltip?: boolean
}

export function ThemeToggle({ showTooltip = true, sx, ...props }: ThemeToggleProps) {
  const { mode, toggleTheme } = useThemeMode()
  const isDark = mode === 'dark'
  const title = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  const button = (
    <IconButton
      aria-label={title}
      onClick={toggleTheme}
      sx={{
        color: isDark ? 'warning.main' : 'text.primary',
        transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms ease',
        '&:hover': {
          transform: 'rotate(18deg) scale(1.08)',
        },
        ...sx,
      }}
      {...props}
    >
      {isDark ? (
        <LightModeRoundedIcon sx={{ fontSize: props.size === 'small' ? 20 : 22 }} />
      ) : (
        <DarkModeRoundedIcon sx={{ fontSize: props.size === 'small' ? 20 : 22 }} />
      )}
    </IconButton>
  )

  if (!showTooltip) {
    return button
  }

  return (
    <Tooltip title={title} arrow placement="bottom">
      {button}
    </Tooltip>
  )
}
