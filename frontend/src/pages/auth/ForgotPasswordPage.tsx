import { useState } from 'react'
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link as RouterLink } from 'react-router-dom'
import { AuthLayout } from '@/pages/auth/AuthLayout'
import { SectionCard } from '@/components/ui/SectionCard'

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
})

type ForgotPasswordValues = {
  email: string
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const submit = () => {
    setSent(true)
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
          {sent ? (
            <>
              <Box>
                <Typography variant="h1">Check your email</Typography>
                <Typography color="text.secondary">
                  If an account exists for {form.getValues('email')}, we have sent instructions to
                  reset your password.
                </Typography>
              </Box>
              <Alert severity="success">Password reset email sent.</Alert>
              <Button component={RouterLink} to="/login" variant="outlined" fullWidth>
                Back to sign in
              </Button>
            </>
          ) : (
            <>
              <Box>
                <Typography variant="h1">Forgot password?</Typography>
                <Typography color="text.secondary">
                  Enter your email and we will send you a reset link.
                </Typography>
              </Box>
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                {...form.register('email')}
                error={Boolean(form.formState.errors.email)}
                helperText={form.formState.errors.email?.message}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={form.formState.isSubmitting}
              >
                Send reset link
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
