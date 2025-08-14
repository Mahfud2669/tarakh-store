"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import type { GamePackage, Game } from "@/lib/database"

interface PackagesTableProps {
  packages: GamePackage[]
  games: Game[]
  loading: boolean
  onEdit: (pkg: GamePackage) => void
  onDelete: (packageId: number) => void
}

export function PackagesTable({ packages, games, loading, onEdit, onDelete }: PackagesTableProps) {
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set())

  const getGameName = (gameId: string) => {
    const game = games.find((g) => g.game_id === gameId)
    return game?.name || gameId
  }

  const getGameImage = (gameId: string) => {
    const game = games.find((g) => g.game_id === gameId)
    return game?.image_url || "/placeholder.svg"
  }

  const getGameColor = (gameId: string) => {
    const game = games.find((g) => g.game_id === gameId)
    return game?.color || "bg-gradient-to-br from-gray-500 to-gray-600"
  }

  // Group packages by game
  const groupedPackages = packages.reduce(
    (acc, pkg) => {
      if (!acc[pkg.game_id]) {
        acc[pkg.game_id] = []
      }
      acc[pkg.game_id].push(pkg)
      return acc
    },
    {} as Record<string, GamePackage[]>,
  )

  // Sort packages within each game by diamonds
  Object.keys(groupedPackages).forEach((gameId) => {
    groupedPackages[gameId].sort((a, b) => a.diamonds - b.diamonds)
  })

  const toggleGameExpansion = (gameId: string) => {
    const newExpanded = new Set(expandedGames)
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId)
    } else {
      newExpanded.add(gameId)
    }
    setExpandedGames(newExpanded)
  }

  const expandAll = () => {
    setExpandedGames(new Set(Object.keys(groupedPackages)))
  }

  const collapseAll = () => {
    setExpandedGames(new Set())
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200"
          >
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
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Control Buttons */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Packages by Game</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={expandAll} className="bg-white">
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="bg-white">
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Grouped Packages */}
      <div className="divide-y divide-gray-200">
        {Object.entries(groupedPackages).map(([gameId, gamePackages]) => {
          const isExpanded = expandedGames.has(gameId)
          const activePackages = gamePackages.filter((pkg) => pkg.is_active).length
          const totalPackages = gamePackages.length

          return (
            <div key={gameId} className="bg-white">
              {/* Game Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                onClick={() => toggleGameExpansion(gameId)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getGameColor(gameId)}`}>
                      <Image
                        src={getGameImage(gameId) || "/placeholder.svg"}
                        alt={getGameName(gameId)}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{getGameName(gameId)}</h4>
                    <p className="text-sm text-gray-500">
                      {activePackages} active • {totalPackages} total packages
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {gamePackages.length} packages
                  </Badge>
                </div>
              </div>

              {/* Packages Table */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Diamonds</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Price</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Bonus</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Created</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {gamePackages.map((pkg, index) => (
                          <tr
                            key={pkg.id}
                            className={`bg-white hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-25"
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-semibold text-lg text-gray-900">
                                  {pkg.diamonds.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">{gameId === "ml" ? "💎" : "🪙"}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-gray-900">
                                Rp {pkg.price.toLocaleString("id-ID")}
                              </span>
                            </td>
                            <td className="p-3">
                              {pkg.bonus > 0 ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  +{pkg.bonus}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={pkg.is_active ? "default" : "secondary"}
                                className={pkg.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                              >
                                {pkg.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-gray-500">
                              {new Date(pkg.created_at).toLocaleDateString("id-ID")}
                            </td>
                            <td className="p-3">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onEdit(pkg)}
                                  className="bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDelete(pkg.id)}
                                  className="bg-white border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
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
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {Object.keys(groupedPackages).length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No packages found. Add some packages to get started.</p>
        </div>
      )}
    </div>
  )
}
