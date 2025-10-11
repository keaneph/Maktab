"use client"

import * as React from "react"
import { SWRConfig } from "swr"

async function defaultFetcher(input: string, init?: RequestInit) {
  const res = await fetch(input, init)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      fetcher: defaultFetcher,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      shouldRetryOnError: false,
    }}>
      {children}
    </SWRConfig>
  )
}


