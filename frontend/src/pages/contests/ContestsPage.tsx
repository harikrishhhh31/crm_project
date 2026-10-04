import { useMemo, useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Avatar,
  Box,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useContests, useContestSlabs, useRewards, useUpdateRewardStatus } from '@/api/useCrmData'
import { CurrencyText } from '@/components/ui/CurrencyText'
import { DateText } from '@/components/ui/DateText'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageState } from '@/components/ui/PageState'
import { SectionCard } from '@/components/ui/SectionCard'
import { SummarySkeleton, CardSkeleton } from '@/components/ui/SkeletonLoaders'
import { StatusChip } from '@/components/ui/StatusChip'
import { useRole } from '@/layout/useRole'
import { useSnackbar } from '@/components/ui/useSnackbar'
import type { Contest, Reward } from '@/types/crm'

function progressColor(value: number) {
  return value < 50 ? 'error.main' : value < 100 ? 'warning.main' : 'success.main'
}
function companyInitials(company: string) {
  return company
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
}
function periodLabel(value: Contest['periodType']) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function ContestProgressBar({ contest }: { contest: Contest }) {
  return (
    <Box sx={{ position: 'relative', pt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, contest.achievementPercent)}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'divider',
          '& .MuiLinearProgress-bar': {
            bgcolor: progressColor(contest.achievementPercent),
            borderRadius: 4,
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '100%',
          top: 3,
          width: 2,
          height: 18,
          bgcolor: 'text.primary',
        }}
        aria-label="Target marker"
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
        {contest.achievementPercent}% of {contest.target} target
      </Typography>
    </Box>
  )
}

function ContestCard({
  contest,
  onOpen,
}: {
  contest: Contest
  onOpen: (contest: Contest) => void
}) {
  return (
    <Box
      onClick={() => onOpen(contest)}
      sx={{
        cursor: 'pointer',
        height: '100%',
        '&:focus-visible': { outline: 3, outlineColor: 'primary.light', outlineOffset: 2 },
      }}
      tabIndex={0}
      role="button"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onOpen(contest)
      }}
    >
      <SectionCard>
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700 }}>
                {companyInitials(contest.company)}
              </Avatar>
              <Box>
                <Typography variant="h3">{contest.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {contest.company} · {periodLabel(contest.periodType)}
                </Typography>
              </Box>
            </Box>
            <StatusChip
              label={contest.status}
              status={contest.status === 'Complete' ? 'success' : 'info'}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {contest.period}
          </Typography>
          <ContestProgressBar contest={contest} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Logged in
              </Typography>
              <Typography variant="h3" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {contest.loggedIn}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Issued
              </Typography>
              <Typography variant="h3" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {contest.issued}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Current slab
              </Typography>
              <Typography variant="body2">{contest.currentSlab?.name ?? 'Not reached'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Expected incentive
              </Typography>
              <CurrencyText value={contest.expectedIncentive} variant="body2" />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {contest.nextSlabGap > 0
              ? `${contest.nextSlabGap} more policies to reach `
              : 'Top slab reached · '}{' '}
            {contest.nextSlabGap > 0 && (
              <CurrencyText value={contest.nextSlabIncentive} component="span" variant="body2" />
            )}
          </Typography>
        </Stack>
      </SectionCard>
    </Box>
  )
}

function RewardsTable({
  rewards,
  canManage,
  onToggle,
  savingId,
}: {
  rewards: Reward[]
  canManage: boolean
  onToggle: (reward: Reward, paid: boolean) => void
  savingId: string | null
}) {
  if (!rewards.length)
    return (
      <EmptyState
        title="No rewards yet"
        description="Rewards will appear when this contest issues incentives."
      />
    )
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Advisor</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Date received</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rewards.map((reward) => (
          <TableRow key={reward.id}>
            <TableCell>{reward.advisor}</TableCell>
            <TableCell>
              <CurrencyText value={reward.amount} variant="body2" />
            </TableCell>
            <TableCell>
              <DateText value={reward.issuedOn} variant="body2" />
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatusChip
                  label={reward.status}
                  status={reward.status === 'PAID' ? 'success' : 'warning'}
                />
                {canManage && (
                  <Switch
                    size="small"
                    checked={reward.status === 'PAID'}
                    disabled={savingId === reward.id}
                    onChange={(event) => onToggle(reward, event.target.checked)}
                    slotProps={{ input: { 'aria-label': `Toggle ${reward.advisor} reward` } }}
                  />
                )}
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ContestDrawer({ contest, onClose }: { contest: Contest | null; onClose: () => void }) {
  const slabsQuery = useContestSlabs(contest?.id ?? '')
  const rewardsQuery = useRewards()
  const { isAdmin, isManager } = useRole()
  const { showSuccess, showError } = useSnackbar()
  const queryClient = useQueryClient()
  const updateReward = useUpdateRewardStatus()
  const selectedRewards =
    rewardsQuery.data?.filter((reward) => reward.contestId === contest?.id) ?? []
  const toggleReward = async (reward: Reward, paid: boolean) => {
    const previous = rewardsQuery.data
    queryClient.setQueryData(
      ['rewards'],
      previous?.map((item) =>
        item.id === reward.id ? { ...item, status: paid ? 'PAID' : 'PENDING' } : item,
      ),
    )
    try {
      await updateReward.mutateAsync({ rewardId: reward.id, status: paid ? 'PAID' : 'PENDING' })
      showSuccess(`Reward marked ${paid ? 'PAID' : 'PENDING'}.`)
    } catch {
      queryClient.setQueryData(['rewards'], previous)
      showError('Reward status could not be updated. The previous value was restored.')
    }
  }
  return (
    <Drawer
      anchor="right"
      open={Boolean(contest)}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 560 }, p: { xs: 2, sm: 3 } } } }}
    >
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box>
          <Typography variant="h2">{contest?.name}</Typography>
          <Typography color="text.secondary">
            {contest?.company} · {contest && periodLabel(contest.periodType)} · {contest?.period}
          </Typography>
        </Box>
        <IconButton aria-label="Close contest details" onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      {contest && (
        <Stack spacing={3}>
          <SectionCard title="Slab progress">
            <Stack spacing={2}>
              <ContestProgressBar contest={contest} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Slab</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Incentive</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slabsQuery.data?.map((slab) => (
                    <TableRow
                      key={slab.id}
                      sx={{
                        bgcolor:
                          contest.currentSlab?.id === slab.id ? 'primary.light' : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{ fontWeight: contest.currentSlab?.id === slab.id ? 600 : 400 }}
                        >
                          {slab.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{slab.target}</TableCell>
                      <TableCell>
                        <CurrencyText value={slab.incentive} variant="body2" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </SectionCard>
          <SectionCard title="Rewards">
            <RewardsTable
              rewards={selectedRewards}
              canManage={isAdmin || isManager}
              onToggle={toggleReward}
              savingId={updateReward.isPending ? (updateReward.variables?.rewardId ?? null) : null}
            />
          </SectionCard>
        </Stack>
      )}
    </Drawer>
  )
}

export function ContestsPage() {
  const query = useContests()
  const rewardsQuery = useRewards()
  const { isAdvisor } = useRole()
  const [company, setCompany] = useState('all')
  const [periodType, setPeriodType] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const companies = useMemo(
    () => [...new Set((query.data ?? []).map((contest) => contest.company))],
    [query.data],
  )
  const filtered = (query.data ?? []).filter(
    (contest) =>
      (company === 'all' || contest.company === company) &&
      (periodType === 'all' || contest.periodType === periodType) &&
      (status === 'all' || contest.status === status),
  )
  const loading = query.isLoading || rewardsQuery.isLoading
  return (
    <Stack spacing={4}>
      <PageHeader
        title="Contests"
        subtitle="Track achievement, slabs, and issued incentives."
        actions={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                aria-label="Filter by insurance company"
              >
                <MenuItem value="all">All companies</MenuItem>
                {companies.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 125 }}>
              <Select
                value={periodType}
                onChange={(event) => setPeriodType(event.target.value)}
                aria-label="Filter by period"
              >
                <MenuItem value="all">All periods</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter by status"
              >
                <MenuItem value="all">All status</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
      />
      <PageState
        loading={false}
        error={query.isError || rewardsQuery.isError}
        empty={!loading && !filtered.length}
        forbidden={isAdvisor}
        onRetry={() => {
          void query.refetch()
          void rewardsQuery.refetch()
        }}
      >
        {loading ? (
          <Stack spacing={2}>
            <SummarySkeleton />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CardSkeleton />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CardSkeleton />
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((contest) => (
              <Grid key={contest.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <ContestCard contest={contest} onOpen={setSelectedContest} />
              </Grid>
            ))}
          </Grid>
        )}
      </PageState>
      <ContestDrawer contest={selectedContest} onClose={() => setSelectedContest(null)} />
    </Stack>
  )
}
