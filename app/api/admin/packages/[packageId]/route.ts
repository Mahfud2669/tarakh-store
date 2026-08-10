import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: Promise<{ packageId: string }> }) {
  try {
    const { game_id, diamonds, price, bonus, is_active } = await request.json()
    const packageId = Number.parseInt((await params).packageId)

    const result = await sql`
      UPDATE game_packages 
      SET game_id = ${game_id}, diamonds = ${diamonds}, price = ${price}, 
          bonus = ${bonus}, is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${packageId}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      package: result[0],
    })
  } catch (error) {
    console.error("Error updating package:", error)
    return NextResponse.json({ success: false, error: "Failed to update package" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ packageId: string }> }) {
  try {
    const packageId = Number.parseInt((await params).packageId)

    await sql`DELETE FROM game_packages WHERE id = ${packageId}`

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting package:", error)
    return NextResponse.json({ success: false, error: "Failed to delete package" }, { status: 500 })
  }
}
