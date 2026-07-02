"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { Game } from "@/lib/database"

export function GameGrid() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGames() {
      try {
        console.log("Fetching games from API...")
        const response = await fetch("/api/games")

        console.log("Response status:", response.status)
        console.log("Response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text.substring(0, 200))
          throw new Error("Server returned non-JSON response")
        }

        const result = await response.json()
        console.log("API Response:", result)

        if (result.success && result.games) {
          // Filter only active games for frontend display
          const activeGames = result.games.filter((game: Game) => game.is_active)
          setGames(activeGames)
          console.log(`Showing ${activeGames.length} active games out of ${result.games.length} total games`)

          // Only show error if database status indicates a real problem
          if (result.database_status === "error" || result.database_status === "fallback") {
            setError("Koneksi database bermasalah")
          } else {
            setError(null) // Clear error if database is working
          }
        } else {
          throw new Error(result.error || "Failed to fetch games")
        }
      } catch (error) {
        console.error("Error fetching games:", error)
        setError(error instanceof Error ? error.message : "Unknown error")

        // Use fallback data if API fails (only active games)
        const fallbackGames = getFallbackGames().filter((game) => game.is_active)
        setGames(fallbackGames)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  // Fallback games data
  function getFallbackGames(): Game[] {
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



  if (loading) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Memuat Game...</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
            {[...Array(10)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-xl mx-auto mb-2 sm:mb-3"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Show message if no active games
  if (games.length === 0) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-gray-800">Game Sedang Dalam Maintenance</h3>
          <p className="text-gray-600 mb-8">
            Mohon maaf, saat ini tidak ada game yang tersedia. Silakan coba lagi nanti.
          </p>
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-yellow-800 text-sm">⚠️ {error}</p>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800 animate-fade-in">
            Pilih Game Favorit Anda
          </h3>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-yellow-800 text-sm text-center">⚠️ Menggunakan data fallback: {error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
            {games.map((game, index) => (
              <Link key={game.game_id} href={`/game/${game.game_id}`}>
                <Card
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-scale-in border-0 shadow-md h-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 ${game.color || "bg-gradient-to-br from-gray-500 to-gray-600"} rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-lg`}
                    >
                      <Image
                        src={game.image_url || "/placeholder.svg"}
                        alt={game.name}
                        width={40}
                        height={40}
                        className="sm:w-12 sm:h-12 rounded-lg"
                      />
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-800 leading-tight">{game.name}</h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
