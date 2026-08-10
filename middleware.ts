import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("🛡️ Middleware checking:", pathname)

  // Skip middleware for these paths
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") || // Skip all files with extensions
    pathname === "/" ||
    pathname === "/admin/login" ||
    pathname === "/admin/test-auth" // Allow test page
  ) {
    console.log("⏭️ Skipping middleware for:", pathname)
    return NextResponse.next()
  }

  // Only handle admin routes (except login)
  if (pathname.startsWith("/admin")) {
    // Allow login and test pages
    if (pathname === "/admin/login" || pathname === "/admin/test-auth") {
      console.log("⏭️ Skipping auth check for:", pathname)
      return NextResponse.next()
    }

    console.log("🔍 Checking admin route:", pathname)

    const sessionToken = request.cookies.get("admin-session")?.value
    
    console.log("🍪 Session token:", sessionToken ? `Found (${sessionToken.substring(0, 16)}...)` : "Not found")

    if (!sessionToken) {
      console.log("❌ No session token, redirecting to login")
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    console.log("✅ Session token found, allowing access")
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except login and API routes
     */
    "/admin/:path*",
  ],
}
