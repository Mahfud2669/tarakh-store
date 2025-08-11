"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { TopUpModal } from "./topup-modal"
import type { Game } from "@/lib/database"

export function GameGrid() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
          setGames(result.games)
          setError(null)
        } else {
          throw new Error(result.error || "Failed to fetch games")
        }
      } catch (error) {
        console.error("Error fetching games:", error)
        setError(error instanceof Error ? error.message : "Unknown error")

        // Use fallback data if API fails
        setGames(getFallbackGames())
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

  const handleGameClick = (game: Game) => {
    setSelectedGame(game)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Memuat Game...</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[...Array(10)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4 text-center">
                  <div className="w-20 h-20 bg-gray-300 rounded-xl mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 animate-fade-in">
            Pilih Game Favorit Anda
          </h3>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-yellow-800 text-sm text-center">⚠️ Menggunakan data fallback: {error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {games.map((game, index) => (
              <Card
                key={game.game_id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-scale-in border-0 shadow-md"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleGameClick(game)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-20 h-20 ${game.color || "bg-gradient-to-br from-gray-500 to-gray-600"} rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg`}
                  >
                    <Image
                      src={game.image_url || "/placeholder.svg"}
                      alt={game.name}
                      width={48}
                      height={48}
                      className="rounded-lg"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-800 leading-tight">{game.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <TopUpModal game={selectedGame} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
