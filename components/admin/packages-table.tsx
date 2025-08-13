"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import type { GamePackage, Game } from "@/lib/database"

interface PackagesTableProps {
  packages: GamePackage[]
  games: Game[]
  loading: boolean
  onEdit: (pkg: GamePackage) => void
  onDelete: (packageId: number) => void
}

export function PackagesTable({ packages, games, loading, onEdit, onDelete }: PackagesTableProps) {
  const getGameName = (gameId: string) => {
    const game = games.find((g) => g.game_id === gameId)
    return game?.name || gameId
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
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
            <th className="text-left p-4">Diamonds</th>
            <th className="text-left p-4">Price</th>
            <th className="text-left p-4">Bonus</th>
            <th className="text-left p-4">Status</th>
            <th className="text-right p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <div>
                  <p className="font-medium">{getGameName(pkg.game_id)}</p>
                  <p className="text-sm text-gray-500">{pkg.game_id}</p>
                </div>
              </td>
              <td className="p-4">
                <span className="font-mono">{pkg.diamonds}</span>
              </td>
              <td className="p-4">
                <span className="font-medium">Rp {pkg.price.toLocaleString("id-ID")}</span>
              </td>
              <td className="p-4">
                {pkg.bonus > 0 ? (
                  <Badge variant="secondary">+{pkg.bonus}</Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="p-4">
                <Badge variant={pkg.is_active ? "default" : "secondary"}>{pkg.is_active ? "Active" : "Inactive"}</Badge>
              </td>
              <td className="p-4">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(pkg)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(pkg.id)}>
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
