import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    // Remove duplicates by using DISTINCT ON with proper ordering
    const packages = await sql`
      SELECT DISTINCT ON (game_id, diamonds, price) 
        id, game_id, diamonds, price, bonus, is_active, created_at, updated_at
      FROM game_packages 
      ORDER BY game_id, diamonds, price, id ASC
    `

    return NextResponse.json({
      success: true,
      packages,
    })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { game_id, diamonds, price, bonus, is_active } = await request.json()

    // Check if package with same game_id, diamonds, and price already exists
    const existing = await sql`
      SELECT id FROM game_packages 
      WHERE game_id = ${game_id} AND diamonds = ${diamonds} AND price = ${price}
      LIMIT 1
    `

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Package with same game, diamonds, and price already exists",
        },
        { status: 400 },
      )
    }

    const result = await sql`
      INSERT INTO game_packages (game_id, diamonds, price, bonus, is_active)
      VALUES (${game_id}, ${diamonds}, ${price}, ${bonus}, ${is_active})
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      package: result[0],
    })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json({ success: false, error: "Failed to create package" }, { status: 500 })
  }
}
