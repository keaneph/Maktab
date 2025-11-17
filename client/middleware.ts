import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_FREE = new Set(["/login", "/signup"])

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get("access_token")?.value

  // skip Next internals and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  const isAuthFree = AUTH_FREE.has(pathname)

  if (!accessToken && !isAuthFree) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname || "/")
    return NextResponse.redirect(url)
  }

  if (accessToken && isAuthFree) {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/:path*"],
}


