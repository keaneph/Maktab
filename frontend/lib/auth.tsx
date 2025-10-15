"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

type User = {
  username: string
  email: string
  dateLogged: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  authenticated: boolean
  authenticating: boolean
  login: (values: { usernameOrEmail: string; password: string }, next?: string) => Promise<void>
  signup: (values: { username: string; email: string; password: string }, next?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [authenticated, setAuthenticated] = React.useState(false)
  const [authenticating, setAuthenticating] = React.useState(false)

  const refreshMe = React.useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/me", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setAuthenticated(true)
        return true
      } else {
        setUser(null)
        setAuthenticated(false)
        return false
      }
    } catch {
      setUser(null)
      setAuthenticated(false)
      return false
    }
  }, [])

  React.useEffect(() => {
    async function loadMe() {
      try {
        await refreshMe()
      } finally {
        setLoading(false)
      }
    }
    loadMe()
  }, [refreshMe])

  async function login(values: { usernameOrEmail: string; password: string }, next?: string) {
    setAuthenticating(true)
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(values),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    setUser(data)
    setAuthenticated(true)
    // ensure cookie is usable before navigation
    await refreshMe()
    router.replace(next || "/dashboard")
    setAuthenticating(false)
  }

  async function signup(values: { username: string; email: string; password: string }, next?: string) {
    setAuthenticating(true)
    const res = await fetch("http://localhost:8080/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(values),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    setUser(data)
    setAuthenticated(true)
    await refreshMe()
    router.replace(next || "/dashboard")
    setAuthenticating(false)
  }

  async function logout() {
    await fetch("http://localhost:8080/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
    setAuthenticated(false)
    setAuthenticating(false)
    router.push("/login")
  }

  const value = React.useMemo<AuthContextType>(
    () => ({ user, loading, authenticated, authenticating, login, signup, logout }),
    [user, loading, authenticated, authenticating]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}


