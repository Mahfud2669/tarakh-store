import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { gameId: string } }) {
  try {
    const { name, image_url, color, is_active } = await request.json()
    const { gameId } = params

    const result = await sql`
      UPDATE games 
      SET name = ${name}, image_url = ${image_url}, color = ${color}, 
          is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
      WHERE game_id = ${gameId}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      game: result[0],
    })
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json({ success: false, error: "Failed to update game" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { gameId: string } }) {
  try {
    const { gameId } = params

    await sql`DELETE FROM games WHERE game_id = ${gameId}`

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json({ success: false, error: "Failed to delete game" }, { status: 500 })
  }
}
