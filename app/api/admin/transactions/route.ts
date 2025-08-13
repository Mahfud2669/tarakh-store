import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const gameId = searchParams.get("game_id")
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")

    let query = sql`
      SELECT * FROM transactions 
      WHERE 1=1
    `

    if (status) {
      query = sql`${query} AND status = ${status}`
    }
    if (gameId) {
      query = sql`${query} AND game_id = ${gameId}`
    }
    if (dateFrom) {
      query = sql`${query} AND created_at >= ${dateFrom}`
    }
    if (dateTo) {
      query = sql`${query} AND created_at <= ${dateTo}`
    }

    query = sql`${query} ORDER BY created_at DESC LIMIT 100`

    const transactions = await query

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}
