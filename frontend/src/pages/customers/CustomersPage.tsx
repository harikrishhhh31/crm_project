import { useState } from 'react'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '@/api/useCrmData'
import { DateText } from '@/components/ui/DateText'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageState } from '@/components/ui/PageState'
import { StatusChip } from '@/components/ui/StatusChip'
import { SectionCard } from '@/components/ui/SectionCard'
import type { Customer } from '@/types/crm'

const columns: GridColDef<Customer>[] = [
  { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 180 },
  { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 150 },
  {
    field: 'activePolicies',
    headerName: 'Active policies',
    type: 'number',
    flex: 0.8,
    minWidth: 130,
  },
  {
    field: 'nextRenewalDate',
    headerName: 'Next renewal',
    flex: 1,
    minWidth: 140,
    renderCell: ({ value }) => <DateText value={value as string} />,
  },
  {
    field: 'openClaims',
    headerName: 'Open claims',
    type: 'number',
    flex: 0.8,
    minWidth: 120,
    renderCell: ({ value }) => (
      <StatusChip label={String(value)} status={Number(value) > 0 ? 'warning' : 'neutral'} />
    ),
  },
]

export function CustomersPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('md'))
  const query = useCustomers()
  const [search, setSearch] = useState('')
  const filteredCustomers =
    query.data?.filter((customer) =>
      `${customer.name} ${customer.phone} ${customer.email} ${customer.city}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) ?? []
  return (
    <Stack spacing={4}>
      <PageHeader
        title="Customers"
        subtitle="A clear view of every active relationship."
        actions={
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers"
            size="small"
            aria-label="Search customers"
            sx={{ minWidth: { sm: 280 } }}
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
        }
      />
      <PageState
        loading={query.isLoading}
        error={query.isError}
        empty={!query.isLoading && !query.data?.length}
        onRetry={() => void query.refetch()}
      >
        {filteredCustomers.length ? (
          <SectionCard>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <DataGrid
                rows={filteredCustomers}
                columns={columns}
                getRowId={(row) => row.id}
                autoHeight
                disableRowSelectionOnClick
                onRowClick={(params) => navigate(`/customers/${params.row.id}`)}
                columnVisibilityModel={
                  isCompact ? { phone: false, nextRenewalDate: false } : undefined
                }
                pageSizeOptions={[10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
              />
            </Paper>
          </SectionCard>
        ) : (
          <EmptyState
            title="No matching customers"
            description="Try a different name, phone number, email, or city."
          />
        )}
      </PageState>
      <Typography variant="caption" color="text.secondary">
        {filteredCustomers.length} customer{filteredCustomers.length === 1 ? '' : 's'} shown
      </Typography>
    </Stack>
  )
}
