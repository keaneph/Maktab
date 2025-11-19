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
