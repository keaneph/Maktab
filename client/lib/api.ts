import { createClient } from "./client"

/**
 * Cached Supabase access token with timestamp
 */
let cachedToken: string | null = null
let tokenTimestamp: number = 0
const TOKEN_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Authenticated fetch wrapper that automatically includes Supabase session token.
 * Caches the token for a short period to avoid excessive session checks.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Refresh token if not cached or cache expired
  const now = Date.now()
  if (!cachedToken || now - tokenTimestamp > TOKEN_CACHE_TTL) {
    try {
      const supabase = createClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.warn("Session error:", sessionError)
        cachedToken = null
      } else {
        cachedToken = session?.access_token ?? null
        tokenTimestamp = now
      }
    } catch (error) {
      // If session fetch fails, clear cache and continue without token
      console.warn("Failed to get session:", error)
      cachedToken = null
      tokenTimestamp = 0
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

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

  // Add Authorization header if cached token exists
  if (cachedToken) {
    headers["Authorization"] = `Bearer ${cachedToken}`
  }

  try {
    const res = await fetch(input, {
      ...init,
      headers,
    })

    // If we get a 401, the token is likely invalid - clear cache
    if (res.status === 401) {
      cachedToken = null
      tokenTimestamp = 0
    }

    return res
  } catch (error) {
    // If fetch fails with network error, provide better error message
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: Failed to connect to ${input}`)
    }
    throw error
  }
}

/**
 * Clear the cached token (useful after logout or token refresh)
 */
export function clearTokenCache() {
  cachedToken = null
  tokenTimestamp = 0
}

/**
 * Fetcher function for making authenticated API requests.
 * Automatically includes Supabase session token in headers.
 */
export async function fetcher<T = any>(
  input: string,
  init?: RequestInit
): Promise<T> {
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
      signal: init?.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      const errorMessage = text || `Request failed with status ${res.status}`
      const error = new Error(errorMessage)
      // Add status code to error for better error handling
      ;(error as any).status = res.status
      throw error
    }
    return res.json()
  } catch (error) {
    // Don't throw error if request was aborted
    if (error instanceof Error && error.name === "AbortError") {
      throw error
    }
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: Failed to connect to ${input}`)
    }
    throw error
  }
}
