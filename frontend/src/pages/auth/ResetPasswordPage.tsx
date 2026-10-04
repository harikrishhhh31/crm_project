import { useMemo, useState } from 'react'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Link as RouterLink } from 'react-router-dom'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { SectionCard } from '@/components/ui/SectionCard'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirm: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirm, {
    path: ['confirm'],
    message: 'Passwords must match.',
  })

type ResetPasswordValues = {
  password: string
  confirm: string
}

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
    mode: 'onChange',
  })

  const password = useWatch({ control: form.control, name: 'password' }) || ''

  const strength = useMemo(() => {
    if (!password) return null
    if (password.length < 8) return { label: 'Too short', color: 'error.main' }
    if (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return { label: 'Strong', color: 'success.main' }
    }
    if (password.length >= 8) {
      return { label: 'Good', color: 'warning.main' }
    }
    return { label: 'Weak', color: 'error.main' }
  }, [password])

  const submit = () => {
    setSubmitted(true)
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
          {submitted ? (
            <>
              <Box>
                <Typography variant="h1">Password reset</Typography>
                <Typography color="text.secondary">
                  Your password has been successfully updated.
                </Typography>
              </Box>
              <Alert severity="success">
                Password updated. You can now sign in with your new password.
              </Alert>
              <Button component={RouterLink} to="/login" variant="contained" size="large" fullWidth>
                Sign in with new password
              </Button>
            </>
          ) : (
            <>
              <Box>
                <Typography variant="h1">Reset password</Typography>
                <Typography color="text.secondary">
                  Choose a new secure password for your account.
                </Typography>
              </Box>
              <TextField
                label="New password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
              {strength && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Password strength:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: strength.color }}>
                    {strength.label}
                  </Typography>
                </Box>
              )}
              <TextField
                label="Confirm new password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                {...form.register('confirm')}
                error={Boolean(form.formState.errors.confirm)}
                helperText={form.formState.errors.confirm?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                          onClick={() => setShowConfirm((current) => !current)}
                          edge="end"
                        >
                          {showConfirm ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!form.formState.isValid || form.formState.isSubmitting}
              >
                Update password
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" underline="hover">
                  Back to sign in
                </Link>
              </Box>
            </>
          )}
        </Stack>
      </SectionCard>
    </AuthLayout>
  )
}
