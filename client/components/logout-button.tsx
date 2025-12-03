"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { clearTokenCache } from "@/lib/api"

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async () => {
    if (isLoggingOut) return // Prevent double-clicks

    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      clearTokenCache()
      await supabase.auth.signOut()
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
