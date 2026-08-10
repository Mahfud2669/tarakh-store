"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GamesTable } from "@/components/admin/games-table"
import { GameForm } from "@/components/admin/game-form"
import { Plus } from "lucide-react"
import type { Game } from "@/lib/database"

export default function GamesManagement() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/admin/games")
      const data = await response.json()
      if (data.success) {
        setGames(data.games)
      }
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const handleEdit = (game: Game) => {
    setEditingGame(game)
    setShowForm(true)
  }

  const handleDelete = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return

    try {
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchGames()
      }
    } catch (error) {
      console.error("Error deleting game:", error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingGame(null)
    fetchGames()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Games Management</h2>
          <p className="text-muted-foreground">Manage available games for top-up</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Game
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Games</CardTitle>
        </CardHeader>
        <CardContent>
          <GamesTable games={games} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        </CardContent>
      </Card>

      {showForm && <GameForm game={editingGame} onClose={handleFormClose} />}
    </div>
  )
}
