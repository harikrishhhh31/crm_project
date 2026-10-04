import { useState } from 'react'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/types/crm'
import { useRole } from '@/layout/useRole'
import { useAuth } from '@/auth/useAuth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface NavItem {
  href: string
  label: string
  icon: typeof DashboardRoundedIcon
}

const navItems: NavItem[] = [
  { href: '/renewals', label: 'Renewals', icon: AssessmentRoundedIcon },
  { href: '/customers', label: 'Customers', icon: GroupsRoundedIcon },
  { href: '/contests', label: 'Contests', icon: CampaignRoundedIcon },
  { href: '/settings', label: 'Settings', icon: SettingsRoundedIcon },
]

function getInitials(name?: string) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AppLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const isExpanded = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null)
  const { role, setRole, isAdmin } = useRole()
  const { user, logout } = useAuth()
  const location = useLocation()

  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((part) => part.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))

  const showLabels = isDesktop && isExpanded
  const initials = getInitials(user?.name)
  const displayName = user?.name ?? 'User'
  const displayRole = user?.role ?? role

  const handleLogout = () => {
    setUserAnchor(null)
    logout()
  }

  const navigation = (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100%',
        flexDirection: 'column',
        width: { xs: 240, md: showLabels ? 240 : 72 },
        p: { xs: 2, md: showLabels ? 2 : 1 },
        transition: 'width 160ms ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 48, px: 1, mb: 3 }}>
        <DashboardRoundedIcon sx={{ color: 'text.primary' }} />
        <Typography
          sx={{
            display: { xs: 'block', md: showLabels ? 'block' : 'none' },
            fontWeight: 700,
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          Harborline
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: { xs: 'block', md: showLabels ? 'block' : 'none' }, px: 1, mb: 1 }}
      >
        Workspace
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems
          .filter((item) => item.label !== 'Settings' || isAdmin)
          .map(({ href, label, icon: Icon }) => (
            <Tooltip key={href} title={showLabels ? '' : label} placement="right">
              <Box
                component={NavLink}
                to={href}
                onClick={() => setMobileOpen(false)}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', md: showLabels ? 'flex-start' : 'center' },
                  gap: 1.5,
                  minHeight: 44,
                  px: { xs: 1.5, md: showLabels ? 1.5 : 1 },
                  borderRadius: 1,
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)',
                    color: 'text.primary',
                  },
                  '&.active': {
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.06)',
                    color: 'text.primary',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 2,
                      bgcolor: (t) => (t.palette.mode === 'dark' ? '#FAFAFA' : '#18181B'),
                    },
                  },
                }}
              >
                <Icon sx={{ fontSize: 21 }} />
                <Typography
                  sx={{
                    display: { xs: 'block', md: showLabels ? 'block' : 'none' },
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Typography>
              </Box>
            </Tooltip>
          ))}
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: { xs: 1, md: showLabels ? 1 : 0 },
          justifyContent: { xs: 'flex-start', md: showLabels ? 'flex-start' : 'center' },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#27272A' : '#18181B'),
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ display: { xs: 'block', md: showLabels ? 'block' : 'none' }, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {displayRole}
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (currentTheme) => currentTheme.zIndex.drawer + 1,
          borderBottom: 1,
          borderColor: 'divider',
          ml: { md: showLabels ? '240px' : '72px' },
          width: { md: `calc(100% - ${showLabels ? '240px' : '72px'})` },
        }}
      >
        <Toolbar sx={{ minHeight: 72, gap: 1.5, px: { xs: 2, md: 3 } }}>
          <IconButton
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 180 }}>
            <Typography variant="caption" color="text.secondary">
              Workspace
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Insurance operations
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search customers, policies, claims"
            sx={{ flex: 1, maxWidth: 420, ml: { xs: 0, md: 2 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" color="disabled" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <ThemeToggle />

          <IconButton aria-label="Notifications">
            <NotificationsNoneRoundedIcon />
          </IconButton>

          {import.meta.env.DEV && (
            <FormControl size="small" sx={{ minWidth: 112, display: { xs: 'none', sm: 'block' } }}>
              <Select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                aria-label="Switch role"
                IconComponent={ExpandMoreRoundedIcon}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="advisor">Advisor</MenuItem>
              </Select>
            </FormControl>
          )}

          <IconButton
            aria-label="Open user menu"
            onClick={(event) => setUserAnchor(event.currentTarget)}
          >
            <AccountCircleRoundedIcon />
          </IconButton>

          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            slotProps={{
              paper: {
                sx: { minWidth: 180 },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {displayName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'capitalize' }}
              >
                {displayRole} · {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: showLabels ? 240 : 72,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: 'width 160ms ease',
          },
        }}
      >
        {navigation}
      </Drawer>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        {navigation}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: { md: showLabels ? '240px' : '72px' },
          pt: { xs: 11, md: 12 },
          px: { xs: 2, md: 3 },
          pb: 5,
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
          <Box
            component="nav"
            aria-label="Breadcrumb"
            sx={{ mb: 2, display: { xs: 'none', sm: 'block' } }}
          >
            <Typography variant="caption" color="text.secondary">
              Harborline {breadcrumbs.length ? ` / ${breadcrumbs.join(' / ')}` : ''}
            </Typography>
          </Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
