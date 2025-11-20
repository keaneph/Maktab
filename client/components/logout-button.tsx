"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { clearTokenCache } from "@/lib/api"

export function LogoutButton() {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async () => {
    if (isLoggingOut) return // Prevent double-clicks

    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      clearTokenCache()
      startTransition(() => {
        router.push("/auth/login")
        router.refresh()
      })
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Button onClick={logout} disabled={isLoggingOut}>
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  )
}
