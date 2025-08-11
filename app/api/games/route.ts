import { NextResponse } from "next/server"
import { getGames } from "@/lib/database"

export async function GET() {
  try {
    console.log("=== GAMES API REQUEST ===")
    const games = await getGames()
    console.log("Games fetched successfully:", games.length)

    return NextResponse.json({
      success: true,
      games,
    })
  } catch (error) {
    console.error("Error in games API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch games",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
