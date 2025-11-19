"use client"

import * as React from "react"
import { fetcher } from "@/lib/api"

interface Counts {
  colleges: number
  programs: number
  students: number
  users: number
}

interface CountsContextType {
  counts: Counts
  refreshCounts: () => Promise<void>
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

  const refreshCounts = React.useCallback(async () => {
    try {
      const data = await fetcher<Counts>("http://localhost:8080/api/metrics/counts")
      setCounts(data)
    } catch (error) {
      console.warn("Failed to fetch counts:", error)
      // Keep existing counts on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch counts on mount
  React.useEffect(() => {
    const abortController = new AbortController()
    
    async function fetchCounts() {
      try {
        const data = await fetcher<Counts>("http://localhost:8080/api/metrics/counts", { signal: abortController.signal })
        if (!abortController.signal.aborted) {
          setCounts(data)
        }
      } catch (error) {
        if (abortController.signal.aborted) return
        console.warn("Failed to fetch counts:", error)
        // Keep existing counts on error
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    fetchCounts()
    
    return () => {
      abortController.abort()
    }
  }, [])

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

