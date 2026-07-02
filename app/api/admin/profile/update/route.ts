import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/auth"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { username, name, email } = await request.json()

    // Validate required fields
    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    }

    // Check if username already exists (excluding current user)
    const existingUser = await query("SELECT id FROM admin_users WHERE username = $1 AND id != $2", [
      username,
      authResult.user.id,
    ])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 })
    }

    // Update user profile
    const updateQuery = `
      UPDATE admin_users 
      SET username = $1, name = $2, email = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, username, name, email, created_at, role
    `

    const result = await query(updateQuery, [username, name || null, email || null, authResult.user.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
