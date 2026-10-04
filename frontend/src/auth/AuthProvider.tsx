import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext, type AuthUser } from '@/auth/authContext'
import { useRole } from '@/layout/useRole'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const demoAccounts: AuthUser[] = [
  { id: 'USR-01', name: 'Aarav Admin', email: 'admin@demo.com', role: 'admin', active: true },
  { id: 'USR-02', name: 'Maya Manager', email: 'manager@demo.com', role: 'manager', active: true },
  {
    id: 'USR-03',
    name: 'Jordan Advisor',
    email: 'advisor@demo.com',
    role: 'advisor',
    active: true,
  },
]
const sessionKey = 'harborline-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { role, setRole } = useRole()
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem(sessionKey)
    return saved ? (JSON.parse(saved) as AuthUser) : null
  })
  const [users, setUsers] = useState<AuthUser[]>(demoAccounts)
  const [expired, setExpired] = useState(false)

  // Synchronize effective user with role switcher
  const activeUser = useMemo(() => {
    if (!user) return null
    if (user.role !== role) {
      const match = users.find((u) => u.role === role)
      if (match) return match
      return { ...user, role }
    }
    return user
  }, [user, role, users])

  // Sync sessionStorage whenever active user changes
  useEffect(() => {
    if (activeUser) {
      sessionStorage.setItem(sessionKey, JSON.stringify(activeUser))
    } else {
      sessionStorage.removeItem(sessionKey)
    }
  }, [activeUser])

  const logout = useCallback(() => {
    setExpired(false)
    setUser(null)
    sessionStorage.removeItem(sessionKey)
    navigate('/login', { replace: true })
  }, [navigate])

  // Inactive for 30 minutes session expiry
  useEffect(() => {
    if (!activeUser) return undefined
    let timeout = window.setTimeout(() => setExpired(true), 30 * 60 * 1000)
    const reset = () => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => setExpired(true), 30 * 60 * 1000)
    }

    window.addEventListener('click', reset)
    window.addEventListener('keydown', reset)
    window.addEventListener('mousemove', reset)
    window.addEventListener('scroll', reset)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('click', reset)
      window.removeEventListener('keydown', reset)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('scroll', reset)
    }
  }, [activeUser])

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      await new Promise((resolve) => window.setTimeout(resolve, 400))
      const account = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
      if (!account || !account.active || password.length < 8) {
        return {
          ok: false,
          message: 'Invalid email or password. Password must be at least 8 characters.',
        }
      }
      setUser(account)
      setRole(account.role)
      sessionStorage.setItem(sessionKey, JSON.stringify(account))
      if (remember) {
        localStorage.setItem('harborline-remember', account.email)
      } else {
        localStorage.removeItem('harborline-remember')
      }
      return { ok: true }
    },
    [users, setRole],
  )

  const addUser = useCallback((newUser: Omit<AuthUser, 'id' | 'active'>) => {
    setUsers((current) => [
      ...current,
      {
        ...newUser,
        id: `USR-${String(current.length + 1).padStart(2, '0')}`,
        active: true,
      },
    ])
  }, [])

  const deactivateUser = useCallback((userId: string) => {
    setUsers((current) =>
      current.map((item) => (item.id === userId ? { ...item, active: false } : item)),
    )
  }, [])

  const resetUserPassword = useCallback((userId: string) => {
    setUsers((current) => current.map((item) => (item.id === userId ? { ...item } : item)))
  }, [])

  const value = useMemo(
    () => ({
      user: activeUser,
      users,
      isAuthenticated: Boolean(activeUser?.active),
      login,
      logout,
      addUser,
      deactivateUser,
      resetUserPassword,
    }),
    [activeUser, users, login, logout, addUser, deactivateUser, resetUserPassword],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={expired}
        title="Session expired"
        description="You have been inactive for 30 minutes. Please sign in again to continue."
        confirmLabel="Return to sign in"
        cancelLabel="Dismiss"
        onClose={() => logout()}
        onConfirm={() => logout()}
      />
    </AuthContext.Provider>
  )
}
