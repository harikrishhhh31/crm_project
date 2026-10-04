import { createContext } from 'react'
import type { Role } from '@/types/crm'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
}

export interface AuthContextValue {
  user: AuthUser | null
  users: AuthUser[]
  isAuthenticated: boolean
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<{ ok: boolean; message?: string }>
  logout: () => void
  addUser: (user: Omit<AuthUser, 'id' | 'active'>) => void
  deactivateUser: (userId: string) => void
  resetUserPassword: (userId: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
