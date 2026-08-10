import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")?.trim()
  if (!userId) return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 })

  try {
    const transactions = await sql`
      SELECT * FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `
    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Transaction history error:", error)
    return NextResponse.json({ error: "Riwayat transaksi tidak dapat dimuat" }, { status: 500 })
  }
}
