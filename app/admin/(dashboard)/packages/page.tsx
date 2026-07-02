"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PackagesTable } from "@/components/admin/packages-table"
import { PackageForm } from "@/components/admin/package-form"
import { Plus, Search, Filter, Package, DollarSign, Gamepad2 } from "lucide-react"
import type { GamePackage, Game } from "@/lib/database"

export default function PackagesManagement() {
  const [packages, setPackages] = useState<GamePackage[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [gameFilter, setGameFilter] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<GamePackage | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [packagesRes, gamesRes] = await Promise.all([fetch("/api/admin/packages"), fetch("/api/admin/games")])

      const packagesData = await packagesRes.json()
      const gamesData = await gamesRes.json()

      if (packagesData.success) setPackages(packagesData.packages)
      if (gamesData.success) setGames(gamesData.games)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = (pkg: GamePackage) => {
    setEditingPackage(pkg)
    setShowForm(true)
  }

  const handleDelete = async (packageId: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting package:", error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPackage(null)
    fetchData()
  }

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.diamonds.toString().includes(searchTerm) || pkg.price.toString().includes(searchTerm)
    const matchesGame = gameFilter === "all" || pkg.game_id === gameFilter
    return matchesSearch && matchesGame
  })

  // Calculate stats
  const totalPackages = packages.length
  const activePackages = packages.filter((pkg) => pkg.is_active).length
  const totalValue = packages.reduce((sum, pkg) => sum + pkg.price, 0)
  const gamesWithPackages = new Set(packages.map((pkg) => pkg.game_id)).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Packages Management</h1>
          <p className="text-gray-600 mt-1">Kelola paket top-up untuk semua game</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Package
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Total Packages</p>
                <p className="text-3xl font-bold text-teal-900">{totalPackages}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Packages</p>
                <p className="text-3xl font-bold text-green-900">{activePackages}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Games Covered</p>
                <p className="text-3xl font-bold text-blue-900">{gamesWithPackages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Value</p>
                <p className="text-2xl font-bold text-purple-900">Rp {(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-800">Filter Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari berdasarkan diamonds atau harga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="w-48 border-teal-200 focus:border-teal-500">
                  <SelectValue placeholder="Filter Game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Game</SelectItem>
                  {games.map((game) => (
                    <SelectItem key={game.game_id} value={game.game_id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Table */}
      <Card className="border-teal-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200">
          <CardTitle className="text-teal-800">
            Packages List ({filteredPackages.length} dari {totalPackages})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PackagesTable
            packages={filteredPackages}
            games={games}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Package Form Modal */}
      {showForm && <PackageForm package={editingPackage} games={games} onClose={handleFormClose} />}
    </div>
  )
}
