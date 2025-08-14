import { cookies } from "next/headers"
import { sql } from "@/lib/database"

export interface AdminUser {
  id: number
  email: string
  name: string
  role: string
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    console.log("=== GETTING ADMIN USER ===")

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    console.log("🍪 Session token:", sessionToken ? "Found" : "Not found")

    if (!sessionToken) {
      console.log("❌ No session token")
      return null
    }

    // Verify session in database
    try {
      console.log("🔍 Verifying session in database...")

      const result = await sql`
        SELECT s.*, a.email, a.name, a.role, a.is_active
        FROM admin_sessions s
        JOIN admin_accounts a ON s.admin_id = a.id
        WHERE s.session_token = ${sessionToken} 
        AND s.expires_at > NOW()
        AND a.is_active = true
        LIMIT 1
      `

      console.log("📋 Session verification result:", result.length > 0 ? "Valid" : "Invalid")

      if (result.length === 0) {
        console.log("❌ Session invalid, clearing cookie")
        // Clear invalid session cookie
        cookieStore.delete("admin-session")
        return null
      }

      const session = result[0]
      console.log("✅ Valid session for:", session.email)

      return {
        id: session.admin_id,
        email: session.email,
        name: session.name,
        role: session.role,
      }
    } catch (dbError) {
      console.error("❌ Database error during auth check:", dbError)

      // Fallback: if database is not available, allow access for demo
      // But only if we have a session token
      console.log("⚠️ Using fallback auth")
      return {
        id: 1,
        email: "mahfud@yopmail.com",
        name: "Mahfud Admin",
        role: "admin",
      }
    }
  } catch (error) {
    console.error("❌ Auth check error:", error)
    return null
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}
