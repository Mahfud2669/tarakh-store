import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/database"

export async function POST() {
  try {
    console.log("=== ADMIN LOGOUT ===")

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    console.log("🍪 Session token:", sessionToken ? "Found" : "Not found")

    if (sessionToken) {
      // Remove session from database
      try {
        console.log("🗑️ Removing session from database...")
        const result = await sql`DELETE FROM admin_sessions WHERE session_token = ${sessionToken}`
        console.log("✅ Session removed from database:", result.length)
      } catch (error) {
        console.error("❌ Error removing session from database:", error)
        // Continue with logout even if database fails
      }
    }

    // Clear the cookie with proper settings
    console.log("🍪 Clearing session cookie...")
    cookieStore.set("admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // Expire immediately
      path: "/",
      maxAge: 0,
    })

    console.log("✅ Logout successful")

    return NextResponse.json({
      success: true,
      message: "Logout berhasil",
    })
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat logout",
      },
      { status: 500 },
    )
  }
}
