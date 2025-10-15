"use client"

import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/lib/auth"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function Page() {
  const { authenticated, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && authenticated) {
      const next = searchParams.get("next") || "/dashboard"
      router.replace(next)
    }
  }, [authenticated, loading, router, searchParams])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
