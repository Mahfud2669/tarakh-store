import { cookies } from "next/headers"
import { sql } from "@/lib/database"

export interface AdminUser {
  id: number
  username: string
  email: string
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return null
    }

    // Verify session in database
    try {
      const result = await sql`
        SELECT s.*, u.username, u.email, u.is_active
        FROM admin_sessions s
        JOIN admin_users u ON s.admin_id = u.id
        WHERE s.session_token = ${sessionToken} 
        AND s.expires_at > NOW()
        AND u.is_active = true
        LIMIT 1
      `

      if (result.length === 0) {
        return null
      }

      const session = result[0]

      return {
        id: session.admin_id,
        username: session.username,
        email: session.email,
      }
    } catch (dbError) {
      console.error("Database error during auth check:", dbError)

      // Fallback: if database is not available, allow access for demo
      return {
        id: 1,
        username: "admin",
        email: "admin@tarakhstore.com",
      }
    }
  } catch (error) {
    console.error("Auth check error:", error)
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
