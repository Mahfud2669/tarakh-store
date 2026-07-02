import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/auth"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get total revenue and transactions
    const totalStatsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(DISTINCT user_id) as total_users
      FROM game_transactions 
      WHERE created_at >= $1 AND created_at <= $2
    `
    const totalStats = await query(totalStatsQuery, [startDate.toISOString(), endDate.toISOString()])

    // Get popular games
    const popularGamesQuery = `
      SELECT 
        game_name,
        COUNT(*) as transaction_count,
        COALESCE(SUM(amount), 0) as revenue
      FROM game_transactions 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY game_name
      ORDER BY revenue DESC
      LIMIT 10
    `
    const popularGames = await query(popularGamesQuery, [startDate.toISOString(), endDate.toISOString()])

    // Get monthly revenue (last 6 months)
    const monthlyRevenueQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as transactions,
        COALESCE(SUM(amount), 0) as revenue
      FROM game_transactions 
      WHERE created_at >= $1
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const monthlyRevenue = await query(monthlyRevenueQuery, [sixMonthsAgo.toISOString()])

    // Get status distribution
    const statusStatsQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as revenue
      FROM game_transactions 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY status
    `
    const statusStats = await query(statusStatsQuery, [startDate.toISOString(), endDate.toISOString()])

    // Calculate success rate
    const successTransactions = statusStats.rows.find((s) => s.status === "success")?.count || 0
    const totalTransactions = totalStats.rows[0]?.total_transactions || 0
    const successRate = totalTransactions > 0 ? ((successTransactions / totalTransactions) * 100).toFixed(1) : 0

    // Calculate average transaction value
    const avgTransaction = totalTransactions > 0 ? Math.round(totalStats.rows[0]?.total_revenue / totalTransactions) : 0

    const analytics = {
      totalRevenue: Number.parseInt(totalStats.rows[0]?.total_revenue || 0),
      totalTransactions: Number.parseInt(totalStats.rows[0]?.total_transactions || 0),
      totalUsers: Number.parseInt(totalStats.rows[0]?.total_users || 0),
      avgTransaction: avgTransaction,
      successRate: Number.parseFloat(successRate),
      popularGames: popularGames.rows.map((game) => ({
        game_name: game.game_name,
        transaction_count: Number.parseInt(game.transaction_count),
        revenue: Number.parseInt(game.revenue),
      })),
      monthlyRevenue: monthlyRevenue.rows
        .map((month) => ({
          month: month.month,
          transactions: Number.parseInt(month.transactions),
          revenue: Number.parseInt(month.revenue),
        }))
        .reverse(),
      statusDistribution: statusStats.rows.map((status) => ({
        status: status.status,
        count: Number.parseInt(status.count),
        revenue: Number.parseInt(status.revenue),
      })),
    }

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
