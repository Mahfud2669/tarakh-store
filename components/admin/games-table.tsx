"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

interface Game {
  id: number
  name: string
  description: string
  icon_url: string
  is_active: boolean
  created_at: string
  package_count?: number
}

interface GamesTableProps {
  games: Game[]
  loading: boolean
  onEdit: (game: Game) => void
  onRefresh: () => void
}

export function GamesTable({ games, loading, onEdit, onRefresh }: GamesTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (gameId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus game ini?")) {
      return
    }

    try {
      setDeletingId(gameId)
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onRefresh()
      } else {
        const error = await response.json()
        alert("Gagal menghapus game: " + error.error)
      }
    } catch (error) {
      console.error("Error deleting game:", error)
      alert("Terjadi kesalahan saat menghapus game")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada game</h3>
        <p className="text-gray-500">Belum ada game yang ditambahkan ke sistem.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-4 font-medium text-gray-900">Game</th>
            <th className="text-left p-4 font-medium text-gray-900">Description</th>
            <th className="text-left p-4 font-medium text-gray-900">Status</th>
            <th className="text-left p-4 font-medium text-gray-900">Packages</th>
            <th className="text-left p-4 font-medium text-gray-900">Created</th>
            <th className="text-right p-4 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {games.map((game) => (
            <tr
              key={game.id}
              className={`transition-colors ${
                game.is_active ? "bg-green-50 hover:bg-green-100" : "bg-red-50 hover:bg-red-100"
              }`}
            >
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={game.icon_url || "/placeholder.svg"}
                      alt={game.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        game.is_active ? "bg-gray-400" : "bg-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{game.name}</p>
                    <p className="text-sm text-gray-500">ID: {game.id}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <p className="text-sm text-gray-600 max-w-xs truncate">{game.description || "Tidak ada deskripsi"}</p>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  {game.is_active ? (
                    <>
                      <Eye className="w-4 h-4 text-green-600" />
                      <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-red-600" />
                      <Badge className="bg-red-100 text-red-800 border-red-200">Nonaktif</Badge>
                    </>
                  )}
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm font-medium text-gray-900">{game.package_count || 0} packages</span>
              </td>
              <td className="p-4">
                <span className="text-sm text-gray-500">{new Date(game.created_at).toLocaleDateString("id-ID")}</span>
              </td>
              <td className="p-4">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(game)}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(game.id)}
                    disabled={deletingId === game.id}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                  >
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
