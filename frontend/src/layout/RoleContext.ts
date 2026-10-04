import { createContext } from 'react'
import type { Role } from '@/types/crm'

export interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
  isAdmin: boolean
  isManager: boolean
  isAdvisor: boolean
}

export const RoleContext = createContext<RoleContextValue | null>(null)
