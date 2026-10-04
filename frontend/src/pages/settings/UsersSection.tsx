import { useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '@/auth/useAuth'
import { EmptyState } from '@/components/ui/EmptyState'
import { ForbiddenState } from '@/components/ui/ForbiddenState'
import { PageState } from '@/components/ui/PageState'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { useRole } from '@/layout/useRole'
import { useSnackbar } from '@/components/ui/useSnackbar'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter a name (at least 2 characters).'),
  email: z.string().email('Enter a valid email address.'),
  role: z.enum(['admin', 'manager', 'advisor']),
})

type FormValues = z.infer<typeof schema>

export function UsersSection() {
  const { isAdmin } = useRole()
  const { users, addUser, deactivateUser, resetUserPassword } = useAuth()
  const { showSuccess } = useSnackbar()
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'advisor' },
  })

  if (!isAdmin) {
    return (
      <ForbiddenState
        title="Admin access required"
        description="User administration is available to administrators only."
      />
    )
  }

  const handleDeactivate = (userId: string, userName: string) => {
    deactivateUser(userId)
    showSuccess(`${userName} has been deactivated.`)
  }

  const handleResetPassword = (userId: string, userEmail: string) => {
    resetUserPassword(userId)
    showSuccess(`Password reset email sent to ${userEmail}.`)
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.3, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.8,
      minWidth: 120,
      renderCell: ({ value }) => (
        <StatusChip
          label={String(value).toUpperCase()}
          status={value === 'admin' ? 'locked' : value === 'manager' ? 'info' : 'neutral'}
        />
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 110,
      renderCell: ({ value }) => (
        <StatusChip label={value ? 'Active' : 'Inactive'} status={value ? 'success' : 'neutral'} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1.4,
      minWidth: 240,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', height: '100%' }}>
          <Button
            size="small"
            startIcon={<LockResetRoundedIcon />}
            onClick={() => handleResetPassword(row.id, row.email)}
          >
            Reset password
          </Button>
          {row.active && (
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => handleDeactivate(row.id, row.name)}
            >
              Deactivate
            </Button>
          )}
        </Stack>
      ),
    },
  ]

  const submit = (values: FormValues) => {
    addUser(values)
    showSuccess(`User ${values.name} added successfully.`)
    setOpen(false)
    form.reset({ name: '', email: '', role: 'advisor' })
  }

  return (
    <SectionCard title="Users" subtitle="Manage workspace user accounts and access permissions.">
      <Stack spacing={2.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {users.length} {users.length === 1 ? 'user' : 'users'} registered
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpen(true)}>
            Add user
          </Button>
        </Box>

        <PageState empty={!users.length}>
          {users.length ? (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <DataGrid
                rows={users}
                columns={columns}
                getRowId={(row) => row.id}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
              />
            </Paper>
          ) : (
            <EmptyState
              title="No users found"
              description="Add a new user to start managing team permissions."
              action={
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setOpen(true)}
                >
                  Add user
                </Button>
              }
            />
          )}
        </PageState>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add new user</DialogTitle>
        <Stack component="form" onSubmit={form.handleSubmit(submit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Full name"
                autoFocus
                {...form.register('name')}
                error={Boolean(form.formState.errors.name)}
                helperText={form.formState.errors.name?.message}
                fullWidth
              />
              <TextField
                label="Email address"
                type="email"
                {...form.register('email')}
                error={Boolean(form.formState.errors.email)}
                helperText={form.formState.errors.email?.message}
                fullWidth
              />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  Role
                </Typography>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <Select {...field} fullWidth size="small" aria-label="User role">
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="advisor">Advisor</MenuItem>
                    </Select>
                  )}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add user
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </SectionCard>
  )
}
