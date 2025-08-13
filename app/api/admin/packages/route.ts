import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const packages = await sql`
      SELECT * FROM game_packages 
      ORDER BY game_id, diamonds ASC
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
