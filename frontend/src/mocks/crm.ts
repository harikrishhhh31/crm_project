import type {
  Claim,
  ClaimStatusHistory,
  ClaimTemplate,
  Contest,
  ContestSlab,
  Customer,
  Document,
  Policy,
  Renewal,
  Reward,
} from '@/types/crm'

const names = [
  'Aarav Mehta',
  'Ananya Iyer',
  'Vikram Singh',
  'Meera Nair',
  'Rohan Shah',
  'Kavya Reddy',
  'Arjun Kapoor',
  'Ishita Bose',
  'Rahul Menon',
  'Sneha Joshi',
  'Aditya Rao',
  'Priya Deshmukh',
  'Kabir Malhotra',
  'Neha Kulkarni',
  'Sanjay Pillai',
  'Tanya Bhatia',
  'Dev Patel',
  'Nandini Gupta',
  'Manish Verma',
  'Aditi Chawla',
]
const cities = ['Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Jaipur']
const advisors = ['Jordan Lee', 'Sam Rivera', 'Aarav Menon', 'Ritika Shah']
const insurers = ['LIC', 'HDFC Life', 'ICICI Prudential', 'Star Health'] as const
const products = ['Life Secure Plus', 'Family Protect', 'Health Shield', 'Term Advantage']

export const customers: Customer[] = names.map((name, index) => ({
  id: `CU-${2201 + index}`,
  name,
  phone: `+91 98${String(10000000 + index * 13791).slice(0, 8)}`,
  email: `${name.toLowerCase().replaceAll(' ', '.')}@example.in`,
  city: cities[index % cities.length],
  advisor: advisors[index % advisors.length],
  customerSince: `201${(index % 5) + 1}-04-${String(3 + (index % 20)).padStart(2, '0')}`,
  policyIds: index === 0 ? ['PL-4001', 'PL-4021', 'PL-4022', 'PL-4023'] : [`PL-${4001 + index}`],
  claimIds:
    index === 0
      ? ['CL-6001', 'CL-6002', 'CL-6003']
      : index === 1
        ? ['CL-6004', 'CL-6005', 'CL-6006', 'CL-6010', 'CL-6011', 'CL-6012']
        : index < 7
          ? [`CL-${6001 + index}`]
          : [],
  activePolicies: index === 0 ? 4 : 1,
  nextRenewalDate: `2026-10-${String(4 + index).padStart(2, '0')}`,
  openClaims: index === 0 ? 3 : index === 1 ? 6 : index < 7 ? 1 : 0,
  stage:
    index % 4 === 0
      ? 'Renewal review'
      : index % 4 === 1
        ? 'Client outreach'
        : index % 4 === 2
          ? 'In progress'
          : 'Complete',
  lastContact: index < 3 ? 'Today, 9:42 AM' : `2026-09-${String(18 + index).padStart(2, '0')}`,
  claimUpdatesEnabled: index % 5 !== 2,
}))

const availablePolicy = (index: number): Policy => ({
  id: `PL-${4001 + index}`,
  customerId: `CU-${2201 + index}`,
  policyNumber: `POL/${insurers[index % insurers.length].slice(0, 3).toUpperCase()}/${778100 + index}`,
  product: products[index % products.length],
  premium: [125000, 86000, 192000, 74000][index % 4],
  renewalDate: `2026-10-${String(4 + index).padStart(2, '0')}`,
  daysToRenewal: [25, 30, 31][index % 3],
  advisor: advisors[index % advisors.length],
  portabilityLocked: false,
  exportOverride: index === 3,
  insurer: insurers[index % insurers.length],
  coverage: index % 2 === 0 ? 'Individual + family floater' : 'Individual cover',
  sumAssured: [2500000, 5000000, 10000000][index % 3],
  startDate: `2021-04-${String(3 + index).padStart(2, '0')}`,
  status: index % 6 === 0 ? 'PENDING_RENEWAL' : 'ACTIVE',
})

const lockedPolicy = (index: number): Policy => ({
  id: `PL-${4001 + index}`,
  customerId: `CU-${2201 + index}`,
  policyNumber: `POL/LOCK/${778100 + index}`,
  product: products[index % products.length],
  premium: 90000 + index * 2500,
  renewalDate: `2026-10-${String(4 + index).padStart(2, '0')}`,
  daysToRenewal: [25, 30, 31][index % 3],
  advisor: advisors[index % advisors.length],
  portabilityLocked: true,
  exportOverride: false,
  insurer: null,
  coverage: null,
  sumAssured: null,
  startDate: null,
  status: null,
})

export const policies: Policy[] = customers
  .map((_, index) => (index === 4 || index === 12 ? lockedPolicy(index) : availablePolicy(index)))
  .concat(
    [availablePolicy(20), availablePolicy(21), availablePolicy(22)].map((policy, index) => ({
      ...policy,
      id: `PL-${4021 + index}`,
      customerId: 'CU-2201',
      policyNumber: `POL/DEMO/${778121 + index}`,
      advisor: customers[0].advisor,
    })),
  )

const claimStages = [
  'REGISTERED',
  'DOCUMENTS_PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'SETTLED',
  'REJECTED',
] as const
export const claims: Claim[] = claimStages.map((stage, index) => ({
  id: `CL-${6001 + index}`,
  customerId: index < 3 ? 'CU-2201' : 'CU-2202',
  policyId: index < 3 ? 'PL-4001' : 'PL-4002',
  claimNumber: `CLM/2026/${1001 + index}`,
  type: index % 2 === 0 ? 'Hospitalization' : 'Critical illness',
  amount: [185000, 92000, 340000, 125000, 275000, 68000][index],
  filedOn: `2026-0${index + 3}-12`,
  stage,
  assignedTo: advisors[index % advisors.length],
  description: `Claim assessment for ${stage.toLowerCase().replaceAll('_', ' ')} workflow.`,
  claimUpdatesEnabled: true,
}))
claims.push(
  ...customers.slice(1, 7).map((customer, index) => ({
    id: `CL-${6010 + index}`,
    customerId: customer.id,
    policyId: customer.policyIds[0],
    claimNumber: `CLM/2026/${1010 + index}`,
    type: 'Hospitalization' as const,
    amount: 50000 + index * 17000,
    filedOn: `2026-08-${String(10 + index).padStart(2, '0')}`,
    stage: claimStages[index % claimStages.length],
    assignedTo: customer.advisor,
    description: 'Demo claim for portfolio review.',
    claimUpdatesEnabled: customer.claimUpdatesEnabled,
  })),
)

export const claimStatusHistory: ClaimStatusHistory[] = claims.flatMap((claim) => [
  {
    id: `${claim.id}-H1`,
    claimId: claim.id,
    stage: 'REGISTERED',
    changedAt: claim.filedOn,
    changedBy: claim.assignedTo,
    note: 'Claim registered in the service workspace.',
  },
  {
    id: `${claim.id}-H2`,
    claimId: claim.id,
    stage: claim.stage,
    changedAt: '2026-09-20',
    changedBy: claim.assignedTo,
    note: `Claim moved to ${claim.stage.toLowerCase().replaceAll('_', ' ')}.`,
  },
])

export const renewals: Renewal[] = policies.map((policy, index) => {
  const customer = customers.find((item) => item.id === policy.customerId) ?? customers[0]
  return {
    id: `RN-${1048 + index}`,
    customerId: policy.customerId,
    policyId: policy.id,
    customer: customer.name,
    advisor: policy.advisor,
    stage: customer.stage,
    renewalDate: policy.renewalDate,
    daysToRenewal: policy.daysToRenewal,
    premium: policy.premium,
    insurer: policy.insurer,
    portabilityLocked: policy.portabilityLocked,
    isException: index === 3 || index === 11,
    exportOverride: policy.exportOverride,
  }
})

export const documents: Document[] = customers.flatMap((customer, index) => [
  {
    id: `DOC-${7001 + index}`,
    customerId: customer.id,
    policyId: customer.policyIds[0],
    name: 'Identity proof',
    type: 'KYC' as const,
    uploadedOn: '2026-08-12',
    verified: index % 4 !== 0,
  },
  {
    id: `DOC-${7101 + index}`,
    customerId: customer.id,
    policyId: customer.policyIds[0],
    name: 'Policy schedule',
    type: 'POLICY' as const,
    uploadedOn: '2026-08-14',
    verified: true,
  },
])

const templateCopy: Record<string, { name: string; subject: string; body: string }> = {
  REGISTERED: {
    name: 'Registered',
    subject: 'We received claim {{claimNo}}',
    body: 'Hi {{customerName}},\n\nWe have received your claim {{claimNo}} and will keep you updated as it moves through the process.\n\nRegards,\nHarborline Claims',
  },
  DOCUMENTS_PENDING: {
    name: 'Documents pending',
    subject: 'Documents needed for claim {{claimNo}}',
    body: 'Hi {{customerName}},\n\nWe need a few more documents to continue reviewing claim {{claimNo}}. Please upload them when convenient.\n\nRegards,\nHarborline Claims',
  },
  UNDER_REVIEW: {
    name: 'Under review',
    subject: 'Claim {{claimNo}} is under review',
    body: 'Hi {{customerName}},\n\nYour claim {{claimNo}} is currently under review. We will share the next update soon.\n\nRegards,\nHarborline Claims',
  },
  APPROVED: {
    name: 'Approved',
    subject: 'Claim {{claimNo}} has been approved',
    body: 'Hi {{customerName}},\n\nGood news: claim {{claimNo}} has been approved.\n\nRegards,\nHarborline Claims',
  },
  SETTLED: {
    name: 'Settled',
    subject: 'Claim {{claimNo}} has been settled',
    body: 'Hi {{customerName}},\n\nClaim {{claimNo}} has been settled successfully.\n\nRegards,\nHarborline Claims',
  },
  REJECTED: {
    name: 'Rejected',
    subject: 'An update about claim {{claimNo}}',
    body: 'Hi {{customerName}},\n\nWe have an important update about claim {{claimNo}}. Please contact your advisor if you need help.\n\nRegards,\nHarborline Claims',
  },
}
export const claimTemplates: ClaimTemplate[] = Object.entries(templateCopy).map(
  ([stage, template], index) => ({
    id: `TPL-${String(index + 1).padStart(2, '0')}`,
    stage: stage as ClaimTemplate['stage'],
    name: template.name,
    subject: template.subject,
    body: template.body,
    defaultSubject: template.subject,
    defaultBody: template.body,
    customized: stage === 'UNDER_REVIEW',
    active: true,
  }),
)

export const contestSlabs: ContestSlab[] = [
  { id: 'SLAB-01', contestId: 'CT-01', name: 'Starter', target: 40, incentive: 5000 },
  { id: 'SLAB-02', contestId: 'CT-01', name: 'Momentum', target: 75, incentive: 12500 },
  { id: 'SLAB-03', contestId: 'CT-01', name: 'Champion', target: 100, incentive: 25000 },
  { id: 'SLAB-04', contestId: 'CT-02', name: 'Core', target: 50, incentive: 7500 },
  { id: 'SLAB-05', contestId: 'CT-02', name: 'Leader', target: 100, incentive: 18000 },
]
export const contests: Contest[] = [
  {
    id: 'CT-01',
    company: 'LIC',
    periodType: 'quarterly',
    name: 'Q4 retention sprint',
    period: 'Oct 1 - Dec 31, 2026',
    target: 100,
    loggedIn: 40,
    issued: 12,
    achievementPercent: 40,
    currentSlab: contestSlabs[0],
    expectedIncentive: 5000,
    nextSlabGap: 35,
    nextSlabIncentive: 12500,
    status: 'Open',
    slabIds: ['SLAB-01', 'SLAB-02', 'SLAB-03'],
  },
  {
    id: 'CT-02',
    company: 'HDFC Life',
    periodType: 'monthly',
    name: 'Advisor activation',
    period: 'Sep 1 - Sep 30, 2026',
    target: 100,
    loggedIn: 90,
    issued: 28,
    achievementPercent: 90,
    currentSlab: contestSlabs[4],
    expectedIncentive: 18000,
    nextSlabGap: 10,
    nextSlabIncentive: 18000,
    status: 'Open',
    slabIds: ['SLAB-04', 'SLAB-05'],
  },
  {
    id: 'CT-03',
    company: 'ICICI Prudential',
    periodType: 'yearly',
    name: 'Summer service score',
    period: 'Jan 1 - Dec 31, 2026',
    target: 100,
    loggedIn: 100,
    issued: 42,
    achievementPercent: 100,
    currentSlab: contestSlabs[4],
    expectedIncentive: 18000,
    nextSlabGap: 0,
    nextSlabIncentive: 0,
    status: 'Complete',
    slabIds: ['SLAB-04', 'SLAB-05'],
  },
]
export const rewards: Reward[] = [
  {
    id: 'RW-01',
    contestId: 'CT-01',
    advisor: 'Jordan Lee',
    amount: 5000,
    status: 'PENDING',
    issuedOn: '2026-10-01',
  },
  {
    id: 'RW-02',
    contestId: 'CT-02',
    advisor: 'Sam Rivera',
    amount: 12500,
    status: 'PAID',
    issuedOn: '2026-09-30',
  },
  {
    id: 'RW-03',
    contestId: 'CT-03',
    advisor: 'Aarav Menon',
    amount: 18000,
    status: 'PAID',
    issuedOn: '2026-09-01',
  },
  {
    id: 'RW-04',
    contestId: 'CT-01',
    advisor: 'Ritika Shah',
    amount: 5000,
    status: 'PENDING',
    issuedOn: '2026-10-01',
  },
]

export const mockStore = {
  customers,
  policies,
  claims,
  claimStatusHistory,
  renewals,
  documents,
  claimTemplates,
  contestSlabs,
  contests,
  rewards,
  claimUpdatesEnabled: true,
}
