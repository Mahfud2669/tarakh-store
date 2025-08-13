import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/database"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (sessionToken) {
      // Remove session from database
      try {
        await sql`DELETE FROM admin_sessions WHERE session_token = ${sessionToken}`
      } catch (error) {
        console.error("Error removing session from database:", error)
      }
    }

    // Clear the cookie
    cookieStore.delete("admin-session")

    return NextResponse.json({
      success: true,
      message: "Logout berhasil",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat logout",
      },
      { status: 500 },
    )
  }
}
