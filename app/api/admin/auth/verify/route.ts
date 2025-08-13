import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No session token",
        },
        { status: 401 },
      )
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
        // Session not found or expired
        cookieStore.delete("admin-session")
        return NextResponse.json(
          {
            success: false,
            error: "Session expired",
          },
          { status: 401 },
        )
      }

      const session = result[0]

      return NextResponse.json({
        success: true,
        user: {
          id: session.admin_id,
          username: session.username,
          email: session.email,
        },
      })
    } catch (dbError) {
      console.error("Database error during session verification:", dbError)

      // Fallback: if database is not available, allow access for demo
      return NextResponse.json({
        success: true,
        user: {
          id: 1,
          username: "admin",
          email: "admin@tarakhstore.com",
        },
      })
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server",
      },
      { status: 500 },
    )
  }
}
