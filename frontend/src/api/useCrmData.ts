import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mockStore } from '@/mocks/crm'
import type { ClaimStage, ClaimTemplate, ContestProgress, CustomerSummary } from '@/types/crm'

const delay = (minimum = 400, maximum = 800) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, minimum + Math.floor(Math.random() * (maximum - minimum + 1)))
  })

async function simulate<T>(read: () => T, errorRate = 0.12): Promise<T> {
  await delay()
  if (Math.random() < errorRate) throw new Error('The mock service is temporarily unavailable.')
  return read()
}

const queryOptions = <T>(key: string, read: () => T) => ({
  queryKey: [key],
  queryFn: () => simulate(read),
  staleTime: 0,
  retry: false,
})

export const useCustomers = () => useQuery(queryOptions('customers', () => mockStore.customers))

export const useCustomerSummary = (customerId?: string) =>
  useQuery<CustomerSummary | null>(
    queryOptions(`customer-summary-${customerId ?? mockStore.customers[0].id}`, () => {
      const customer = mockStore.customers.find(
        (item) => item.id === (customerId ?? mockStore.customers[0].id),
      )
      if (!customer) return null
      const policies = mockStore.policies.filter((policy) => policy.customerId === customer.id)
      const claims = mockStore.claims.filter((claim) => claim.customerId === customer.id)
      return {
        customer,
        policies,
        claims,
        renewals: mockStore.renewals.filter((renewal) => renewal.customerId === customer.id),
        documents: mockStore.documents.filter((document) => document.customerId === customer.id),
        claimStatusHistory: mockStore.claimStatusHistory.filter((history) =>
          claims.some((claim) => claim.id === history.claimId),
        ),
        totalPremium: policies.reduce((total, policy) => total + policy.premium, 0),
        openClaims: claims.filter((claim) => !['SETTLED', 'REJECTED'].includes(claim.stage)).length,
      }
    }),
  )

export const useRenewals = () => useQuery(queryOptions('renewals', () => mockStore.renewals))
export const useRenewalExceptions = () =>
  useQuery(
    queryOptions('renewal-exceptions', () =>
      mockStore.renewals.filter((renewal) => renewal.isException),
    ),
  )

export const useAuthorizeRenewalExport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ policyId, reason }: { policyId: string; reason: string }) =>
      simulate(() => {
        const policy = mockStore.policies.find((item) => item.id === policyId)
        const renewal = mockStore.renewals.find((item) => item.policyId === policyId)
        if (!policy || !renewal) throw new Error('Renewal policy not found.')
        if (policy.portabilityLocked && !policy.exportOverride) {
          Object.assign(policy, {
            exportOverride: true,
            insurer: 'LIC',
            coverage: 'Authorization-released policy',
            sumAssured: 0,
            startDate: '2021-01-01',
            status: 'PENDING_RENEWAL',
          })
        }
        renewal.exportOverride = true
        renewal.insurer = policy.insurer
        return { policyId, reason }
      }, 0.08),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['renewals'] })
      void queryClient.invalidateQueries({ queryKey: ['renewal-exceptions'] })
    },
  })
}
export const useClaimUpdateSetting = () =>
  useQuery(queryOptions('claim-update-setting', () => mockStore.claimUpdatesEnabled))
export const useClaimTemplates = () =>
  useQuery(
    queryOptions('claim-templates', () =>
      mockStore.claimTemplates.filter((template) => template.active),
    ),
  )

export const useUpdateClaimTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      templateId,
      subject,
      body,
    }: {
      templateId: string
      subject: string
      body: string
    }) =>
      simulate(() => {
        const template = mockStore.claimTemplates.find((item) => item.id === templateId)
        if (!template) throw new Error('Claim template not found.')
        template.subject = subject
        template.body = body
        template.customized = true
        return template
      }, 0.08),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['claim-templates'] })
    },
  })
}

export const useResetClaimTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (templateId: string) =>
      simulate(() => {
        const template = mockStore.claimTemplates.find((item) => item.id === templateId)
        if (!template) throw new Error('Claim template not found.')
        template.subject = template.defaultSubject
        template.body = template.defaultBody
        template.customized = false
        return template
      }, 0.08),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['claim-templates'] })
    },
  })
}
export const useContests = () => useQuery(queryOptions('contests', () => mockStore.contests))
export const useRewards = () => useQuery(queryOptions('rewards', () => mockStore.rewards))

export const useContestProgress = (contestId: string) =>
  useQuery<ContestProgress>(
    queryOptions(`contest-progress-${contestId}`, () => {
      const contest =
        mockStore.contests.find((item) => item.id === contestId) ?? mockStore.contests[0]
      const slabs = mockStore.contestSlabs.filter((slab) => contest.slabIds.includes(slab.id))
      const currentSlab =
        slabs.filter((slab) => slab.target <= contest.achievementPercent).at(-1) ?? null
      const nextSlab = slabs.find((slab) => slab.target > contest.achievementPercent)
      return {
        target: contest.target,
        loggedIn: contest.loggedIn,
        issued: mockStore.rewards.filter((reward) => reward.contestId === contest.id).length,
        achievementPercent: contest.achievementPercent,
        currentSlab,
        expectedIncentive: currentSlab?.incentive ?? 0,
        nextSlabGap: nextSlab ? nextSlab.target - contest.achievementPercent : 0,
      }
    }),
  )
export const useContestSlabs = (contestId: string) =>
  useQuery(
    queryOptions(`contest-slabs-${contestId}`, () =>
      mockStore.contestSlabs.filter((slab) => slab.contestId === contestId),
    ),
  )

export const useUpdateClaimStage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      claimId,
      stage,
      note = 'Stage updated from the advisor workspace.',
      changedBy = 'Jordan Lee',
    }: {
      claimId: string
      stage: ClaimStage
      note?: string
      changedBy?: string
    }) =>
      simulate(() => {
        const claim = mockStore.claims.find((item) => item.id === claimId)
        if (!claim) throw new Error('Claim not found.')
        claim.stage = stage
        mockStore.claimStatusHistory.push({
          id: `${claimId}-H${mockStore.claimStatusHistory.length + 1}`,
          claimId,
          stage,
          changedAt: new Date().toISOString(),
          changedBy,
          note,
        })
        return claim
      }, 0.08),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['customer-summary'] })
      void queryClient.invalidateQueries({ queryKey: [`claim-${variables.claimId}`] })
    },
  })
}

export const useUpdateClaimUpdateSetting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enabled: boolean) =>
      simulate(() => {
        mockStore.claimUpdatesEnabled = enabled
        mockStore.customers.forEach((customer) => {
          customer.claimUpdatesEnabled = enabled
        })
        return enabled
      }, 0.08),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['claim-update-setting'] })
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export const useCreateClaimTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (template: Omit<ClaimTemplate, 'id'>) =>
      simulate(() => {
        const created = {
          ...template,
          id: `TPL-${String(mockStore.claimTemplates.length + 1).padStart(2, '0')}`,
        }
        mockStore.claimTemplates.push(created)
        return created
      }, 0.08),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['claim-templates'] })
    },
  })
}

export const useUpdateContestProgress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ contestId, loggedIn }: { contestId: string; loggedIn: number }) =>
      simulate(() => {
        const contest = mockStore.contests.find((item) => item.id === contestId)
        if (!contest) throw new Error('Contest not found.')
        contest.loggedIn = loggedIn
        contest.achievementPercent = Math.min(100, Math.round((loggedIn / contest.target) * 100))
        return contest
      }, 0.08),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['contests'] })
      void queryClient.invalidateQueries({ queryKey: [`contest-progress-${variables.contestId}`] })
    },
  })
}

export const useMarkRewardPaid = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rewardId: string) =>
      simulate(() => {
        const reward = mockStore.rewards.find((item) => item.id === rewardId)
        if (!reward) throw new Error('Reward not found.')
        reward.status = 'PAID'
        return reward
      }, 0.08),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rewards'] })
    },
  })
}

export const useUpdateRewardStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ rewardId, status }: { rewardId: string; status: 'PAID' | 'PENDING' }) =>
      simulate(() => {
        const reward = mockStore.rewards.find((item) => item.id === rewardId)
        if (!reward) throw new Error('Reward not found.')
        reward.status = status
        return reward
      }, 0.08),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rewards'] })
    },
  })
}
