import { NextResponse } from "next/server"
import { getAllTransactions } from "@/lib/database"

export async function GET() {
  try {
    console.log("=== TRANSACTIONS API REQUEST ===")
    const transactions = await getAllTransactions()
    console.log("Transactions fetched successfully:", transactions.length)

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    })
  } catch (error) {
    console.error("Error in transactions API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
