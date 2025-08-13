import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const games = await sql`
      SELECT * FROM games 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      games,
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch games" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { game_id, name, image_url, color, is_active } = await request.json()

    const result = await sql`
      INSERT INTO games (game_id, name, image_url, color, is_active)
      VALUES (${game_id}, ${name}, ${image_url}, ${color}, ${is_active})
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      game: result[0],
    })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ success: false, error: "Failed to create game" }, { status: 500 })
  }
}
