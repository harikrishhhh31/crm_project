import { z } from 'zod'

export type Role = 'admin' | 'manager' | 'advisor'
export const roleSchema = z.enum(['admin', 'manager', 'advisor'])

export type ClaimStage =
  'REGISTERED' | 'DOCUMENTS_PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'SETTLED' | 'REJECTED'
export const claimStageSchema = z.enum([
  'REGISTERED',
  'DOCUMENTS_PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'SETTLED',
  'REJECTED',
])

export type DocumentType = 'KYC' | 'POLICY' | 'CLAIM'
export const documentTypeSchema = z.enum(['KYC', 'POLICY', 'CLAIM'])

export type RewardStatus = 'PAID' | 'PENDING'
export const rewardStatusSchema = z.enum(['PAID', 'PENDING'])

export const stageSchema = z.enum(['Renewal review', 'Client outreach', 'In progress', 'Complete'])
export type Stage = z.infer<typeof stageSchema>

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  city: string
  customerSince: string
  advisor: string
  policyIds: string[]
  claimIds: string[]
  activePolicies: number
  nextRenewalDate: string
  openClaims: number
  stage: Stage
  lastContact: string
  claimUpdatesEnabled: boolean
}
export const customerSchema: z.ZodType<Customer> = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  city: z.string(),
  customerSince: z.string(),
  advisor: z.string(),
  policyIds: z.array(z.string()),
  claimIds: z.array(z.string()),
  activePolicies: z.number(),
  nextRenewalDate: z.string(),
  openClaims: z.number(),
  stage: stageSchema,
  lastContact: z.string(),
  claimUpdatesEnabled: z.boolean(),
})

interface PolicyBase {
  id: string
  customerId: string
  policyNumber: string
  product: string
  premium: number
  renewalDate: string
  daysToRenewal: number
  advisor: string
  portabilityLocked: boolean
  exportOverride: boolean
}

export interface LockedPolicy extends PolicyBase {
  portabilityLocked: true
  exportOverride: false
  insurer: null
  coverage: null
  sumAssured: null
  startDate: null
  status: null
}

export interface AvailablePolicy extends PolicyBase {
  portabilityLocked: false | true
  exportOverride: boolean
  insurer: 'LIC' | 'HDFC Life' | 'ICICI Prudential' | 'Star Health'
  coverage: string
  sumAssured: number
  startDate: string
  status: 'ACTIVE' | 'LAPSED' | 'PENDING_RENEWAL'
}

export type Policy = LockedPolicy | AvailablePolicy

const policyBaseSchema = {
  id: z.string(),
  customerId: z.string(),
  policyNumber: z.string(),
  product: z.string(),
  premium: z.number(),
  renewalDate: z.string(),
  daysToRenewal: z.number(),
  advisor: z.string(),
  portabilityLocked: z.boolean(),
  exportOverride: z.boolean(),
}
const lockedPolicySchema = z.object({
  ...policyBaseSchema,
  portabilityLocked: z.literal(true),
  exportOverride: z.literal(false),
  insurer: z.null(),
  coverage: z.null(),
  sumAssured: z.null(),
  startDate: z.null(),
  status: z.null(),
})
const availablePolicySchema = z.object({
  ...policyBaseSchema,
  insurer: z.enum(['LIC', 'HDFC Life', 'ICICI Prudential', 'Star Health']),
  coverage: z.string(),
  sumAssured: z.number(),
  startDate: z.string(),
  status: z.enum(['ACTIVE', 'LAPSED', 'PENDING_RENEWAL']),
})
export const policySchema: z.ZodType<Policy> = z.union([lockedPolicySchema, availablePolicySchema])

export interface Claim {
  id: string
  customerId: string
  policyId: string
  claimNumber: string
  type: 'Hospitalization' | 'Accidental' | 'Critical illness' | 'Death benefit'
  amount: number
  filedOn: string
  stage: ClaimStage
  assignedTo: string
  description: string
  claimUpdatesEnabled: boolean
}
export const claimSchema: z.ZodType<Claim> = z.object({
  id: z.string(),
  customerId: z.string(),
  policyId: z.string(),
  claimNumber: z.string(),
  type: z.enum(['Hospitalization', 'Accidental', 'Critical illness', 'Death benefit']),
  amount: z.number(),
  filedOn: z.string(),
  stage: claimStageSchema,
  assignedTo: z.string(),
  description: z.string(),
  claimUpdatesEnabled: z.boolean(),
})

export interface ClaimStatusHistory {
  id: string
  claimId: string
  stage: ClaimStage
  changedAt: string
  changedBy: string
  note: string
}
export const claimStatusHistorySchema: z.ZodType<ClaimStatusHistory> = z.object({
  id: z.string(),
  claimId: z.string(),
  stage: claimStageSchema,
  changedAt: z.string(),
  changedBy: z.string(),
  note: z.string(),
})

export interface Renewal {
  id: string
  customerId: string
  policyId: string
  customer: string
  advisor: string
  stage: Stage
  renewalDate: string
  daysToRenewal: number
  premium: number
  insurer: 'LIC' | 'HDFC Life' | 'ICICI Prudential' | 'Star Health' | null
  portabilityLocked: boolean
  isException: boolean
  exportOverride: boolean
}
export const renewalSchema: z.ZodType<Renewal> = z.object({
  id: z.string(),
  customerId: z.string(),
  policyId: z.string(),
  customer: z.string(),
  advisor: z.string(),
  stage: stageSchema,
  renewalDate: z.string(),
  daysToRenewal: z.number(),
  premium: z.number(),
  insurer: z.enum(['LIC', 'HDFC Life', 'ICICI Prudential', 'Star Health']).nullable(),
  portabilityLocked: z.boolean(),
  isException: z.boolean(),
  exportOverride: z.boolean(),
})

export interface Document {
  id: string
  customerId: string
  policyId?: string
  claimId?: string
  name: string
  type: DocumentType
  uploadedOn: string
  verified: boolean
}
export const documentSchema: z.ZodType<Document> = z.object({
  id: z.string(),
  customerId: z.string(),
  policyId: z.string().optional(),
  claimId: z.string().optional(),
  name: z.string(),
  type: documentTypeSchema,
  uploadedOn: z.string(),
  verified: z.boolean(),
})

export interface ClaimTemplate {
  id: string
  stage: ClaimStage
  name: string
  subject: string
  body: string
  defaultSubject: string
  defaultBody: string
  customized: boolean
  active: boolean
}
export const claimTemplateSchema: z.ZodType<ClaimTemplate> = z.object({
  id: z.string(),
  stage: claimStageSchema,
  name: z.string(),
  subject: z.string(),
  body: z.string(),
  defaultSubject: z.string(),
  defaultBody: z.string(),
  customized: z.boolean(),
  active: z.boolean(),
})

export interface ContestSlab {
  id: string
  contestId: string
  name: string
  target: number
  incentive: number
}
export const contestSlabSchema: z.ZodType<ContestSlab> = z.object({
  id: z.string(),
  contestId: z.string(),
  name: z.string(),
  target: z.number(),
  incentive: z.number(),
})

export interface Contest {
  id: string
  company: 'LIC' | 'HDFC Life' | 'ICICI Prudential' | 'Star Health'
  periodType: 'monthly' | 'quarterly' | 'yearly'
  name: string
  period: string
  target: number
  loggedIn: number
  issued: number
  achievementPercent: number
  currentSlab: ContestSlab | null
  expectedIncentive: number
  nextSlabGap: number
  nextSlabIncentive: number
  status: 'Open' | 'Complete'
  slabIds: string[]
}
export const contestSchema: z.ZodType<Contest> = z.object({
  id: z.string(),
  company: z.enum(['LIC', 'HDFC Life', 'ICICI Prudential', 'Star Health']),
  periodType: z.enum(['monthly', 'quarterly', 'yearly']),
  name: z.string(),
  period: z.string(),
  target: z.number(),
  loggedIn: z.number(),
  issued: z.number(),
  achievementPercent: z.number(),
  currentSlab: contestSlabSchema.nullable(),
  expectedIncentive: z.number(),
  nextSlabGap: z.number(),
  nextSlabIncentive: z.number(),
  status: z.enum(['Open', 'Complete']),
  slabIds: z.array(z.string()),
})

export interface Reward {
  id: string
  contestId: string
  advisor: string
  amount: number
  status: RewardStatus
  issuedOn: string
}
export const rewardSchema: z.ZodType<Reward> = z.object({
  id: z.string(),
  contestId: z.string(),
  advisor: z.string(),
  amount: z.number(),
  status: rewardStatusSchema,
  issuedOn: z.string(),
})

export interface ContestProgress {
  target: number
  loggedIn: number
  issued: number
  achievementPercent: number
  currentSlab: ContestSlab | null
  expectedIncentive: number
  nextSlabGap: number
}
export const contestProgressSchema: z.ZodType<ContestProgress> = z.object({
  target: z.number(),
  loggedIn: z.number(),
  issued: z.number(),
  achievementPercent: z.number(),
  currentSlab: contestSlabSchema.nullable(),
  expectedIncentive: z.number(),
  nextSlabGap: z.number(),
})

export interface CustomerSummary {
  customer: Customer
  policies: Policy[]
  claims: Claim[]
  renewals: Renewal[]
  documents: Document[]
  claimStatusHistory: ClaimStatusHistory[]
  totalPremium: number
  openClaims: number
}
export const customerSummarySchema: z.ZodType<CustomerSummary> = z.object({
  customer: customerSchema,
  policies: z.array(policySchema),
  claims: z.array(claimSchema),
  renewals: z.array(renewalSchema),
  documents: z.array(documentSchema),
  claimStatusHistory: z.array(claimStatusHistorySchema),
  totalPremium: z.number(),
  openClaims: z.number(),
})
