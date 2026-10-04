import { useState } from 'react'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { SectionCard } from '@/components/ui/SectionCard'
import { CurtainText } from '@/components/ui/CurtainText'
import { useAuth } from '@/auth/useAuth'

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  remember: z.boolean(),
})

type LoginValues = {
  email: string
  password: string
  remember: boolean
}

export function LoginPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const rememberedEmail = localStorage.getItem('harborline-remember') || ''

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      remember: Boolean(rememberedEmail),
    },
  })

  const submit = async (values: LoginValues) => {
    setError('')
    const result = await login(values.email, values.password, values.remember)
    if (!result.ok) {
      setError(result.message ?? 'Unable to sign in.')
      return
    }
    const destination = (location.state as { from?: string } | null)?.from ?? '/renewals'
    navigate(destination, { replace: true })
  }

  return (
    <AuthLayout>
      <SectionCard>
        <Stack
          component="form"
          onSubmit={form.handleSubmit(submit)}
          spacing={2.5}
          sx={{ width: 'min(100%, 420px)' }}
        >
          <Box>
            <CurtainText
              text="Welcome back"
              direction="up"
              baseColor={isDark ? '#FAFAFA' : '#1F2937'}
              activeColor={isDark ? '#38BDF8' : '#3B5BDB'}
              fontSize="1.625rem"
              fontClass="font-bold"
              durationMs={350}
              staggerMs={35}
              tracking=""
            />
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Sign in to your Harborline workspace.
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            {...form.register('email')}
            error={Boolean(form.formState.errors.email)}
            helperText={form.formState.errors.email?.message}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...form.register('password')}
            error={Boolean(form.formState.errors.password)}
            helperText={form.formState.errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((current) => !current)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <FormControlLabel
              control={<Checkbox {...form.register('remember')} />}
              label="Remember me"
            />
            <Link component={RouterLink} to="/forgot-password" underline="hover">
              Forgot password?
            </Link>
          </Box>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Demo accounts: admin@demo.com, manager@demo.com, advisor@demo.com (password: 8+
            characters)
          </Typography>
        </Stack>
      </SectionCard>
    </AuthLayout>
  )
}
