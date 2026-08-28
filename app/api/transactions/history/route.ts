import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  const transactionId = request.nextUrl.searchParams.get("transactionId")?.trim()
  const userId = request.nextUrl.searchParams.get("userId")?.trim()
  if (!transactionId && !userId) return NextResponse.json({ error: "Transaksi ID wajib diisi" }, { status: 400 })

  try {
    const transactions = transactionId
      ? await sql`
          SELECT * FROM transactions
          WHERE order_id = ${transactionId}
          ORDER BY created_at DESC
          LIMIT 1
        `
      : await sql`
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
