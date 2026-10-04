import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'
import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <SearchOffRoundedIcon sx={{ color: 'primary.main', fontSize: 52 }} />
      <Typography variant="h1">Page not found</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 440 }}>
        The page you are looking for may have moved, or the link may be out of date.
      </Typography>
      <Button
        variant="contained"
        startIcon={<HomeRoundedIcon />}
        onClick={() => navigate('/renewals')}
      >
        Return to renewals
      </Button>
    </Box>
  )
}
