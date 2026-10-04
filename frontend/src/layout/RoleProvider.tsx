import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Role } from '@/types/crm'
import { RoleContext } from '@/layout/RoleContext'

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('manager')
  const value = useMemo(
    () => ({
      role,
      setRole,
      isAdmin: role === 'admin',
      isManager: role === 'manager',
      isAdvisor: role === 'advisor',
    }),
    [role],
  )
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
