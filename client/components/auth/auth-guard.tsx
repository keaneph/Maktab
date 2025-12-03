"use client"

import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const handleUnauthenticated = useCallback(() => {
    setIsAuthenticated(false)
    setIsLoading(false)
    router.replace("/auth/login/")
  }, [router])

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        handleUnauthenticated()
        return
      }

      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth state changes (including logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        handleUnauthenticated()
      } else if (event === "SIGNED_IN" && session) {
        setIsAuthenticated(true)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [handleUnauthenticated])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
