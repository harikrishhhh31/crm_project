import { useMemo, useState } from 'react'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Avatar,
  Badge,
  Box,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  DataGrid,
  GridActionsCellItem,
  type GridActionsColDef,
  type GridColDef,
} from '@mui/x-data-grid'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuthorizeRenewalExport, useRenewals } from '@/api/useCrmData'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CurrencyText } from '@/components/ui/CurrencyText'
import { DateText } from '@/components/ui/DateText'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageState } from '@/components/ui/PageState'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip, type StatusVariant } from '@/components/ui/StatusChip'
import { TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { useRole } from '@/layout/useRole'
import { useSnackbar } from '@/components/ui/useSnackbar'
import type { Renewal } from '@/types/crm'

const authorizationSchema = z.object({
  reason: z.string().trim().min(10, 'Enter at least 10 characters explaining the authorization.'),
})
type AuthorizationValues = z.infer<typeof authorizationSchema>
type RenewalWindow = 30 | 60 | 90

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
function urgencyStatus(days: number): StatusVariant {
  return days < 15 ? 'error' : days <= 30 ? 'warning' : 'neutral'
}
function urgencyClass(days: number) {
  return days < 15 ? 'renewal-urgent' : days <= 30 ? 'renewal-soon' : ''
}

export function RenewalsPage() {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('lg'))
  const { isAdmin, isManager } = useRole()
  const { showSuccess, showError } = useSnackbar()
  const query = useRenewals()
  const authorize = useAuthorizeRenewalExport()
  const [windowDays, setWindowDays] = useState<RenewalWindow>(30)
  const [advisor, setAdvisor] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState(0)
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null)
  const form = useForm<AuthorizationValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: { reason: '' },
  })

  const advisors = useMemo(
    () => [...new Set((query.data ?? []).map((renewal) => renewal.advisor))].sort(),
    [query.data],
  )
  const windowRenewals = useMemo(
    () =>
      (query.data ?? []).filter(
        (renewal) =>
          renewal.daysToRenewal <= windowDays &&
          (advisor === 'all' || renewal.advisor === advisor) &&
          `${renewal.customer} ${renewal.policyId} ${renewal.insurer ?? ''} ${renewal.advisor}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [advisor, query.data, search, windowDays],
  )
  const visibleRenewals =
    tab === 1 ? windowRenewals.filter((renewal) => renewal.isException) : windowRenewals
  const stats = {
    due: windowRenewals.filter((renewal) => renewal.daysToRenewal >= 0).length,
    locked: windowRenewals.filter((renewal) => renewal.portabilityLocked && !renewal.exportOverride)
      .length,
    exceptions: windowRenewals.filter((renewal) => renewal.isException).length,
    overdue: windowRenewals.filter((renewal) => renewal.daysToRenewal < 0).length,
  }

  const openAuthorize = (renewal: Renewal) => {
    setSelectedRenewal(renewal)
    form.reset({ reason: '' })
  }
  const closeAuthorize = () => {
    if (!authorize.isPending) setSelectedRenewal(null)
  }
  const submitAuthorization = async ({ reason }: AuthorizationValues) => {
    if (!selectedRenewal) return
    try {
      await authorize.mutateAsync({ policyId: selectedRenewal.policyId, reason })
      showSuccess('Export authorization recorded and policy updated.')
      setSelectedRenewal(null)
    } catch {
      showError('Authorization could not be recorded. Please try again.')
    }
  }

  const actionColumn: GridActionsColDef<Renewal> = {
    field: 'actions',
    type: 'actions',
    width: 58,
    getActions: ({ row }) =>
      row.portabilityLocked && !row.exportOverride
        ? [
            <Tooltip key="authorize" title="Authorize export">
              <GridActionsCellItem
                icon={<LockOpenOutlinedIcon />}
                label="Authorize export"
                onClick={() => openAuthorize(row)}
              />
            </Tooltip>,
          ]
        : [],
  }
  const columns: GridColDef<Renewal>[] = [
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1.25,
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: 'primary.light',
              color: 'primary.dark',
              fontSize: 12,
            }}
          >
            {initials(row.customer)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.customer}
          </Typography>
        </Box>
      ),
    },
    { field: 'policyId', headerName: 'Policy number', flex: 1, minWidth: 130 },
    {
      field: 'insurer',
      headerName: 'Insurer',
      flex: 1,
      minWidth: 130,
      valueGetter: (value: string | null) => value ?? 'Authorization required',
    },
    {
      field: 'renewalDate',
      headerName: 'Due date',
      flex: 0.9,
      minWidth: 120,
      renderCell: ({ value }) => <DateText value={value as string} />,
    },
    {
      field: 'daysToRenewal',
      headerName: 'Days to renewal',
      flex: 0.9,
      minWidth: 130,
      renderCell: ({ value }) => (
        <StatusChip
          label={value < 0 ? `${Math.abs(value)}d overdue` : `${value} days`}
          status={urgencyStatus(value as number)}
        />
      ),
    },
    { field: 'advisor', headerName: 'Advisor', flex: 1, minWidth: 125 },
    {
      field: 'stage',
      headerName: 'Status',
      flex: 1,
      minWidth: 135,
      renderCell: ({ value }) => (
        <StatusChip
          label={value as string}
          status={value === 'Complete' ? 'success' : value === 'In progress' ? 'warning' : 'info'}
        />
      ),
    },
    {
      field: 'flags',
      headerName: 'Flags',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.portabilityLocked && <StatusChip label="Locked" status="locked" />}
          {row.isException && <StatusChip label="Exception" status="exception" />}
        </Box>
      ),
    },
    ...(isAdmin || isManager ? [actionColumn] : []),
  ]

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Renewals"
        subtitle={`${stats.due} due in the next ${windowDays} days`}
        actions={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={windowDays}
              onChange={(_, value: RenewalWindow | null) => value && setWindowDays(value)}
              aria-label="Renewal window"
            >
              <ToggleButton value={30}>30 days</ToggleButton>
              <ToggleButton value={60}>60 days</ToggleButton>
              <ToggleButton value={90}>90 days</ToggleButton>
            </ToggleButtonGroup>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={advisor}
                onChange={(event) => setAdvisor(event.target.value)}
                aria-label="Filter by advisor"
              >
                <MenuItem value="all">All advisors</MenuItem>
                {advisors.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search renewals"
              aria-label="Search renewals"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Due in 30 days" value={stats.due} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Locked" value={stats.locked} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Exceptions" value={stats.exceptions} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Overdue" value={stats.overdue} />
        </Grid>
      </Grid>
      <SectionCard>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
          <Tab label="All Renewals" />
          <Tab
            label={
              <Badge badgeContent={stats.exceptions} color="primary">
                Exceptions
              </Badge>
            }
          />
        </Tabs>
        {tab === 1 && (
          <Alert severity="info" icon={<WarningAmberRoundedIcon />} sx={{ mt: 2 }}>
            These customers have a heavy claim history. They also appear in All Renewals.
          </Alert>
        )}
        <Box sx={{ mt: 2 }}>
          <PageState
            loading={false}
            error={query.isError}
            empty={!query.isLoading && !query.data?.length}
            forbidden={query.error?.message === 'FORBIDDEN'}
            onRetry={() => void query.refetch()}
          >
            {query.isLoading ? (
              <TableSkeleton rows={7} />
            ) : visibleRenewals.length ? (
              <Paper sx={{ overflow: 'hidden' }}>
                <DataGrid
                  rows={visibleRenewals}
                  columns={columns}
                  getRowId={(row) => row.id}
                  autoHeight
                  disableRowSelectionOnClick
                  getRowClassName={({ row }) =>
                    row.portabilityLocked && !row.exportOverride
                      ? 'renewal-locked'
                      : urgencyClass(row.daysToRenewal)
                  }
                  columnVisibilityModel={
                    isCompact ? { policyId: false, insurer: false, advisor: false } : undefined
                  }
                  sx={{
                    '& .renewal-locked': { bgcolor: 'locked.light' },
                    '& .renewal-urgent:hover, & .renewal-soon:hover': { bgcolor: 'primary.light' },
                    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                      outline: 'none',
                    },
                  }}
                  pageSizeOptions={[10, 20]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                />
              </Paper>
            ) : (
              <EmptyState
                title="No renewals in this window"
                description="Try a wider renewal window or clear a filter."
              />
            )}
          </PageState>
        </Box>
      </SectionCard>
      <ConfirmDialog
        open={Boolean(selectedRenewal)}
        title="Authorize export"
        description="This action is audited and will be recorded against the policy."
        confirmLabel="Authorize"
        onClose={closeAuthorize}
        onConfirm={() => {
          void form.handleSubmit(submitAuthorization)()
        }}
        loading={authorize.isPending}
      >
        {selectedRenewal && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedRenewal.customer}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedRenewal.policyId} · {selectedRenewal.insurer ?? 'Locked policy'}
              </Typography>
              <Typography variant="body2">
                <CurrencyText value={selectedRenewal.premium} variant="body2" /> due{' '}
                <DateText value={selectedRenewal.renewalDate} component="span" variant="body2" />
              </Typography>
            </Box>
            <TextField
              label="Reason for authorization"
              multiline
              minRows={3}
              {...form.register('reason')}
              error={Boolean(form.formState.errors.reason)}
              helperText={form.formState.errors.reason?.message ?? 'Required for audit history.'}
            />
          </Stack>
        )}
      </ConfirmDialog>
    </Stack>
  )
}
