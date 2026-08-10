import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { name, image_url, color, is_active } = await request.json()
    const { gameId } = await params

    console.log(`Updating game ${gameId}:`, { name, image_url, color, is_active })

    const result = await sql`
      UPDATE games 
      SET name = ${name}, image_url = ${image_url}, color = ${color}, 
          is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
      WHERE game_id = ${gameId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 })
    }

    console.log(`Game ${gameId} updated successfully:`, result[0])

    return NextResponse.json({
      success: true,
      game: result[0],
      message: `Game ${is_active ? "activated" : "deactivated"} successfully`,
    })
  } catch (error) {
    console.error("Error updating game:", error)
    return NextResponse.json({ success: false, error: "Failed to update game" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { gameId: string } }) {
  try {
    const { gameId } = params

    // Check if game is active before deletion
    const gameCheck = await sql`
      SELECT is_active FROM games WHERE game_id = ${gameId}
    `

    if (gameCheck.length > 0 && gameCheck[0].is_active) {
      return NextResponse.json(
        { success: false, error: "Cannot delete active game. Please deactivate it first." },
        { status: 400 },
      )
    }

    // Check if game has packages
    const packageCheck = await sql`
      SELECT COUNT(*) as count FROM game_packages WHERE game_id = ${gameId}
    `

    if (packageCheck[0].count > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete game with existing packages. Please remove packages first." },
        { status: 400 },
      )
    }

    await sql`DELETE FROM games WHERE game_id = ${gameId}`

    return NextResponse.json({
      success: true,
      message: "Game deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json({ success: false, error: "Failed to delete game" }, { status: 500 })
  }
}
