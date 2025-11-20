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

async function fetchDailyMetrics(): Promise<DailyMetric[]> {
  const res = await fetch(apiUrl("/api/metrics/daily"))
  if (!res.ok) {
    const message = await res.text().catch(() => "")
    throw new Error(message || "Failed to fetch metrics")
  }
  return res.json()
}

export function useDailyMetrics() {
  const [data, setData] = React.useState<DailyMetric[] | null>(cachedMetrics)
  const [error, setError] = React.useState<Error | null>(null)
  const [isLoading, setIsLoading] = React.useState(!cachedMetrics)

  React.useEffect(() => {
    let isMounted = true

    if (cachedMetrics) {
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
  }, [])

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const metrics = await fetchDailyMetrics()
      cachedMetrics = metrics
      setData(metrics)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
      inflightPromise = null
    }
  }, [])

  return { data, error, isLoading, refresh }
}

