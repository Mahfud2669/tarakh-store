import { type NextRequest, NextResponse } from "next/server"
import { getGamePackages } from "@/lib/database"

// Fallback packages function
function getFallbackPackages(gameId: string) {
  const mlPackages = [
    {
      id: 1,
      game_id: gameId,
      diamonds: 86,
      price: 20000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      game_id: gameId,
      diamonds: 172,
      price: 40000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      game_id: gameId,
      diamonds: 257,
      price: 60000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      game_id: gameId,
      diamonds: 344,
      price: 80000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      game_id: gameId,
      diamonds: 429,
      price: 100000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      game_id: gameId,
      diamonds: 514,
      price: 120000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  const defaultPackages = [
    {
      id: 1,
      game_id: gameId,
      diamonds: 100,
      price: 25000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      game_id: gameId,
      diamonds: 200,
      price: 50000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      game_id: gameId,
      diamonds: 300,
      price: 75000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      game_id: gameId,
      diamonds: 500,
      price: 125000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      game_id: gameId,
      diamonds: 1000,
      price: 250000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      game_id: gameId,
      diamonds: 2000,
      price: 500000,
      bonus: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  return gameId === "ml" ? mlPackages : defaultPackages
}

export async function GET(request: NextRequest, { params }: { params: { gameId: string } }) {
  console.log("=== PACKAGES API ROUTE ===")

  try {
    const { gameId } = params
    console.log("Game ID:", gameId)

    if (!gameId) {
      console.error("Missing gameId parameter")
      return NextResponse.json(
        {
          success: false,
          error: "Game ID is required",
          packages: [],
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Try to get packages from database first
    let packages
    let databaseStatus = "connected"
    let message = "Data from database"

    try {
      console.log("Attempting to fetch from database...")
      packages = await getGamePackages(gameId)
      console.log("Database packages fetched:", packages?.length || 0)

      // Check if we got valid packages
      if (!packages || packages.length === 0) {
        console.log("No packages found in database, using fallback")
        packages = getFallbackPackages(gameId)
        databaseStatus = "empty"
        message = "No packages in database, using fallback"
      } else {
        console.log("✅ Database packages loaded successfully")
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
      packages = getFallbackPackages(gameId)
      databaseStatus = "error"
      message = "Database connection failed, using fallback data"
    }

    // Ensure we always have packages
    if (!packages || packages.length === 0) {
      console.log("No packages available, creating default fallback")
      packages = getFallbackPackages(gameId)
      databaseStatus = "fallback"
      message = "Using default fallback packages"
    }

    console.log("Final packages count:", packages.length)
    console.log("Database status:", databaseStatus)

    return NextResponse.json(
      {
        success: true,
        packages,
        database_status: databaseStatus,
        message: message,
        count: packages.length,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("=== PACKAGES API ERROR ===")
    console.error("Error details:", error)

    // Always return valid JSON with fallback data, never throw 500
    const fallbackPackages = getFallbackPackages(params?.gameId || "ml")

    return NextResponse.json(
      {
        success: true, // Return success with fallback data
        packages: fallbackPackages,
        database_status: "error",
        message: "API error, using fallback data",
        error: error instanceof Error ? error.message : "Unknown error",
        count: fallbackPackages.length,
      },
      {
        status: 200, // Always return 200 with fallback data
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
