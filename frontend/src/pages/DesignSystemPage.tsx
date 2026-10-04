import { useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip, type StatusVariant } from '@/components/ui/StatusChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ForbiddenState } from '@/components/ui/ForbiddenState'
import { CardSkeleton, SummarySkeleton, TableSkeleton } from '@/components/ui/SkeletonLoaders'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CurrencyText } from '@/components/ui/CurrencyText'
import { DateText } from '@/components/ui/DateText'

const statusVariants: StatusVariant[] = [
  'success',
  'warning',
  'error',
  'info',
  'neutral',
  'locked',
  'exception',
]
const columns: GridColDef[] = [
  { field: 'name', headerName: 'Customer', flex: 1 },
  { field: 'stage', headerName: 'Stage', flex: 1 },
  { field: 'premium', headerName: 'Premium', flex: 1 },
]
const rows = [
  { id: 1, name: 'Maya Chen', stage: 'Renewal review', premium: '₹1,25,000' },
  { id: 2, name: 'Andre Foster', stage: 'Client outreach', premium: '₹86,000' },
]

export function DesignSystemPage() {
  const [tab, setTab] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  return (
    <Stack spacing={4}>
      <PageHeader
        title="Design system"
        subtitle="A living reference for the Harborline interface."
        breadcrumbs={[{ label: 'Development' }, { label: 'Design system' }]}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />}>
            Primary action
          </Button>
        }
      />
      <Alert severity="info" icon={<InfoOutlinedIcon />}>
        Development-only route. These components are ready to compose into product workflows.
      </Alert>
      <SectionCard
        title="Typography and controls"
        subtitle="Readable hierarchy with compact, deliberate controls."
      >
        <Stack spacing={3}>
          <Stack component="div" direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Typography variant="h1">Page title</Typography>
              <Typography variant="h2">Section title</Typography>
              <Typography variant="h3">Card title</Typography>
              <Typography>Body text for operational details and workflows.</Typography>
              <Typography variant="caption" color="text.secondary">
                Caption text for supporting context
              </Typography>
            </Stack>
            <Stack spacing={2} sx={{ flex: 1 }}>
              <TextField label="Search customers" placeholder="Name or policy" />
              <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
                <Tab label="Overview" />
                <Tab label="Activity" />
                <Tab label="Notes" />
              </Tabs>
              <Stack component="div" direction="row" spacing={1}>
                <Button variant="contained">Contained</Button>
                <Button variant="outlined">Outlined</Button>
                <Button>Text</Button>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </SectionCard>
      <SectionCard title="Status and metrics">
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {statusVariants.map((variant) => (
              <StatusChip key={variant} status={variant} label={variant} />
            ))}
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Renewals due"
                value="128"
                trend={{ value: '12% this month', direction: 'up' }}
                icon={<CheckCircleOutlineRoundedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Premium retained"
                value={<CurrencyText value={125000} />}
                trend={{ value: '4% this month', direction: 'down' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Next review" value={<DateText value="2026-10-12" />} />
            </Grid>
          </Grid>
        </Stack>
      </SectionCard>
      <SectionCard
        title="Data and states"
        action={
          <Button variant="outlined" onClick={() => setSnackbarOpen(true)}>
            Show snackbar
          </Button>
        }
      >
        <Stack spacing={3}>
          <Box sx={{ height: 180 }}>
            <DataGrid rows={rows} columns={columns} hideFooter rowHeight={44} />
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <EmptyState />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ErrorState onRetry={() => undefined} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ForbiddenState />
            </Grid>
          </Grid>
        </Stack>
      </SectionCard>
      <SectionCard title="Loading and dialog">
        <Stack spacing={3}>
          <SummarySkeleton />
          <CardSkeleton />
          <TableSkeleton rows={3} />
          <Button
            variant="outlined"
            onClick={() => setDialogOpen(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Open confirmation dialog
          </Button>
        </Stack>
      </SectionCard>
      <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
        <Typography variant="caption" color="text.secondary">
          Tokens: 8px spacing grid · 12px card radius · 8px control radius · visible keyboard focus
          · tabular numeric values
        </Typography>
      </Paper>
      <ConfirmDialog
        open={dialogOpen}
        title="Archive this view?"
        description="This is a presentation-only confirmation dialog."
        onClose={() => setDialogOpen(false)}
        onConfirm={() => setDialogOpen(false)}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        message="Saved to local mock data"
      />
    </Stack>
  )
}
