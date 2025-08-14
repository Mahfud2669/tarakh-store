import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    console.log("=== DEBUG SESSION ===")

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    const debug = {
      has_session_cookie: !!sessionToken,
      session_token_preview: sessionToken ? sessionToken.substring(0, 16) + "..." : null,
      session_token_length: sessionToken?.length || 0,
    }

    if (sessionToken) {
      try {
        // Check session in database
        const sessionResult = await sql`
          SELECT s.*, a.email, a.name, a.role
          FROM admin_sessions s
          JOIN admin_accounts a ON s.admin_id = a.id
          WHERE s.session_token = ${sessionToken}
          LIMIT 1
        `

        debug.session_in_database = sessionResult.length > 0
        debug.session_expired = false

        if (sessionResult.length > 0) {
          const session = sessionResult[0]
          debug.session_expires_at = session.expires_at
          debug.session_expired = new Date(session.expires_at) < new Date()
          debug.user_email = session.email
          debug.user_active = session.is_active
        }
      } catch (dbError) {
        debug.database_error = dbError.message
      }
    }

    return NextResponse.json({
      success: true,
      debug,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
