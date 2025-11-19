"use client"

import * as React from "react"
import { SWRConfig } from "swr"
import { createClient } from "@/lib/client"

async function defaultFetcher(input: string, init?: RequestInit) {
  const headers: Record<string, string> = {}

  // Copy existing headers
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      Object.assign(headers, init.headers)
    }
  }

  // Try to get session token, but don't fail if it's not available
  try {
    const supabase = createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Add Authorization header if user is authenticated
    if (session?.access_token && !sessionError) {
      headers["Authorization"] = `Bearer ${session.access_token}`
    }
  } catch (error) {
    // If session fetch fails, continue without auth token
    // This allows public endpoints to still work
    console.warn("Failed to get session for fetch:", error)
  }

  try {
    const res = await fetch(input, {
      ...init,
      headers,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      const errorMessage = text || `Request failed with status ${res.status}`
      const error = new Error(errorMessage)
      // Add status code to error for retry logic
      ;(error as any).status = res.status
      throw error
    }
    return res.json()
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: Failed to connect to ${input}`)
    }
    throw error
  }
}

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: defaultFetcher,
        revalidateOnFocus: true,
        dedupingInterval: 5000,
        refreshInterval: 30000,
        shouldRetryOnError: (error) => {
          // Retry on network errors, but not on auth errors (401, 403)
          if (error instanceof Error) {
            // Check status code if available
            const status = (error as any).status
            if (status === 401 || status === 403) {
              return false
            }
            if (error.message.includes("Network error")) {
              return true
            }
            if (error.message.includes("401") || error.message.includes("403")) {
              return false
            }
          }
          // Default: retry on other errors (5xx, network issues, etc.)
          return true
        },
        errorRetryCount: 3,
        errorRetryInterval: 2000,
        focusThrottleInterval: 10000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
