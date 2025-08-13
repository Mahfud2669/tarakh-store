"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import type { Game } from "@/lib/database"

interface GamesTableProps {
  games: Game[]
  loading: boolean
  onEdit: (game: Game) => void
  onDelete: (gameId: string) => void
}

export function GamesTable({ games, loading, onEdit, onDelete }: GamesTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
            <div className="w-12 h-12 bg-gray-300 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Game</th>
            <th className="text-left p-4">Game ID</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Created</th>
            <th className="text-right p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden">
                    <Image
                      src={game.image_url || "/placeholder.svg"}
                      alt={game.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{game.name}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{game.game_id}</code>
              </td>
              <td className="p-4">
                <Badge variant={game.is_active ? "default" : "secondary"}>
                  {game.is_active ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="p-4 text-sm text-gray-500">{new Date(game.created_at).toLocaleDateString()}</td>
              <td className="p-4">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(game)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(game.game_id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
