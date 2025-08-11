import { type NextRequest, NextResponse } from "next/server"
import { getGamePackages } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params
    console.log("=== PACKAGES API REQUEST ===")
    console.log("Game ID:", gameId)

    const packages = await getGamePackages(gameId)
    console.log("Packages fetched successfully:", packages.length)

    return NextResponse.json({
      success: true,
      packages,
    })
  } catch (error) {
    console.error("Error in game packages API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch game packages",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
