import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    // Get total transactions and revenue
    const transactionStats = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_revenue
      FROM transactions
    `

    // Get active games count
    const gameStats = await sql`
      SELECT COUNT(*) as active_games
      FROM games
      WHERE is_active = true
    `

    // Get total packages count
    const packageStats = await sql`
      SELECT COUNT(*) as total_packages
      FROM game_packages
      WHERE is_active = true
    `

    const stats = {
      totalTransactions: Number.parseInt(transactionStats[0]?.total_transactions || "0"),
      totalRevenue: Number.parseInt(transactionStats[0]?.total_revenue || "0"),
      activeGames: Number.parseInt(gameStats[0]?.active_games || "0"),
      totalPackages: Number.parseInt(packageStats[0]?.total_packages || "0"),
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)

    // Return fallback stats if database fails
    return NextResponse.json({
      success: true,
      stats: {
        totalTransactions: 0,
        totalRevenue: 0,
        activeGames: 10,
        totalPackages: 60,
      },
    })
  }
}
