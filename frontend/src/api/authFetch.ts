const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TOKEN_KEY = 'harborline-access-token'
const REFRESH_KEY = 'harborline-refresh-token'
const SESSION_KEY = 'harborline-session'

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY)
}

function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!res.ok) return null
  const data = await res.json()
  sessionStorage.setItem(TOKEN_KEY, data.accessToken)
  sessionStorage.setItem(REFRESH_KEY, data.refreshToken)
  return data.accessToken as string
}

export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`
  const token = getAccessToken()
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res = await fetch(url, { ...options, headers })
  if (res.status !== 401) return res

  const newToken = await refreshAccessToken()
  if (!newToken) {
    clearSession()
    window.location.assign('/login')
    return res
  }
  headers.set('Authorization', `Bearer ${newToken}`)
  res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    clearSession()
    window.location.assign('/login')
  }
  return res
}
