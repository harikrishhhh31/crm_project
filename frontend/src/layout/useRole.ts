import { useContext } from 'react'
import { RoleContext } from '@/layout/RoleContext'

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error('useRole must be used inside RoleProvider')
  return context
}
