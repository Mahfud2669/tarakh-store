import { NextResponse } from "next/server"
import { getGames } from "@/lib/database"

// Simple fallback function without database dependency
function getFallbackGames() {
  return [
    {
      id: 1,
      game_id: "ml",
      name: "Mobile Legends",
      image_url: "/generic-moba-icon.png",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      game_id: "pubg",
      name: "PUBG Mobile",
      image_url: "/generic-battle-royale-icon.png",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      game_id: "freefire",
      name: "Free Fire",
      image_url: "/generic-battle-royale-icon.png",
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      game_id: "genshin",
      name: "Genshin Impact",
      image_url: "/genshin-impact-game-icon.png",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      game_id: "valorant",
      name: "Valorant",
      image_url: "/valorant-icon.png",
      color: "bg-gradient-to-br from-red-500 to-red-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      game_id: "fortnite",
      name: "Fortnite",
      image_url: "/generic-battle-royale-icon.png",
      color: "bg-gradient-to-br from-blue-400 to-blue-500",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 7,
      game_id: "cod",
      name: "Call of Duty",
      image_url: "/codm-game-icon.png",
      color: "bg-gradient-to-br from-gray-700 to-gray-800",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 8,
      game_id: "wildrift",
      name: "Wild Rift",
      image_url: "/placeholder-wfp7q.png",
      color: "bg-gradient-to-br from-blue-600 to-blue-700",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 9,
      game_id: "clash",
      name: "Clash of Clans",
      image_url: "/fantasy-game-icon.png",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 10,
      game_id: "among",
      name: "Among Us",
      image_url: "/among-us-icon.png",
      color: "bg-gradient-to-br from-red-400 to-red-500",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]
}

export async function GET() {
  try {
    console.log("=== GAMES API REQUEST ===")

    // Try to get games from database first
    let games
    let databaseStatus = "connected"
    let message = "Data from database"

    try {
      games = await getGames()
      console.log("Database games fetched:", games.length)

      // Check if we got fallback data by checking if all games have sequential IDs
      const isFallback = games.every((game, index) => game.id === index + 1)
      if (isFallback && games.length === 10) {
        databaseStatus = "fallback"
        message = "Using fallback data - database connection issue"
      }
    } catch (dbError) {
      console.log("Database error, using fallback:", dbError)
      games = getFallbackGames()
      databaseStatus = "error"
      message = "Database connection failed, using fallback data"
    }

    // If no games from database, use fallback
    if (!games || games.length === 0) {
      console.log("No games found, using fallback")
      games = getFallbackGames()
      databaseStatus = "empty"
      message = "No data in database, using fallback"
    }

    console.log("Games returned successfully:", games.length)

    return NextResponse.json({
      success: true,
      games,
      database_status: databaseStatus,
      message: message,
    })
  } catch (error) {
    console.error("Error in games API:", error)

    // Always return valid JSON with fallback data
    return NextResponse.json({
      success: true, // Return success with fallback data
      games: getFallbackGames(),
      database_status: "error",
      message: "API error, using fallback data",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
