import { useState } from 'react'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import FilePresentOutlinedIcon from '@mui/icons-material/FilePresentOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomerSummary, useUpdateClaimStage } from '@/api/useCrmData'
import { CurrencyText } from '@/components/ui/CurrencyText'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DateText } from '@/components/ui/DateText'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageState } from '@/components/ui/PageState'
import { SectionCard } from '@/components/ui/SectionCard'
import { StatCard } from '@/components/ui/StatCard'
import { StatusChip, type StatusVariant } from '@/components/ui/StatusChip'
import { CardSkeleton, SummarySkeleton, TableSkeleton } from '@/components/ui/SkeletonLoaders'
import type { Claim, ClaimStage, CustomerSummary, Document, Policy } from '@/types/crm'
import { useSnackbar } from '@/components/ui/useSnackbar'
import './customer-print.css'

const claimStageStatus: Record<ClaimStage, StatusVariant> = {
  REGISTERED: 'info',
  DOCUMENTS_PENDING: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  SETTLED: 'success',
  REJECTED: 'error',
}
const claimStageLabel: Record<ClaimStage, string> = {
  REGISTERED: 'Registered',
  DOCUMENTS_PENDING: 'Documents pending',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  SETTLED: 'Settled',
  REJECTED: 'Rejected',
}
const claimStageOrder: ClaimStage[] = [
  'REGISTERED',
  'DOCUMENTS_PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'SETTLED',
  'REJECTED',
]
const documentGroups = ['KYC', 'POLICY', 'CLAIM'] as const

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
function daysColor(days: number) {
  return days <= 7 ? 'error.main' : days <= 30 ? 'warning.main' : 'success.main'
}
function documentIcon(document: Document) {
  return document.name.toLowerCase().includes('pdf') ? (
    <PictureAsPdfOutlinedIcon />
  ) : document.type === 'KYC' ? (
    <DescriptionOutlinedIcon />
  ) : document.type === 'CLAIM' ? (
    <FilePresentOutlinedIcon />
  ) : (
    <InsertDriveFileOutlinedIcon />
  )
}

function PolicyTable({
  policies,
  exceptionPolicyIds,
}: {
  policies: Policy[]
  exceptionPolicyIds: Set<string>
}) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Policy number</TableCell>
            <TableCell>Insurer</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Premium</TableCell>
            <TableCell>Renewal date</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {policies.map((policy) => {
            const locked = policy.portabilityLocked && !policy.exportOverride
            if (locked)
              return (
                <TableRow key={policy.id}>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'locked.main',
                        py: 1,
                      }}
                    >
                      <LockOutlinedIcon fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Locked - authorization required
                      </Typography>
                      {exceptionPolicyIds.has(policy.id) && (
                        <StatusChip label="Exception" status="exception" />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            return (
              <TableRow key={policy.id}>
                <TableCell>{policy.policyNumber}</TableCell>
                <TableCell>{policy.insurer}</TableCell>
                <TableCell>{policy.product}</TableCell>
                <TableCell>
                  <CurrencyText value={policy.premium} variant="body2" />
                </TableCell>
                <TableCell>
                  <DateText value={policy.renewalDate} variant="body2" />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <StatusChip
                      label={policy.status === 'PENDING_RENEWAL' ? 'Pending renewal' : 'Active'}
                      status={policy.status === 'PENDING_RENEWAL' ? 'warning' : 'success'}
                    />
                    {policy.portabilityLocked && <StatusChip label="Locked" status="locked" />}
                    {exceptionPolicyIds.has(policy.id) && (
                      <StatusChip label="Exception" status="exception" />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function StageSelect({
  claim,
  disabled,
  onChange,
}: {
  claim: Claim
  disabled: boolean
  onChange: (stage: ClaimStage) => void
}) {
  return (
    <Select
      size="small"
      value={claim.stage}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as ClaimStage)}
      renderValue={(value) => (
        <StatusChip
          label={claimStageLabel[value as ClaimStage]}
          status={claimStageStatus[value as ClaimStage]}
        />
      )}
      sx={{
        minWidth: 150,
        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', py: 0.5 },
      }}
      aria-label={`Update stage for ${claim.claimNumber}`}
    >
      {claimStageOrder.map((stage) => (
        <MenuItem key={stage} value={stage}>
          {claimStageLabel[stage]}
        </MenuItem>
      ))}
    </Select>
  )
}

function ClaimsHistory({ claims }: { claims: Claim[] }) {
  const updateStage = useUpdateClaimStage()
  const { showSuccess, showError } = useSnackbar()
  const [pendingChange, setPendingChange] = useState<{ claim: Claim; stage: ClaimStage } | null>(
    null,
  )
  if (!claims.length)
    return (
      <EmptyState title="No claim history" description="This customer has no claims recorded." />
    )
  const confirmChange = async () => {
    if (!pendingChange) return
    const isEarlier =
      claimStageOrder.indexOf(pendingChange.stage) <
      claimStageOrder.indexOf(pendingChange.claim.stage)
    try {
      await updateStage.mutateAsync({
        claimId: pendingChange.claim.id,
        stage: pendingChange.stage,
        changedBy: 'Jordan Lee',
        note: isEarlier
          ? 'Stage moved back after confirmation.'
          : 'Stage updated from the customer profile.',
      })
      showSuccess(
        pendingChange.claim.claimUpdatesEnabled
          ? 'Stage updated and customer notified'
          : 'Stage updated',
      )
      setPendingChange(null)
    } catch {
      showError('Stage update failed. Please try again.')
    }
  }
  const pendingIsEarlier = pendingChange
    ? claimStageOrder.indexOf(pendingChange.stage) <
      claimStageOrder.indexOf(pendingChange.claim.stage)
    : false
  const description = pendingChange?.claim.claimUpdatesEnabled
    ? 'A customer message will be sent automatically after this stage change.'
    : 'No customer message will be sent because automatic claim updates are disabled.'
  return (
    <>
      <Stack spacing={1.5}>
        {claims.map((claim) => (
          <Box
            key={claim.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              py: 1,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {claim.claimNumber}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {claim.type} · <DateText value={claim.filedOn} component="span" variant="caption" />
              </Typography>
            </Box>
            <StageSelect
              claim={claim}
              disabled={updateStage.isPending}
              onChange={(stage) => setPendingChange({ claim, stage })}
            />
          </Box>
        ))}
      </Stack>
      <ConfirmDialog
        open={Boolean(pendingChange)}
        title={pendingIsEarlier ? 'Move claim to an earlier stage?' : 'Update claim stage?'}
        description={`${pendingIsEarlier ? 'This moves the claim back to an earlier stage and requires confirmation. ' : ''}${description}`}
        confirmLabel="Update stage"
        onClose={() => {
          if (!updateStage.isPending) setPendingChange(null)
        }}
        onConfirm={() => {
          void confirmChange()
        }}
        loading={updateStage.isPending}
      />
    </>
  )
}

function DocumentsList({ documents }: { documents: Document[] }) {
  return (
    <Stack spacing={2}>
      {documentGroups.map((group) => (
        <Box key={group}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {group}
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {documents
              .filter((document) => document.type === group)
              .map((document) => (
                <Box
                  key={document.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}
                >
                  <Box sx={{ color: 'primary.main', display: 'flex' }}>
                    {documentIcon(document)}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" noWrap>
                      {document.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <DateText value={document.uploadedOn} component="span" variant="caption" />
                    </Typography>
                  </Box>
                  <StatusChip
                    label={document.verified ? 'Verified' : 'Pending'}
                    status={document.verified ? 'success' : 'warning'}
                  />
                </Box>
              ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

function StageTimeline({
  claimId,
  history,
}: {
  claimId: string
  history: CustomerSummary['claimStatusHistory']
}) {
  const entries = history.filter((item) => item.claimId === claimId)
  if (!entries.length)
    return (
      <EmptyState title="No stage history" description="No status changes have been recorded." />
    )
  return (
    <Stack spacing={0.5}>
      {entries.map((entry, index) => (
        <Box
          key={`${entry.claimId}-${entry.changedAt}-${index}`}
          sx={{
            display: 'flex',
            gap: 2,
            position: 'relative',
            pb: index === entries.length - 1 ? 0 : 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              width: 16,
              '&:after':
                index === entries.length - 1
                  ? {}
                  : {
                      content: '""',
                      position: 'absolute',
                      top: 16,
                      bottom: -8,
                      width: 1,
                      bgcolor: 'divider',
                    },
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                mt: 0.5,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                zIndex: 1,
              }}
            />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {claimStageLabel[entry.stage]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <DateText value={entry.changedAt} component="span" variant="caption" /> ·{' '}
              {entry.changedBy}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {entry.note}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  )
}

function ProfileDocument({ data }: { data: CustomerSummary }) {
  const [tab, setTab] = useState(0)
  const exceptionPolicyIds = new Set(
    data.renewals.filter((renewal) => renewal.isException).map((renewal) => renewal.policyId),
  )
  return (
    <Stack spacing={3} className="customer-print-shell">
      <Paper className="customer-print-header customer-print-section" sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            bgcolor: 'primary.light',
            p: { xs: 2, md: 3 },
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {initials(data.customer.name)}
            </Avatar>
            <Box>
              <Typography variant="h1">{data.customer.name}</Typography>
              <Typography color="text.secondary">
                {data.customer.email} · {data.customer.phone}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer since{' '}
                <DateText value={data.customer.customerSince} component="span" variant="caption" />
              </Typography>
            </Box>
          </Box>
          <Box className="customer-print-hidden">
            <Button
              variant="outlined"
              startIcon={<PrintOutlinedIcon />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ p: { xs: 2, md: 3 } }} className="customer-print-stat">
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Active policies" value={data.policies.length} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Total premium" value={<CurrencyText value={data.totalPremium} />} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard label="Open claims" value={data.openClaims} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              label="Renewals due in 30 days"
              value={data.renewals.filter((renewal) => renewal.daysToRenewal <= 30).length}
            />
          </Grid>
        </Grid>
      </Paper>
      <Box
        className="customer-print-two-column"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.55fr) minmax(280px, 0.85fr)' },
          gap: 3,
        }}
      >
        <Stack spacing={3}>
          <SectionCard title="Policies">
            <PolicyTable policies={data.policies} exceptionPolicyIds={exceptionPolicyIds} />
          </SectionCard>
          <SectionCard title="Claims history">
            <ClaimsHistory claims={data.claims} />
          </SectionCard>
        </Stack>
        <Stack spacing={3}>
          <SectionCard title="Outstanding renewals">
            <Stack spacing={1.5}>
              {data.renewals.length ? (
                data.renewals.map((renewal) => (
                  <Box
                    key={renewal.id}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.5 }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {renewal.customer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <DateText value={renewal.renewalDate} component="span" variant="caption" />
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: daysColor(renewal.daysToRenewal),
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {renewal.daysToRenewal} days
                    </Typography>
                  </Box>
                ))
              ) : (
                <EmptyState title="No outstanding renewals" />
              )}
            </Stack>
          </SectionCard>
          <SectionCard title="Commission">
            <Typography color="text.secondary">Not available yet</Typography>
          </SectionCard>
          <SectionCard title="Documents">
            <DocumentsList documents={data.documents} />
          </SectionCard>
        </Stack>
      </Box>
      <Divider className="customer-print-hidden" />
      <Box className="customer-tabs">
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
          <Tab label="Policies" />
          <Tab label="Claims" />
          <Tab label="Documents" />
          <Tab label="Activity" />
        </Tabs>
        <Box sx={{ pt: 3 }}>
          {tab === 0 && (
            <SectionCard title="All policies">
              <PolicyTable policies={data.policies} exceptionPolicyIds={exceptionPolicyIds} />
            </SectionCard>
          )}
          {tab === 1 && (
            <SectionCard title="Claim stage history">
              <Stack spacing={3}>
                {data.claims.map((claim) => (
                  <Box key={claim.id}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {claim.claimNumber}
                    </Typography>
                    <StageTimeline claimId={claim.id} history={data.claimStatusHistory} />
                  </Box>
                ))}
              </Stack>
            </SectionCard>
          )}
          {tab === 2 && (
            <SectionCard title="All documents">
              <DocumentsList documents={data.documents} />
            </SectionCard>
          )}
          {tab === 3 && (
            <SectionCard title="Activity">
              <EmptyState
                title="No recent activity"
                description="Customer activity will appear here as the relationship develops."
              />
            </SectionCard>
          )}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" className="customer-print-section">
        Generated on <DateText value="2026-10-04" component="span" variant="caption" /> by Jordan
        Lee
      </Typography>
    </Stack>
  )
}

export function CustomerDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const query = useCustomerSummary(id)
  return (
    <Stack spacing={3} className="customer-print-shell">
      <Box className="customer-page-header">
        <PageHeader
          title={query.data?.customer.name ?? 'Customer profile'}
          subtitle="Relationship overview and policy context."
          actions={
            <Box className="customer-print-hidden" sx={{ display: 'flex', gap: 1 }}>
              <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/customers')}>
                Back to customers
              </Button>
              {query.data && (
                <Button
                  variant="contained"
                  startIcon={<PrintOutlinedIcon />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              )}
            </Box>
          }
        />
      </Box>
      <PageState
        loading={query.isLoading}
        error={query.isError}
        empty={!query.isLoading && !query.data}
        onRetry={() => void query.refetch()}
      >
        {query.data && <ProfileDocument data={query.data} />}
      </PageState>
      {query.isLoading && (
        <Stack spacing={2}>
          <SummarySkeleton />
          <CardSkeleton />
          <TableSkeleton rows={5} />
        </Stack>
      )}
    </Stack>
  )
}
