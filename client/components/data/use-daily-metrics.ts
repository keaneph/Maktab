"use client"

import * as React from "react"
import { apiUrl } from "@/lib/config"

export interface DailyMetric {
  date: string
  college: number
  program: number
  students: number
  users: number
}

let cachedMetrics: DailyMetric[] | null = null
let inflightPromise: Promise<DailyMetric[]> | null = null
let cacheVersion = 0 // Track cache updates
const listeners = new Set<() => void>() // Subscribers to cache changes

async function fetchDailyMetrics(): Promise<DailyMetric[]> {
  const res = await fetch(apiUrl("/api/metrics/daily"))
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to fetch metrics")
  }
  return res.json()
}

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useDailyMetrics() {
  const [data, setData] = React.useState<DailyMetric[] | null>(cachedMetrics)
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(!cachedMetrics)
  const [version, setVersion] = React.useState(cacheVersion)

  // Subscribe to cache updates
  React.useEffect(() => {
    const listener = () => {
      setVersion(cacheVersion)
      setData(cachedMetrics)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    if (cachedMetrics && version === cacheVersion) {
      setData(cachedMetrics)
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    if (!inflightPromise) {
      inflightPromise = fetchDailyMetrics()
    }

    inflightPromise
      .then((metrics) => {
        cachedMetrics = metrics
        if (isMounted) {
          setData(metrics)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err as Error)
          setIsLoading(false)
        }
        inflightPromise = null
      })

    return () => {
      isMounted = false
    }
  }, [version])

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    inflightPromise = null // Clear inflight promise to force fresh fetch
    try {
      const metrics = await fetchDailyMetrics()
      cachedMetrics = metrics
      cacheVersion++ // Increment version to notify all subscribers
      setData(metrics)
      setError(null)
      notifyListeners() // Notify all other components using this hook
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { data, error, isLoading, refresh }
}
