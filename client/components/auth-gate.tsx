"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth"
import { usePathname, useRouter } from "next/navigation"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, authenticated, authenticating } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!loading && !authenticating && !authenticated) {
      router.replace("/login?next=" + encodeURIComponent(pathname || "/"))
    }
  }, [loading, authenticating, authenticated, pathname, router])

  if (loading) return null
  if (!authenticated) return null
  return <>{children}</>
}


