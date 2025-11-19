"use client"

import * as React from "react"

interface Counts {
  colleges: number
  programs: number
  students: number
  users: number
}

interface CountsContextType {
  counts: Counts
  refreshCounts: (signal?: AbortSignal) => Promise<void>
  isLoading: boolean
}

const CountsContext = React.createContext<CountsContextType | undefined>(undefined)

export function CountsProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = React.useState<Counts>({
    colleges: 0,
    programs: 0,
    students: 0,
    users: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  const refreshCounts = React.useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("http://localhost:8080/api/metrics/counts", {
        signal,
      })
      if (!res.ok) {
        const message = await res.text().catch(() => "")
        throw new Error(message || "Failed to fetch counts")
      }
      const data = (await res.json()) as Counts
      if (signal?.aborted) return
      setCounts(data)
    } catch (error) {
      if (signal?.aborted) return
      console.warn("Failed to fetch counts:", error)
      // Keep existing counts on error
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  // Fetch counts on mount
  React.useEffect(() => {
    const abortController = new AbortController()
    refreshCounts(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [refreshCounts])

  return (
    <CountsContext.Provider value={{ counts, refreshCounts, isLoading }}>
      {children}
    </CountsContext.Provider>
  )
}

export function useCounts() {
  const context = React.useContext(CountsContext)
  if (!context) {
    throw new Error("useCounts must be used within CountsProvider")
  }
  return context
}

