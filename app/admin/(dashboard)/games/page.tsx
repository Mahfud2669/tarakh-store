"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GamesTable } from "@/components/admin/games-table"
import { GameForm } from "@/components/admin/game-form"
import { Plus, Search, Filter, Gamepad2, Eye, EyeOff } from "lucide-react"

interface Game {
  id: number
  name: string
  description: string
  icon_url: string
  image_url?: string
  is_active: boolean
  created_at: string
  package_count?: number
}

interface GameStats {
  totalGames: number
  activeGames: number
  inactiveGames: number
  totalPackages: number
}

export default function GamesManagement() {
  const [games, setGames] = useState<Game[]>([])
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    activeGames: 0,
    inactiveGames: 0,
    totalPackages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchGames = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/games")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setGames(data.games)

          // Calculate stats
          const totalGames = data.games.length
          const activeGames = data.games.filter((g: Game) => g.is_active).length
          const inactiveGames = totalGames - activeGames
          const totalPackages = data.games.reduce((sum: number, g: Game) => sum + (g.package_count || 0), 0)

          setStats({
            totalGames,
            activeGames,
            inactiveGames,
            totalPackages,
          })
        }
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

  const handleFormClose = () => {
    setShowForm(false)
    setEditingGame(null)
    fetchGames()
  }

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && game.is_active) ||
      (statusFilter === "inactive" && !game.is_active)

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Games Management</h1>
          <p className="text-gray-600 mt-1">Kelola game dan paket yang tersedia</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Game
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Total Games</p>
                <p className="text-3xl font-bold text-teal-900">{stats.totalGames}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Games</p>
                <p className="text-3xl font-bold text-green-900">{stats.activeGames}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Inactive Games</p>
                <p className="text-3xl font-bold text-red-900">{stats.inactiveGames}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Packages</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalPackages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-teal-200">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200">
          <CardTitle className="text-teal-800 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Games
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari nama game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-teal-200 focus:border-teal-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card className="border-teal-200">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200">
          <CardTitle className="text-teal-800 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Games List ({filteredGames.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <GamesTable games={filteredGames} onEdit={handleEdit} />
          </div>
        </CardContent>
      </Card>

      {/* Game Form Modal */}
      {showForm && <GameForm game={editingGame} onClose={handleFormClose} />}
    </div>
  )
}
